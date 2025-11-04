export interface Phone {
  id: number;
  imei1: string;
  imei2?: string;
  model_name?: string;
  storage?: string;
  color?: string;
  condition?: string;
  unlock_status?: string;
  purchase_date: string;
  purchase_price: number;
  sale_date?: string;
  sale_price?: number;
  status: 'in_stock' | 'sold' | 'returned';
  vendor?: string;
  customer_name?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReturnRecord {
  id: number;
  phone_id: number;
  return_date: string;
  return_reason: string;
  refund_amount: number;
  notes?: string;
  created_at: string;
  model_name?: string;
  imei1?: string;
  sale_price?: number;
}

export interface SaleData {
  sale_price: number;
  customer_name?: string;
  payment_method?: string;
  notes?: string;
}

export interface ReturnData {
  return_reason: string;
  refund_amount: number;
  notes?: string;
}

export interface ProfitReport {
  totalSales: number;
  totalSalesRevenue: number;
  totalPurchaseCosts: number;
  totalRefunds: number;
  netProfit: number;
  averageProfitPerSale: number;
  sales: Phone[];
  returns: ReturnRecord[];
}

export interface InventoryReport {
  currentStockCount: number;
  currentStockValue: number;
  bestSellingModels: { model_name: string; sales_count: number }[];
  returnRate: number;
  totalPhones: { count: number };
}

export interface DateRange {
  type: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}

declare global {
  interface Window {
    electronAPI: {
      getAllPhones: (filters?: { search?: string; status?: string }) => Promise<Phone[]>;
      getPhoneByImei: (imei: string) => Promise<Phone | null>;
      addPhone: (phoneData: Partial<Phone>) => Promise<{ success: boolean; id?: number; error?: string }>;
      updatePhone: (id: number, phoneData: Partial<Phone>) => Promise<{ success: boolean; error?: string }>;
      deletePhone: (id: number) => Promise<{ success: boolean; error?: string }>;
      sellPhone: (phoneId: number, saleData: SaleData) => Promise<{ success: boolean; error?: string }>;
      processReturn: (phoneId: number, returnData: ReturnData) => Promise<{ success: boolean; error?: string }>;
      getAllReturns: () => Promise<ReturnRecord[]>;
      getProfitReport: (dateRange: DateRange) => Promise<ProfitReport>;
      getInventoryReport: () => Promise<InventoryReport>;
      exportToCSV: (data: any[], filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
      exportToExcel: (data: any[], filename: string) => Promise<{ success: boolean; path?: string; error?: string }>;
    };
  }
}

