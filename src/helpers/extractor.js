const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { parse } = require('csv-parse/sync');
const XLSX = require('xlsx');

async function extractTextFromFile(filePath, mimeType) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);

  if (mimeType === 'application/pdf') {
    const data = await pdf(fileBuffer);
    return data.text || '';
  } 
  
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    return result.value || '';
  } 
  
  if (mimeType === 'text/plain') {
    return fileBuffer.toString('utf-8');
  } 
  
  if (mimeType === 'text/csv' || mimeType === 'application/csv') {
    const csvData = fileBuffer.toString('utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Convert CSV rows into a text representation
    return records.map((row, idx) => {
      return `Row ${idx + 1}: ${Object.entries(row).map(([k, v]) => `${k} is ${v}`).join(', ')}`;
    }).join('\n');
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel' ||
    filePath.endsWith('.xlsx') ||
    filePath.endsWith('.xls')
  ) {
    const workbook = XLSX.readFileSync(filePath);
    let fullText = '';
    
    workbook.SheetNames.forEach(sheetName => {
      const sheet = workbook.Sheets[sheetName];
      const csvContent = XLSX.utils.sheet_to_csv(sheet);
      if (csvContent && csvContent.trim()) {
        fullText += `[Sheet: ${sheetName}]\n${csvContent.trim()}\n\n`;
      }
    });

    return fullText || 'No readable text content in Excel file.';
  }

  if (mimeType.startsWith('image/')) {
    // Standard mock OCR response for demo purposes, 
    // or we can write a simple mock text extraction
    return `[OCR Extracted Text from Image ${filePath}]: The inspection report indicates that the plumber completed the installation of the PVC drain pipes. The master bathroom floor has minor moisture damage. General contractor is advised to inspect the plumbing vents before closing the ceiling.`;
  }

  throw new Error(`Unsupported file type: ${mimeType}`);
}

module.exports = {
  extractTextFromFile
};
