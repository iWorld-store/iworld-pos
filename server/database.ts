import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase credentials not found. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize database (create tables if they don't exist)
export async function initDatabase(): Promise<void> {
  console.log('✅ Using Supabase PostgreSQL database');
  console.log('📊 Database URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'Not configured');
  
  // Note: Tables should be created in Supabase dashboard
  // This function is kept for compatibility but doesn't need to create tables
  // as Supabase handles schema management through the dashboard
}

// Phone operations
export async function getAllPhones(filters?: {
  search?: string;
  status?: string;
}): Promise<any[]> {
  try {
    let query = supabase
      .from('phones')
      .select('*');
    
    if (filters?.search) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(`imei1.ilike."${searchTerm}",imei2.ilike."${searchTerm}",model_name.ilike."${searchTerm}"`);
    }
    
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching phones:', error);
      return [];
    }
    
    return data || [];
  } catch (error: any) {
    console.error('Error in getAllPhones:', error);
    return [];
  }
}

export async function getPhoneByImei(imei: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('phones')
      .select('*')
      .or(`imei1.ilike.%${imei}%,imei2.ilike.%${imei}%`)
      .limit(1)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    return data;
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
    
    const { data, error } = await supabase
      .from('phones')
      .insert({
        imei1: phoneData.imei1,
        imei2: phoneData.imei2 || null,
        model_name: phoneData.model_name || null,
        storage: phoneData.storage || null,
        color: phoneData.color || null,
        condition: phoneData.condition || null,
        unlock_status: phoneData.unlock_status || null,
        purchase_date: phoneData.purchase_date,
        purchase_price: phoneData.purchase_price,
        vendor: phoneData.vendor || null,
        notes: phoneData.notes || null,
        status: 'in_stock'
      })
      .select()
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, id: data.id };
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
    // Check if phone exists
    const { data: phone, error: fetchError } = await supabase
      .from('phones')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status === 'sold') {
      return { success: false, error: 'Cannot edit sold phone' };
    }
    
    // Build update object (only include defined fields)
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (phoneData.model_name !== undefined) updateData.model_name = phoneData.model_name;
    if (phoneData.storage !== undefined) updateData.storage = phoneData.storage;
    if (phoneData.color !== undefined) updateData.color = phoneData.color;
    if (phoneData.condition !== undefined) updateData.condition = phoneData.condition;
    if (phoneData.unlock_status !== undefined) updateData.unlock_status = phoneData.unlock_status;
    if (phoneData.purchase_price !== undefined) updateData.purchase_price = phoneData.purchase_price;
    if (phoneData.vendor !== undefined) updateData.vendor = phoneData.vendor;
    if (phoneData.notes !== undefined) updateData.notes = phoneData.notes;
    
    const { error } = await supabase
      .from('phones')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePhone(id: number): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if phone exists
    const { data: phone, error: fetchError } = await supabase
      .from('phones')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError || !phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status === 'sold' || phone.sale_date) {
      return { success: false, error: 'Cannot delete sold phone' };
    }
    
    const { error } = await supabase
      .from('phones')
      .delete()
      .eq('id', id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
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
    // Check if phone exists
    const { data: phone, error: fetchError } = await supabase
      .from('phones')
      .select('*')
      .eq('id', phoneId)
      .single();
    
    if (fetchError || !phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status === 'sold') {
      return { success: false, error: `This phone was already sold on ${phone.sale_date}` };
    }
    
    const { error } = await supabase
      .from('phones')
      .update({
        status: 'sold',
        sale_date: new Date().toISOString(),
        sale_price: saleData.sale_price,
        customer_name: saleData.customer_name || null,
        payment_method: saleData.payment_method || null,
        notes: saleData.notes || phone.notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', phoneId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
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
    // Check if phone exists
    const { data: phone, error: fetchError } = await supabase
      .from('phones')
      .select('*')
      .eq('id', phoneId)
      .single();
    
    if (fetchError || !phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status !== 'sold') {
      return { success: false, error: 'This phone is currently in stock and hasn\'t been sold yet.' };
    }
    
    // Create return record
    const { error: returnError } = await supabase
      .from('returns')
      .insert({
        phone_id: phoneId,
        return_date: new Date().toISOString(),
        return_reason: returnData.return_reason,
        refund_amount: returnData.refund_amount,
        notes: returnData.notes || null
      });
    
    if (returnError) {
      return { success: false, error: returnError.message };
    }
    
    // Restock phone
    const { error: updateError } = await supabase
      .from('phones')
      .update({
        status: 'in_stock',
        updated_at: new Date().toISOString()
      })
      .eq('id', phoneId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllReturns(): Promise<any[]> {
  try {
    const { data: returns, error: returnsError } = await supabase
      .from('returns')
      .select('*')
      .order('return_date', { ascending: false });
    
    if (returnsError) {
      console.error('Error fetching returns:', returnsError);
      return [];
    }
    
    if (!returns || returns.length === 0) {
      return [];
    }
    
    // Get phone details for each return
    const phoneIds = returns.map((r: any) => r.phone_id);
    const { data: phones, error: phonesError } = await supabase
      .from('phones')
      .select('id, model_name, imei1, sale_price')
      .in('id', phoneIds);
    
    if (phonesError) {
      console.error('Error fetching phones for returns:', phonesError);
    }
    
    // Merge return and phone data
    const phoneMap = new Map((phones || []).map((p: any) => [p.id, p]));
    
    return (returns || []).map((ret: any) => {
      const phone = phoneMap.get(ret.phone_id);
      return {
        ...ret,
        model_name: phone?.model_name || null,
        imei1: phone?.imei1 || null,
        sale_price: phone?.sale_price || null
      };
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
    let query = supabase
      .from('phones')
      .select('*')
      .eq('status', 'sold');
    
    const now = new Date();
    let startDate: Date;
    
    if (dateRange.type === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query = query.gte('sale_date', startDate.toISOString());
    } else if (dateRange.type === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      query = query.gte('sale_date', startDate.toISOString());
    } else if (dateRange.type === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      query = query.gte('sale_date', startDate.toISOString());
    } else if (dateRange.type === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
      query = query.gte('sale_date', startDate.toISOString());
    } else if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      query = query
        .gte('sale_date', dateRange.startDate)
        .lte('sale_date', dateRange.endDate);
    }
    
    const { data: sales, error: salesError } = await query;
    
    if (salesError) {
      console.error('Error fetching sales:', salesError);
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
    
    // Get returns in date range
    let returnsQuery = supabase.from('returns').select('*');
    
    if (dateRange.type === 'today') {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      returnsQuery = returnsQuery.gte('return_date', todayStart.toISOString());
    } else if (dateRange.type === 'week') {
      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      returnsQuery = returnsQuery.gte('return_date', weekStart.toISOString());
    } else if (dateRange.type === 'month') {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      returnsQuery = returnsQuery.gte('return_date', monthStart.toISOString());
    } else if (dateRange.type === 'year') {
      const yearStart = new Date(now.getFullYear(), 0, 1);
      returnsQuery = returnsQuery.gte('return_date', yearStart.toISOString());
    } else if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
      returnsQuery = returnsQuery
        .gte('return_date', dateRange.startDate)
        .lte('return_date', dateRange.endDate);
    }
    
    const { data: returns, error: returnsError } = await returnsQuery;
    
    if (returnsError) {
      console.error('Error fetching returns:', returnsError);
    }
    
    const salesData = sales || [];
    const returnsData = returns || [];
    
    const totalSales = salesData.length;
    const totalSalesRevenue = salesData.reduce((sum, s) => sum + (parseFloat(s.sale_price) || 0), 0);
    const totalPurchaseCosts = salesData.reduce((sum, s) => sum + (parseFloat(s.purchase_price) || 0), 0);
    const totalRefunds = returnsData.reduce((sum, r) => sum + (parseFloat(r.refund_amount) || 0), 0);
    const netProfit = totalSalesRevenue - totalPurchaseCosts - totalRefunds;
    const averageProfitPerSale = totalSales > 0 ? netProfit / totalSales : 0;
    
    return {
      totalSales,
      totalSalesRevenue,
      totalPurchaseCosts,
      totalRefunds,
      netProfit,
      averageProfitPerSale,
      sales: salesData,
      returns: returnsData,
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
    // Get in stock phones
    const { data: inStock, error: inStockError } = await supabase
      .from('phones')
      .select('*')
      .eq('status', 'in_stock');
    
    if (inStockError) {
      console.error('Error fetching in stock phones:', inStockError);
      return {
        currentStockCount: 0,
        currentStockValue: 0,
        bestSellingModels: [],
        returnRate: 0
      };
    }
    
    const currentStockCount = (inStock || []).length;
    const currentStockValue = (inStock || []).reduce((sum, p) => sum + (parseFloat(p.purchase_price) || 0), 0);
    
    // Best selling models
    const { data: bestSellingData, error: bestSellingError } = await supabase
      .from('phones')
      .select('model_name')
      .eq('status', 'sold');
    
    if (bestSellingError) {
      console.error('Error fetching best selling:', bestSellingError);
    }
    
    // Group by model_name and count
    const modelCounts: { [key: string]: number } = {};
    (bestSellingData || []).forEach((phone: any) => {
      if (phone.model_name) {
        modelCounts[phone.model_name] = (modelCounts[phone.model_name] || 0) + 1;
      }
    });
    
    const bestSelling = Object.entries(modelCounts)
      .map(([model_name, sales_count]) => ({ model_name, sales_count }))
      .sort((a, b) => b.sales_count - a.sales_count)
      .slice(0, 10);
    
    // Return rate
    const { count: totalSales } = await supabase
      .from('phones')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sold');
    
    const { count: totalReturns } = await supabase
      .from('returns')
      .select('*', { count: 'exact', head: true });
    
    const returnRate = (totalSales || 0) > 0 
      ? ((totalReturns || 0) / (totalSales || 1)) * 100 
      : 0;
    
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
