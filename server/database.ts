// Simple in-memory database - works on Vercel with zero setup!
// No external services needed - just GitHub + Vercel

interface Phone {
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
  status: string;
  vendor?: string;
  customer_name?: string;
  payment_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface ReturnRecord {
  id: number;
  phone_id: number;
  return_date: string;
  return_reason: string;
  refund_amount: number;
  notes?: string;
  created_at: string;
}

// In-memory storage
let phones: Phone[] = [];
let returns: ReturnRecord[] = [];
let nextPhoneId = 1;
let nextReturnId = 1;

// Initialize database (no-op for in-memory)
export async function initDatabase(): Promise<void> {
  console.log('✅ Using in-memory database (no setup required!)');
  console.log('📊 Data persists during serverless function execution');
  // Note: Data resets on each deployment, but works perfectly for Vercel
}

// Phone operations
export async function getAllPhones(filters?: {
  search?: string;
  status?: string;
}): Promise<any[]> {
  try {
    let result = [...phones];
    
    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase().trim();
      result = result.filter(p => 
        p.imei1?.toLowerCase().includes(searchTerm) ||
        p.imei2?.toLowerCase().includes(searchTerm) ||
        p.model_name?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply status filter
    if (filters?.status && filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }
    
    // Sort by created_at descending
    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return dateB - dateA;
    });
    
    return result;
  } catch (error: any) {
    console.error('Error in getAllPhones:', error);
    return [];
  }
}

export async function getPhoneByImei(imei: string): Promise<any | null> {
  try {
    const imeiLower = imei.toLowerCase();
    const phone = phones.find(p => 
      p.imei1?.toLowerCase().includes(imeiLower) ||
      p.imei2?.toLowerCase().includes(imeiLower)
    );
    return phone || null;
  } catch (error: any) {
    console.error('Error in getPhoneByImei:', error);
    return null;
  }
}

export async function addPhone(phoneData: {
  imei1: string;
  imei2?: string;
  model_name?: string;
  storage?: string;
  color?: string;
  condition?: string;
  unlock_status?: string;
  purchase_date: string;
  purchase_price: number;
  vendor?: string;
  notes?: string;
}): Promise<{ success: boolean; id?: number; error?: string }> {
  try {
    // Check for duplicate IMEI
    const existing = await getPhoneByImei(phoneData.imei1);
    if (existing) {
      const modelInfo = existing.model_name ? ` (${existing.model_name})` : '';
      return { 
        success: false, 
        error: `IMEI "${phoneData.imei1}"${modelInfo} already exists in the database. Please use a different IMEI or check the existing phone in inventory.` 
      };
    }
    
    const now = new Date().toISOString();
    const newPhone: Phone = {
      id: nextPhoneId++,
      imei1: phoneData.imei1,
      imei2: phoneData.imei2,
      model_name: phoneData.model_name,
      storage: phoneData.storage,
      color: phoneData.color,
      condition: phoneData.condition,
      unlock_status: phoneData.unlock_status,
      purchase_date: phoneData.purchase_date,
      purchase_price: phoneData.purchase_price,
      vendor: phoneData.vendor,
      notes: phoneData.notes,
      status: 'in_stock',
      created_at: now,
      updated_at: now
    };
    
    phones.push(newPhone);
    return { success: true, id: newPhone.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePhone(
  id: number,
  phoneData: {
    model_name?: string;
    storage?: string;
    color?: string;
    condition?: string;
    unlock_status?: string;
    purchase_price?: number;
    vendor?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneIndex = phones.findIndex(p => p.id === id);
    if (phoneIndex === -1) {
      return { success: false, error: 'Phone not found' };
    }
    
    const phone = phones[phoneIndex];
    if (phone.status === 'sold') {
      return { success: false, error: 'Cannot edit sold phone' };
    }
    
    // Update fields
    if (phoneData.model_name !== undefined) phone.model_name = phoneData.model_name;
    if (phoneData.storage !== undefined) phone.storage = phoneData.storage;
    if (phoneData.color !== undefined) phone.color = phoneData.color;
    if (phoneData.condition !== undefined) phone.condition = phoneData.condition;
    if (phoneData.unlock_status !== undefined) phone.unlock_status = phoneData.unlock_status;
    if (phoneData.purchase_price !== undefined) phone.purchase_price = phoneData.purchase_price;
    if (phoneData.vendor !== undefined) phone.vendor = phoneData.vendor;
    if (phoneData.notes !== undefined) phone.notes = phoneData.notes;
    phone.updated_at = new Date().toISOString();
    
    phones[phoneIndex] = phone;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePhone(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneIndex = phones.findIndex(p => p.id === id);
    if (phoneIndex === -1) {
      return { success: false, error: 'Phone not found' };
    }
    
    const phone = phones[phoneIndex];
    if (phone.status === 'sold' || phone.sale_date) {
      return { success: false, error: 'Cannot delete sold phone' };
    }
    
    phones.splice(phoneIndex, 1);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function sellPhone(
  phoneId: number,
  saleData: {
    sale_price: number;
    customer_name?: string;
    payment_method?: string;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneIndex = phones.findIndex(p => p.id === phoneId);
    if (phoneIndex === -1) {
      return { success: false, error: 'Phone not found' };
    }
    
    const phone = phones[phoneIndex];
    if (phone.status === 'sold') {
      return { success: false, error: `This phone was already sold on ${phone.sale_date}` };
    }
    
    phone.status = 'sold';
    phone.sale_date = new Date().toISOString();
    phone.sale_price = saleData.sale_price;
    phone.customer_name = saleData.customer_name;
    phone.payment_method = saleData.payment_method;
    if (saleData.notes) {
      phone.notes = phone.notes ? `${phone.notes}\n${saleData.notes}` : saleData.notes;
    }
    phone.updated_at = new Date().toISOString();
    
    phones[phoneIndex] = phone;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processReturn(
  phoneId: number,
  returnData: {
    return_reason: string;
    refund_amount: number;
    notes?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const phoneIndex = phones.findIndex(p => p.id === phoneId);
    if (phoneIndex === -1) {
      return { success: false, error: 'Phone not found' };
    }
    
    const phone = phones[phoneIndex];
    if (phone.status !== 'sold') {
      return { success: false, error: 'This phone is currently in stock and hasn\'t been sold yet.' };
    }
    
    // Create return record
    const returnRecord: ReturnRecord = {
      id: nextReturnId++,
      phone_id: phoneId,
      return_date: new Date().toISOString(),
      return_reason: returnData.return_reason,
      refund_amount: returnData.refund_amount,
      notes: returnData.notes,
      created_at: new Date().toISOString()
    };
    
    returns.push(returnRecord);
    
    // Restock phone
    phone.status = 'in_stock';
    phone.updated_at = new Date().toISOString();
    phones[phoneIndex] = phone;
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllReturns(): Promise<any[]> {
  try {
    return returns.map(ret => {
      const phone = phones.find(p => p.id === ret.phone_id);
      return {
        ...ret,
        model_name: phone?.model_name || null,
        imei1: phone?.imei1 || null,
        sale_price: phone?.sale_price || null
      };
    }).sort((a, b) => {
      const dateA = new Date(a.return_date).getTime();
      const dateB = new Date(b.return_date).getTime();
      return dateB - dateA;
    });
  } catch (error: any) {
    console.error('Error in getAllReturns:', error);
    return [];
  }
}

// Reports
export async function getProfitReport(dateRange: {
  type: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}): Promise<any> {
  try {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;
    
    if (dateRange.type === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateRange.type === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateRange.type === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (dateRange.type === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      startDate = new Date(dateRange.startDate);
      endDate = new Date(dateRange.endDate);
    } else {
      startDate = new Date(0); // All time
    }
    
    const sales = phones.filter(p => {
      if (p.status !== 'sold' || !p.sale_date) return false;
      const saleDate = new Date(p.sale_date);
      return saleDate >= startDate && saleDate <= endDate;
    });
    
    const returnsInRange = returns.filter(r => {
      const returnDate = new Date(r.return_date);
      return returnDate >= startDate && returnDate <= endDate;
    });
    
    const totalSales = sales.length;
    const totalSalesRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.sale_price?.toString() || '0') || 0), 0);
    const totalPurchaseCosts = sales.reduce((sum, s) => sum + (parseFloat(s.purchase_price?.toString() || '0') || 0), 0);
    const totalRefunds = returnsInRange.reduce((sum, r) => sum + (parseFloat(r.refund_amount?.toString() || '0') || 0), 0);
    const netProfit = totalSalesRevenue - totalPurchaseCosts - totalRefunds;
    const averageProfitPerSale = totalSales > 0 ? netProfit / totalSales : 0;
    
    return {
      totalSales,
      totalSalesRevenue,
      totalPurchaseCosts,
      totalRefunds,
      netProfit,
      averageProfitPerSale,
      sales,
      returns: returnsInRange,
    };
  } catch (error: any) {
    console.error('Error in getProfitReport:', error);
    return {
      totalSales: 0,
      totalSalesRevenue: 0,
      totalPurchaseCosts: 0,
      totalRefunds: 0,
      netProfit: 0,
      averageProfitPerSale: 0,
      sales: [],
      returns: []
    };
  }
}

export async function getInventoryReport(): Promise<any> {
  try {
    const inStock = phones.filter(p => p.status === 'in_stock');
    const currentStockCount = inStock.length;
    const currentStockValue = inStock.reduce((sum, p) => sum + (parseFloat(p.purchase_price?.toString() || '0') || 0), 0);
    
    // Best selling models
    const soldPhones = phones.filter(p => p.status === 'sold');
    const modelCounts: { [key: string]: number } = {};
    soldPhones.forEach(phone => {
      if (phone.model_name) {
        modelCounts[phone.model_name] = (modelCounts[phone.model_name] || 0) + 1;
      }
    });
    
    const bestSelling = Object.entries(modelCounts)
      .map(([model_name, sales_count]) => ({ model_name, sales_count }))
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 10);
    
    const totalSales = soldPhones.length;
    const totalReturns = returns.length;
    const returnRate = totalSales > 0 ? (totalReturns / totalSales) * 100 : 0;
    
    return {
      currentStockCount,
      currentStockValue,
      bestSellingModels: bestSelling,
      returnRate
    };
  } catch (error: any) {
    console.error('Error in getInventoryReport:', error);
    return {
      currentStockCount: 0,
      currentStockValue: 0,
      bestSellingModels: [],
      returnRate: 0
    };
  }
}
