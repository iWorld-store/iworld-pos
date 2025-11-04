import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Phone operations
  getAllPhones: (filters?: any) => ipcRenderer.invoke('db:getAllPhones', filters),
  getPhoneByImei: (imei: string) => ipcRenderer.invoke('db:getPhoneByImei', imei),
  addPhone: (phoneData: any) => ipcRenderer.invoke('db:addPhone', phoneData),
  updatePhone: (id: number, phoneData: any) => ipcRenderer.invoke('db:updatePhone', id, phoneData),
  deletePhone: (id: number) => ipcRenderer.invoke('db:deletePhone', id),
  sellPhone: (phoneId: number, saleData: any) => ipcRenderer.invoke('db:sellPhone', phoneId, saleData),
  processReturn: (phoneId: number, returnData: any) => ipcRenderer.invoke('db:processReturn', phoneId, returnData),
  getAllReturns: () => ipcRenderer.invoke('db:getAllReturns'),
  
  // Reports
  getProfitReport: (dateRange: any) => ipcRenderer.invoke('db:getProfitReport', dateRange),
  getInventoryReport: () => ipcRenderer.invoke('db:getInventoryReport'),
  
  // Export
  exportToCSV: (data: any[], filename: string) => ipcRenderer.invoke('export:csv', data, filename),
  exportToExcel: (data: any[], filename: string) => ipcRenderer.invoke('export:excel', data, filename),
});

