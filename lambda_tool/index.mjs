import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: false,
  connectionTimeoutMillis: 10000
});

export const handler = async (event) => {
  console.log('Received event from Bedrock Agent:', JSON.stringify(event, null, 2));

  // Bedrock Agent / AgentCore passes tool arguments either in parameters, input, or event directly
  const toolName = event.toolName || event.actionGroup || event.action || (event.function ? event.function : 'unknown');
  const params = event.parameters || event.input || event;

  try {
    // =========================================================================
    // UNIVERSAL TOOL: Execute Read-Only PostgreSQL Query across ANY table
    // =========================================================================
    if (toolName === 'execute_sql' || toolName === 'run_sql_query' || params.query || params.sql) {
      let sql = (params.query || params.sql || '').trim();

      // Clean markdown code blocks if the LLM wrapped it in ```sql ... ```
      sql = sql.replace(/^```sql/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      if (sql.endsWith(';')) sql = sql.slice(0, -1).trim();

      if (!sql) {
        return { error: 'No SQL query provided in parameters.' };
      }

      const upperSql = sql.toUpperCase();

      // Safety Rule 1: Must be read-only (SELECT or WITH)
      if (!upperSql.startsWith('SELECT') && !upperSql.startsWith('WITH')) {
        return { error: 'Safety Violation: Only read-only SELECT queries are allowed.' };
      }

      // Safety Rule 2: Strictly block any mutation keywords
      const forbiddenKeywords = [
        'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE',
        'RENAME', 'CREATE', 'GRANT', 'REVOKE', 'REPLACE', 'UPSERT'
      ];
      for (const word of forbiddenKeywords) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        if (regex.test(sql)) {
          return { error: `Safety Violation: Forbidden keyword "${word}" is blocked.` };
        }
      }

      // Safety Rule 3: Auto-add safety LIMIT if query doesn't specify one
      if (!/LIMIT\s+\d+/i.test(sql)) {
        sql = `${sql} LIMIT 50`;
      }

      console.log('Executing Universal SQL Query:', sql);
      const res = await pool.query(sql);
      return res.rows.length > 0 
        ? res.rows 
        : { message: 'Query executed successfully. 0 rows returned.', rowCount: 0 };
    }

    // =========================================================================
    // SPECIFIC DOMAIN TOOL 1: Get Vendor Contact Details
    // =========================================================================
    if (toolName === 'get_vendor_contact' || params.vendorName) {
      const vendorName = params.vendorName || '';
      const query = `
        SELECT name, email, phone_number
        FROM vendor
        WHERE name ILIKE $1
        LIMIT 5;
      `;
      const res = await pool.query(query, [`%${vendorName}%`]);
      return res.rows.length > 0 
        ? res.rows 
        : { message: `No vendor found matching "${vendorName}"` };
    }

    // =========================================================================
    // SPECIFIC DOMAIN TOOL 2: Get Task Details by Task Group Title
    // =========================================================================
    if (toolName === 'get_task_group_details' || params.taskGroupTitle) {
      const groupTitle = params.taskGroupTitle || '';
      const query = `
        SELECT task.title, task.description, task.unit, task.quantity_type, task.price, task.price_type, task.notes
        FROM task
        JOIN task_group ON task.task_group_id = task_group.id
        WHERE task_group.title ILIKE $1
        LIMIT 20;
      `;
      const res = await pool.query(query, [`%${groupTitle}%`]);
      return res.rows.length > 0 
        ? res.rows 
        : { message: `No tasks found for task group "${groupTitle}"` };
    }

    // =========================================================================
    // SPECIFIC DOMAIN TOOL 3: Get Project Summary
    // =========================================================================
    if (toolName === 'get_project_summary' || params.projectNumber) {
      const projectNumber = params.projectNumber || '';
      const query = `
        SELECT p.project_number, p.status, p.project_state, p.hud_number,
               h.first_name || ' ' || h.last_name AS homeowner_name,
               a.street_address, a.city, a.state
        FROM project p
        LEFT JOIN home hm ON p.home_id = hm.id
        LEFT JOIN homeowner h ON hm.homeowner_id = h.id
        LEFT JOIN address a ON hm.address_id = a.id
        WHERE p.project_number ILIKE $1
        LIMIT 5;
      `;
      const res = await pool.query(query, [`%${projectNumber}%`]);
      return res.rows.length > 0 
        ? res.rows 
        : { message: `No project found with number "${projectNumber}"` };
    }

    // =========================================================================
    // SPECIFIC DOMAIN TOOL 4: Get Invoices
    // =========================================================================
    if (toolName === 'get_invoices') {
      const status = params.status || 'UNPAID';
      const query = `
        SELECT i.id, i.amount, i.status, i.due_date, i.invoice_date, v.name as vendor_name
        FROM invoice i
        JOIN vendor v ON i.vendor_id = v.id
        WHERE i.status ILIKE $1
        ORDER BY i.due_date ASC
        LIMIT 10;
      `;
      const res = await pool.query(query, [`%${status}%`]);
      return res.rows.length > 0 
        ? res.rows 
        : { message: `No invoices found with status "${status}"` };
    }

    return { error: `Unrecognized tool or parameters: ${toolName}` };
  } catch (error) {
    console.error('SQL Execution Error:', error);
    return { error: error.message };
  }
};
