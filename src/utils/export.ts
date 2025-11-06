import * as XLSX from 'xlsx';
import { Phone } from '@/types';

export function exportToCSV(phones: Phone[]): void {
  // Convert phones to CSV format matching the user's structure
  const csvData = phones.map(phone => ({
    Id: phone.id || '',
    Imei1: phone.imei1,
    Imei2: phone.imei2 || '',
    'Model Name': phone.modelName,
    Storage: phone.storage,
    Color: phone.color,
    Condition: phone.condition,
    'Unlock Status': phone.unlockStatus,
    'Battery Health': phone.batteryHealth || '',
    'Purchase Date': phone.purchaseDate,
    'Purchase Price': phone.purchasePrice,
    'Sale Date': phone.saleDate || '',
    'Sale Price': phone.salePrice || '',
    Status: phone.status,
    Vendor: phone.vendor || '',
    'Customer Name': phone.customerName || '',
    'Payment Method': phone.paymentMethod || '',
    Notes: phone.notes || '',
  }));

  // Convert to CSV string
  const headers = Object.keys(csvData[0] || {});
  const csvRows = [
    headers.join(','),
    ...csvData.map(row => 
      headers.map(header => {
        const value = row[header as keyof typeof row];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ),
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(phones: Phone[]): void {
  // Convert phones to Excel format
  const excelData = phones.map(phone => ({
    Id: phone.id || '',
    Imei1: phone.imei1,
    Imei2: phone.imei2 || '',
    'Model Name': phone.modelName,
    Storage: phone.storage,
    Color: phone.color,
    Condition: phone.condition,
    'Unlock Status': phone.unlockStatus,
    'Battery Health': phone.batteryHealth || '',
    'Purchase Date': phone.purchaseDate,
    'Purchase Price': phone.purchasePrice,
    'Sale Date': phone.saleDate || '',
    'Sale Price': phone.salePrice || '',
    Status: phone.status,
    Vendor: phone.vendor || '',
    'Customer Name': phone.customerName || '',
    'Payment Method': phone.paymentMethod || '',
    Notes: phone.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
  
  XLSX.writeFile(workbook, `inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
}

