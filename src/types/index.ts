export type PhoneCondition = 'Boxpack' | '10/10' | 'Average';
export type UnlockStatus = 'JV' | 'Factory Unlocked' | 'PTA';
export type PhoneStatus = 'in_stock' | 'sold';
export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export interface Phone {
  id?: number;
  imei1: string;
  imei2?: string;
  modelName: string;
  storage: string;
  color: string;
  condition: PhoneCondition;
  unlockStatus: UnlockStatus;
  batteryHealth?: string; // e.g., "85%", "100%", "92%"
  purchaseDate: string; // DD/MM/YYYY format
  purchasePrice: number;
  saleDate?: string; // DD/MM/YYYY format or 'N/A'
  salePrice?: number;
  receiptNumber?: string; // Receipt number from sale (e.g., "RCP-20251106-473")
  status: PhoneStatus;
  vendor?: string;
  customerName?: string;
  paymentMethod?: PaymentMethod;
  isCredit?: boolean; // true if sold on credit
  creditReceived?: number; // amount received for credit sale
  creditRemaining?: number; // remaining amount to be paid
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sale {
  id?: number;
  phoneId: number;
  salePrice: number;
  saleDate: string;
  customerName?: string;
  paymentMethod?: PaymentMethod;
  profit: number;
  receiptNumber: string;
  isCredit?: boolean; // true if sold on credit
  creditReceived?: number; // amount received for credit sale
  creditRemaining?: number; // remaining amount to be paid
  createdAt?: string;
}

export interface Credit {
  id?: number;
  phoneId: number;
  saleId: number;
  customerName: string;
  totalAmount: number;
  receivedAmount: number;
  remainingAmount: number;
  saleDate: string;
  paymentMethod?: PaymentMethod;
  status: 'pending' | 'paid'; // pending = not fully paid, paid = fully paid
  createdAt?: string;
  updatedAt?: string;
}

export interface Return {
  id?: number;
  saleId: number;
  phoneId: number;
  returnPrice: number;
  newPrice: number;
  returnReason?: string;
  returnDate: string;
  createdAt?: string;
}

export interface BackupData {
  phones: Phone[];
  sales: Sale[];
  returns: Return[];
  credits?: Credit[];
  exportDate: string;
  version: string;
}

export interface ReportData {
  currentStockValue: number;
  totalProfit: number;
  netProfit: number;
  todaySales: {
    count: number;
    revenue: number;
    profit: number;
  };
  bestSellingModels: Array<{
    model: string;
    count: number;
    totalProfit: number;
  }>;
  averageProfitPerPhone: number;
  inventoryTurnover: number;
}

