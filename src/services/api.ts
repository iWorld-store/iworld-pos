import { Phone, ReturnRecord, ProfitReport, InventoryReport, DateRange, SaleData, ReturnData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Phone operations
  getAllPhones: (filters?: { search?: string; status?: string }): Promise<Phone[]> => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    const query = params.toString();
    return apiRequest<Phone[]>(`/phones${query ? `?${query}` : ''}`);
  },

  getPhoneByImei: (imei: string): Promise<Phone | null> => apiRequest<Phone | null>(`/phones/imei/${encodeURIComponent(imei)}`),

  addPhone: (phoneData: any): Promise<{ success: boolean; id?: number; error?: string }> => apiRequest('/phones', {
    method: 'POST',
    body: JSON.stringify(phoneData),
  }),

  updatePhone: (id: number, phoneData: Partial<Phone>): Promise<{ success: boolean; error?: string }> => apiRequest(`/phones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(phoneData),
  }),

  deletePhone: (id: number): Promise<{ success: boolean; error?: string }> => apiRequest(`/phones/${id}`, {
    method: 'DELETE',
  }),

  sellPhone: (phoneId: number, saleData: SaleData): Promise<{ success: boolean; error?: string }> => apiRequest(`/phones/${phoneId}/sell`, {
    method: 'POST',
    body: JSON.stringify(saleData),
  }),

  processReturn: (phoneId: number, returnData: ReturnData): Promise<{ success: boolean; error?: string }> => apiRequest(`/phones/${phoneId}/return`, {
    method: 'POST',
    body: JSON.stringify(returnData),
  }),

  getAllReturns: (): Promise<ReturnRecord[]> => apiRequest<ReturnRecord[]>('/returns'),

  // Reports
  getProfitReport: (dateRange: DateRange): Promise<ProfitReport> => apiRequest<ProfitReport>('/reports/profit', {
    method: 'POST',
    body: JSON.stringify(dateRange),
  }),

  getInventoryReport: (): Promise<InventoryReport> => apiRequest<InventoryReport>('/reports/inventory'),

  // Export
  exportToCSV: (data: any[], filename: string): Promise<{ success: boolean; path?: string; error?: string }> => apiRequest('/export/csv', {
    method: 'POST',
    body: JSON.stringify({ data, filename }),
  }),

  exportToExcel: (data: any[], filename: string): Promise<{ success: boolean; path?: string; error?: string }> => apiRequest('/export/excel', {
    method: 'POST',
    body: JSON.stringify({ data, filename }),
  }),
};

