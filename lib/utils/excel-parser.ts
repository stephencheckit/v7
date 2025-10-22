/**
 * Excel Parser Utility
 * Extracts questions, structure, and metadata from uploaded Excel files
 */

import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  title: string;
  questions: string[];
  schedule?: {
    type: 'daily' | 'weekly' | 'monthly' | 'recurring';
    days?: string[];
    shifts?: string[];
  };
  metadata: {
    totalRows: number;
    totalColumns: number;
    hasHeaders: boolean;
  };
}

export async function parseExcelFile(file: File): Promise<ParsedExcelData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON (array of arrays)
        const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        
        // Extract title (usually first row)
        const title = jsonData[0]?.[0]?.toString().trim() || 'Untitled Form';
        
        // Detect schedule pattern
        const schedule = detectSchedulePattern(jsonData);
        
        // Extract questions (rows after headers that have text in first column)
        const questions = extractQuestions(jsonData);
        
        // Build metadata
        const metadata = {
          totalRows: jsonData.length,
          totalColumns: jsonData[0]?.length || 0,
          hasHeaders: true,
        };
        
        resolve({
          title,
          questions,
          schedule,
          metadata,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsBinaryString(file);
  });
}

function detectSchedulePattern(data: any[][]): ParsedExcelData['schedule'] {
  // Look for day names in row 2
  const row2 = data[1]?.map(cell => cell?.toString().toLowerCase().trim()) || [];
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const foundDays = row2.filter(cell => dayNames.includes(cell));
  
  // Look for shift patterns (AM/PM) in row 4
  const row4 = data[3]?.map(cell => cell?.toString().toUpperCase().trim()) || [];
  const hasShifts = row4.some(cell => cell === 'AM' || cell === 'PM');
  
  if (foundDays.length >= 7 && hasShifts) {
    return {
      type: 'weekly',
      days: foundDays,
      shifts: ['AM', 'PM'],
    };
  }
  
  if (foundDays.length > 0) {
    return {
      type: 'weekly',
      days: foundDays,
    };
  }
  
  if (hasShifts) {
    return {
      type: 'daily',
      shifts: ['AM', 'PM'],
    };
  }
  
  return {
    type: 'daily',
  };
}

function extractQuestions(data: any[][]): string[] {
  const questions: string[] = [];
  const seenQuestions = new Set<string>();
  
  // Scan ALL rows and columns to find questions
  // Questions are typically longer text (> 20 chars) that appear in a column
  for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
    const row = data[rowIdx];
    if (!row) continue;
    
    for (let colIdx = 0; colIdx < row.length; colIdx++) {
      const cellValue = row[colIdx]?.toString().trim();
      
      // Skip if empty, too short, or already seen
      if (!cellValue || cellValue.length < 20 || seenQuestions.has(cellValue)) {
        continue;
      }
      
      // Skip if too long (likely an example or instruction, not a question)
      // Most real questions are under 150 characters
      if (cellValue.length > 200) {
        continue;
      }
      
      // Skip if it looks like an example (contains keywords like "Example:", "e.g.", "For instance")
      if (/^(example:|e\.g\.|for instance|note:|instruction:)/i.test(cellValue)) {
        continue;
      }
      
      // Skip if it looks like a header/title (all caps, or contains day names)
      const lowerValue = cellValue.toLowerCase();
      const isDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].some(day => lowerValue === day);
      const isShiftLabel = ['am', 'pm', 'shift', 'date'].includes(lowerValue);
      const isColumnHeader = cellValue.length < 30 && /^(column|row|shift|date|day)/i.test(cellValue);
      
      if (isDayName || isShiftLabel || isColumnHeader) {
        continue;
      }
      
      // This looks like a question - add it
      questions.push(cellValue);
      seenQuestions.add(cellValue);
    }
  }
  
  // Sort questions by their first appearance (top to bottom, left to right)
  return questions;
}

export function generateFormPrompt(parsedData: ParsedExcelData): string {
  let prompt = `I've uploaded an Excel checklist. Please build a form based on this data:\n\n`;
  prompt += `**Form Title:** ${parsedData.title}\n\n`;
  
  if (parsedData.schedule) {
    prompt += `**Schedule Type:** ${parsedData.schedule.type}\n`;
    if (parsedData.schedule.days) {
      prompt += `**Days:** ${parsedData.schedule.days.join(', ')}\n`;
    }
    if (parsedData.schedule.shifts) {
      prompt += `**Shifts:** ${parsedData.schedule.shifts.join(', ')}\n`;
    }
    prompt += `\n`;
  }
  
  prompt += `**Questions Found (${parsedData.questions.length} total):**\n`;
  parsedData.questions.forEach((q, i) => {
    // Sanitize question text - replace straight quotes with single quotes
    // This prevents JSON parsing issues when AI generates the form
    const sanitizedQuestion = q
      .replace(/"/g, "'")  // Replace double quotes with single quotes
      .replace(/"/g, "'")  // Replace curly quotes
      .replace(/"/g, "'"); // Replace other curly quotes
    prompt += `${i + 1}. ${sanitizedQuestion}\n`;
  });
  
  prompt += `\nPlease:\n`;
  prompt += `1. Create a form with the title "${parsedData.title}"\n`;
  prompt += `2. Add a Date field (date picker) - make it required\n`;
  if (parsedData.schedule?.shifts) {
    prompt += `3. Add a Shift field (dropdown with options: ${parsedData.schedule.shifts.join(', ')}) - make it required\n`;
    prompt += `4. Add all ${parsedData.questions.length} questions as Yes/No or Thumbs Up/Down fields\n`;
  } else {
    prompt += `3. Add all ${parsedData.questions.length} questions as Yes/No or Thumbs Up/Down fields\n`;
  }
  prompt += `5. Fix any typos in the questions (e.g., "Bevergae" → "Beverage", "chemiclas" → "chemicals")\n`;
  prompt += `6. Keep questions in the same order as they appear in the Excel file\n`;
  
  return prompt;
}

