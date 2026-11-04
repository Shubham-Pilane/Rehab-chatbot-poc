// Polyfill web streams & crypto for Node 16 AWS SDK v3 support
if (!global.TransformStream) {
  try {
    const { TransformStream, ReadableStream, WritableStream } = require('stream/web');
    global.TransformStream = TransformStream;
    global.ReadableStream = ReadableStream;
    global.WritableStream = WritableStream;
  } catch (e) {}
}
if (!global.crypto) {
  try {
    global.crypto = require('crypto').webcrypto;
  } catch (e) {}
}

const {
  BedrockAgentCoreClient,
  InvokeHarnessCommand
} = require('@aws-sdk/client-bedrock-agentcore');
const {
  BedrockRuntimeClient,
  ConverseCommand
} = require('@aws-sdk/client-bedrock-runtime');

class BedrockService {
  constructor() {
    this.region = process.env.AWS_REGION || 'ap-southeast-2';
    this.harnessArn = process.env.BEDROCK_HARNESS_ARN;
    this.modelId = process.env.BEDROCK_MODEL_ID || 'global.amazon.nova-2-lite-v1:0';

    const credentials = (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    } : undefined;

    const clientConfig = { region: this.region };
    if (credentials) clientConfig.credentials = credentials;

    this.agentCoreClient = new BedrockAgentCoreClient(clientConfig);
    this.runtimeClient = new BedrockRuntimeClient(clientConfig);
  }

  isConfigured() {
    return Boolean(
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );
  }

  isHarnessConfigured() {
    return Boolean(this.isConfigured() && this.harnessArn);
  }

  /**
   * OPTION A: Send message to Bedrock AgentCore Harness (rehab_management_agent)
   * The AgentCore Harness orchestrates reasoning, tool calling (via Gateway & Lambda), and answers.
   */
  async sendMessage(sessionId, userMessage) {
    const startTime = Date.now();

    if (!this.harnessArn) {
      throw new Error('BEDROCK_HARNESS_ARN is not configured in .env');
    }

    // AgentCore requires runtimeSessionId length to be >= 33 characters (standard UUID)
    let validSessionId = String(sessionId || '');
    if (validSessionId.length < 33) {
      const crypto = require('crypto');
      validSessionId = `${crypto.createHash('md5').update(validSessionId || 'default').digest('hex')}-session`;
    }

    const command = new InvokeHarnessCommand({
      harnessArn: this.harnessArn,
      runtimeSessionId: validSessionId,
      messages: [
        {
          role: 'user',
          content: [{ text: userMessage }]
        }
      ]
    });

    const response = await this.agentCoreClient.send(command);
    let fullText = '';

    // Collect streaming delta chunks from the Bedrock AgentCore stream
    for await (const chunk of response.stream) {
      if (chunk.contentBlockDelta?.delta?.text) {
        fullText += chunk.contentBlockDelta.delta.text;
      } else if (chunk.runtimeClientError) {
        console.error('AgentCore runtime error:', chunk.runtimeClientError.message);
        throw new Error(chunk.runtimeClientError.message);
      }
    }

    const latencyMs = Date.now() - startTime;
    const tokensPrompt = Math.ceil(userMessage.length / 4);
    const tokensCompletion = Math.ceil(fullText.length / 4);

    return {
      text: fullText,
      tokensPrompt,
      tokensCompletion,
      tokensTotal: tokensPrompt + tokensCompletion,
      latencyMs,
      model: 'Amazon Nova 2 Lite (Bedrock AgentCore)'
    };
  }

  /**
   * OPTION B: Conversational natural-language response using Bedrock Runtime
   */
  async generateChatResponse(systemPrompt, userPrompt, temperature = 0.2) {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      throw new Error('AWS credentials are not configured in .env');
    }

    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        system: [{ text: systemPrompt }],
        messages: [
          {
            role: 'user',
            content: [{ text: userPrompt }]
          }
        ],
        inferenceConfig: {
          temperature
        }
      });

      const response = await this.runtimeClient.send(command);
      const text = response.output?.message?.content?.[0]?.text || '';
      const latencyMs = Date.now() - startTime;

      const tokensPrompt = response.usage?.inputTokens || Math.ceil((systemPrompt.length + userPrompt.length) / 4);
      const tokensCompletion = response.usage?.outputTokens || Math.ceil(text.length / 4);

      return {
        text,
        tokensPrompt,
        tokensCompletion,
        tokensTotal: tokensPrompt + tokensCompletion,
        latencyMs,
        model: `${this.modelId} (Bedrock Runtime)`
      };
    } catch (err) {
      console.error('❌ Bedrock generateChatResponse error:', err.message);
      throw err;
    }
  }

  /**
   * OPTION B: Structured JSON generation using Bedrock Runtime
   */
  async generateJsonResponse(systemPrompt, userPrompt, schemaName = '') {
    if (!this.isConfigured()) {
      throw new Error('AWS credentials are not configured in .env');
    }

    const jsonSystemInstruction = `${systemPrompt}\n\nIMPORTANT: Respond ONLY with a valid, parseable JSON object matching the requested schema. Do not output markdown code blocks (\`\`\`json) or any explanation. Output raw JSON only.`;

    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        system: [{ text: jsonSystemInstruction }],
        messages: [
          {
            role: 'user',
            content: [{ text: userPrompt }]
          }
        ],
        inferenceConfig: {
          temperature: 0.1
        }
      });

      const response = await this.runtimeClient.send(command);
      let text = response.output?.message?.content?.[0]?.text || '';

      let cleanText = text.trim();
      if (cleanText.startsWith('```json')) {
        cleanText = cleanText.substring(7);
      } else if (cleanText.startsWith('```')) {
        cleanText = cleanText.substring(3);
      }
      if (cleanText.endsWith('```')) {
        cleanText = cleanText.substring(0, cleanText.length - 3);
      }
      cleanText = cleanText.trim();

      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        cleanText = cleanText.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(cleanText);
    } catch (err) {
      console.error(`❌ Bedrock generateJsonResponse error [schema=${schemaName}]:`, err.message);
      throw err;
    }
  }
}

module.exports = new BedrockService();
