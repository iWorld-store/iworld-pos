export type PhoneCondition = 'Boxpack' | '10/10' | 'Average';
export type UnlockStatus = 'JV' | 'Factory Unlocked' | 'PTA';
export type PhoneStatus = 'in_stock' | 'sold';
export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';
export type ReturnType = 'refund' | 'trade_in' | 'exchange';

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
  isTradeIn?: boolean; // true if this phone was received as a trade-in
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
  isResale?: boolean; // true if this is a resale of a returned phone
  originalReturnId?: number; // ID of the return record if this is a resale
  isTradeIn?: boolean; // true if this sale includes a trade-in
  tradeInValue?: number; // value of the trade-in phone
  tradeInPhoneId?: number; // ID of the trade-in phone in inventory
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
  status: 'pending' | 'paid' | 'cancelled'; // pending = not fully paid, paid = fully paid, cancelled = phone returned
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditPayment {
  id?: number;
  creditId: number;
  amount: number;
  paymentDate: string; // DD/MM/YYYY format
  paymentMethod?: PaymentMethod;
  createdAt?: string;
}

export interface Return {
  id?: number;
  saleId: number;
  phoneId: number;
  returnType?: ReturnType; // 'refund' = customer changed mind, 'trade_in' = buyback/upgrade, 'exchange' = exchange for different phone
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
  creditPayments?: CreditPayment[];
  exportDate: string;
  version: string;
}

export interface ReportData {
  currentStockValue: number;
  totalProfit: number;
  netProfit: number;
  refundLosses: number; // Actual losses from refunds (money lost)
  tradeInValue: number; // Value of trade-ins (buyback cost, not a loss)
  tradeInExcess: number; // Excess trade-in value when trade-in > sale price (subtracted from profit)
  resaleProfit: number; // Profit from reselling returned phones
  resaleCount: number; // Number of resale transactions
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
  dailyProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  yearlyProfit: number;
}

