import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createObjectCsvWriter } from 'csv-writer';
import ExcelJS from 'exceljs';

function getExportPath(): string {
  const platform = process.platform;
  if (platform === 'win32') {
    return path.join(os.homedir(), 'Documents', 'iWorldStore');
  } else {
    return path.join(os.homedir(), 'Documents', 'iWorldStore');
  }
}

export async function exportToCSV(data: any[], filename: string): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const exportDir = getExportPath();
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const filePath = path.join(exportDir, `${filename}.csv`);
    
    if (data.length === 0) {
      return { success: false, error: 'No data to export' };
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]).map(key => ({
      id: key,
      title: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    }));
    
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: headers,
    });
    
    await csvWriter.writeRecords(data);
    
    return { success: true, path: filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function exportToExcel(data: any[], filename: string): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    const exportDir = getExportPath();
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    const filePath = path.join(exportDir, `${filename}.xlsx`);
    
    if (data.length === 0) {
      return { success: false, error: 'No data to export' };
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    const headerRow = headers.map(h => h.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    
    worksheet.addRow(headerRow);
    
    // Style header row
    const headerCellStyle: Partial<ExcelJS.Style> = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern' as const,
        pattern: 'solid' as const,
        fgColor: { argb: 'FF2d2d2d' },
      },
    };
    
    worksheet.getRow(1).eachCell((cell) => {
      cell.style = headerCellStyle;
    });
    
    // Add data rows
    data.forEach((row) => {
      const values = headers.map(h => row[h] || '');
      worksheet.addRow(values);
    });
    
    // Auto-width columns
    worksheet.columns.forEach((column) => {
      if (column.header && column.eachCell) {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = Math.min(maxLength + 2, 50);
      }
    });
    
    await workbook.xlsx.writeFile(filePath);
    
    return { success: true, path: filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

