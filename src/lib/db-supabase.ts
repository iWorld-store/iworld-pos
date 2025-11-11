import { supabase, getCurrentUserId } from './supabase';
import { Phone, Sale, Return, Credit, CreditPayment, PaymentMethod } from '@/types';

// Helper function to map database row to Phone
function mapPhoneFromDB(row: any): Phone {
  return {
    id: row.id,
    imei1: row.imei1,
    imei2: row.imei2 || undefined,
    modelName: row.model_name,
    storage: row.storage,
    color: row.color,
    condition: row.condition,
    unlockStatus: row.unlock_status,
    batteryHealth: row.battery_health || undefined,
    purchaseDate: row.purchase_date,
    purchasePrice: parseFloat(row.purchase_price),
    saleDate: row.sale_date || undefined,
    salePrice: row.sale_price ? parseFloat(row.sale_price) : undefined,
    receiptNumber: row.receipt_number || undefined,
    status: row.status,
    vendor: row.vendor || undefined,
    customerName: row.customer_name || undefined,
    paymentMethod: row.payment_method || undefined,
    isCredit: row.is_credit || false,
    creditReceived: row.credit_received ? parseFloat(row.credit_received) : undefined,
    creditRemaining: row.credit_remaining ? parseFloat(row.credit_remaining) : undefined,
    notes: row.notes || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper function to map Phone to database row
function mapPhoneToDB(phone: Omit<Phone, 'id'> | Partial<Phone>): any {
  const result: any = {};
  if (phone.imei1 !== undefined) result.imei1 = phone.imei1;
  if (phone.imei2 !== undefined) result.imei2 = phone.imei2 || null;
  if (phone.modelName !== undefined) result.model_name = phone.modelName;
  if (phone.storage !== undefined) result.storage = phone.storage;
  if (phone.color !== undefined) result.color = phone.color;
  if (phone.condition !== undefined) result.condition = phone.condition;
  if (phone.unlockStatus !== undefined) result.unlock_status = phone.unlockStatus;
  if (phone.batteryHealth !== undefined) result.battery_health = phone.batteryHealth || null;
  if (phone.purchaseDate !== undefined) result.purchase_date = phone.purchaseDate;
  if (phone.purchasePrice !== undefined) result.purchase_price = phone.purchasePrice;
  if (phone.saleDate !== undefined) result.sale_date = phone.saleDate || null;
  if (phone.salePrice !== undefined) result.sale_price = phone.salePrice || null;
  if (phone.receiptNumber !== undefined) result.receipt_number = phone.receiptNumber || null;
  if (phone.status !== undefined) result.status = phone.status;
  if (phone.vendor !== undefined) result.vendor = phone.vendor || null;
  if (phone.customerName !== undefined) result.customer_name = phone.customerName || null;
  if (phone.paymentMethod !== undefined) result.payment_method = phone.paymentMethod || null;
  if (phone.isCredit !== undefined) result.is_credit = phone.isCredit || false;
  if (phone.creditReceived !== undefined) result.credit_received = phone.creditReceived || null;
  if (phone.creditRemaining !== undefined) result.credit_remaining = phone.creditRemaining || null;
  if (phone.notes !== undefined) result.notes = phone.notes || null;
  return result;
}

// Helper function to map database row to Sale
function mapSaleFromDB(row: any): Sale {
  return {
    id: row.id,
    phoneId: row.phone_id,
    salePrice: parseFloat(row.sale_price),
    saleDate: row.sale_date,
    customerName: row.customer_name || undefined,
    paymentMethod: row.payment_method || undefined,
    profit: parseFloat(row.profit),
    receiptNumber: row.receipt_number,
    isCredit: row.is_credit || false,
    creditReceived: row.credit_received ? parseFloat(row.credit_received) : undefined,
    creditRemaining: row.credit_remaining ? parseFloat(row.credit_remaining) : undefined,
    isResale: row.is_resale || false,
    originalReturnId: row.original_return_id || undefined,
    createdAt: row.created_at,
  };
}

// Helper function to map Sale to database row
function mapSaleToDB(sale: Omit<Sale, 'id'>): any {
  return {
    phone_id: sale.phoneId,
    sale_price: sale.salePrice,
    sale_date: sale.saleDate,
    customer_name: sale.customerName || null,
    payment_method: sale.paymentMethod || null,
    profit: sale.profit,
    receipt_number: sale.receiptNumber,
    is_credit: sale.isCredit || false,
    credit_received: sale.creditReceived || null,
    credit_remaining: sale.creditRemaining || null,
    is_resale: sale.isResale || false,
    original_return_id: sale.originalReturnId || null,
  };
}

// Helper function to map database row to Return
function mapReturnFromDB(row: any): Return {
  return {
    id: row.id,
    saleId: row.sale_id,
    phoneId: row.phone_id,
    returnType: row.return_type || 'refund', // Default to 'refund' for backward compatibility
    returnPrice: parseFloat(row.return_price),
    newPrice: parseFloat(row.new_price),
    returnReason: row.return_reason || undefined,
    returnDate: row.return_date,
    createdAt: row.created_at,
  };
}

// Helper function to map database row to Credit
function mapCreditFromDB(row: any): Credit {
  return {
    id: row.id,
    phoneId: row.phone_id,
    saleId: row.sale_id,
    customerName: row.customer_name,
    totalAmount: parseFloat(row.total_amount),
    receivedAmount: parseFloat(row.received_amount),
    remainingAmount: parseFloat(row.remaining_amount),
    saleDate: row.sale_date,
    paymentMethod: row.payment_method || undefined,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Helper function to map database row to CreditPayment
function mapCreditPaymentFromDB(row: any): CreditPayment {
  return {
    id: row.id,
    creditId: row.credit_id,
    amount: parseFloat(row.amount),
    paymentDate: row.payment_date,
    paymentMethod: row.payment_method || undefined,
    createdAt: row.created_at,
  };
}

// Helper function to map CreditPayment to database row
function mapCreditPaymentToDB(payment: Omit<CreditPayment, 'id'>): any {
  return {
    credit_id: payment.creditId,
    amount: payment.amount,
    payment_date: payment.paymentDate,
    payment_method: payment.paymentMethod || null,
  };
}

// Database operations using Supabase
export const phoneDB = {
  // Phone operations
  async addPhone(phone: Omit<Phone, 'id'>): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const phoneData = mapPhoneToDB(phone);
    phoneData.user_id = userId;

    const { data, error } = await supabase
      .from('phones')
      .insert(phoneData)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to insert phone');
    return (data as any).id as number;
  },

  async updatePhone(id: number, updates: Partial<Phone>): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const updateData: any = {};
    if (updates.imei1 !== undefined) updateData.imei1 = updates.imei1;
    if (updates.imei2 !== undefined) updateData.imei2 = updates.imei2 || null;
    if (updates.modelName !== undefined) updateData.model_name = updates.modelName;
    if (updates.storage !== undefined) updateData.storage = updates.storage;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.condition !== undefined) updateData.condition = updates.condition;
    if (updates.unlockStatus !== undefined) updateData.unlock_status = updates.unlockStatus;
    if (updates.batteryHealth !== undefined) updateData.battery_health = updates.batteryHealth || null;
    if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate;
    if (updates.purchasePrice !== undefined) updateData.purchase_price = updates.purchasePrice;
    if (updates.saleDate !== undefined) updateData.sale_date = updates.saleDate || null;
    if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice || null;
    if (updates.receiptNumber !== undefined) updateData.receipt_number = updates.receiptNumber || null;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.vendor !== undefined) updateData.vendor = updates.vendor || null;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName || null;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod || null;
    if (updates.isCredit !== undefined) updateData.is_credit = updates.isCredit;
    if (updates.creditReceived !== undefined) updateData.credit_received = updates.creditReceived || null;
    if (updates.creditRemaining !== undefined) updateData.credit_remaining = updates.creditRemaining || null;
    if (updates.notes !== undefined) updateData.notes = updates.notes || null;

    const { error } = await (supabase as any)
      .from('phones')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getPhone(id: number): Promise<Phone | undefined> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('phones')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw error;
    }

    return data ? mapPhoneFromDB(data) : undefined;
  },

  async getAllPhones(): Promise<Phone[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('phones')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapPhoneFromDB);
  },

  async getPhonesByStatus(status: Phone['status']): Promise<Phone[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('phones')
      .select('*')
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapPhoneFromDB);
  },

  async searchPhones(query: string): Promise<Phone[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const lowerQuery = query.toLowerCase();

    const { data, error } = await supabase
      .from('phones')
      .select('*')
      .eq('user_id', userId)
      .or(`imei1.ilike.%${lowerQuery}%,imei2.ilike.%${lowerQuery}%,model_name.ilike.%${lowerQuery}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapPhoneFromDB);
  },

  async deletePhone(id: number): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Get phone to check status
    const phone = await this.getPhone(id);
    if (!phone) {
      throw new Error('Phone not found');
    }

    // If phone is sold, cascade delete related records
    if (phone.status === 'sold') {
      // Delete related credits (cascade handled by foreign key)
      await supabase.from('credits').delete().eq('phone_id', id).eq('user_id', userId);
      
      // Delete related returns (cascade handled by foreign key)
      await supabase.from('returns').delete().eq('phone_id', id).eq('user_id', userId);
      
      // Delete related sales (cascade handled by foreign key)
      await supabase.from('sales').delete().eq('phone_id', id).eq('user_id', userId);
    }
    
    // Delete the phone (cascade will handle related records)
    const { error } = await supabase
      .from('phones')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Sale operations
  async addSale(sale: Omit<Sale, 'id'>): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Check if this phone was previously returned (resale detection)
    let isResale = false;
    let originalReturnId: number | undefined = undefined;
    
    try {
      const phoneReturns = await this.getReturnsByPhoneId(sale.phoneId);
      if (phoneReturns.length > 0) {
        // This is a resale - use the most recent return
        const mostRecentReturn = phoneReturns[phoneReturns.length - 1];
        isResale = true;
        originalReturnId = mostRecentReturn.id;
      }
    } catch (error) {
      // If error checking returns, continue without resale marking
      console.error('Error checking for resale:', error);
    }

    const saleData = mapSaleToDB({
      ...sale,
      isResale: isResale || sale.isResale, // Use provided value or auto-detected
      originalReturnId: originalReturnId || sale.originalReturnId,
    });
    saleData.user_id = userId;

    const { data, error } = await supabase
      .from('sales')
      .insert(saleData)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to insert sale');

    // Update phone status
    await this.updatePhone(sale.phoneId, {
      status: 'sold',
      saleDate: sale.saleDate,
      salePrice: sale.salePrice,
      receiptNumber: sale.receiptNumber,
      customerName: sale.customerName,
      paymentMethod: sale.paymentMethod,
      isCredit: sale.isCredit,
      creditReceived: sale.creditReceived,
      creditRemaining: sale.creditRemaining,
    });

    return (data as any).id as number;
  },

  async getAllSales(): Promise<Sale[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapSaleFromDB);
  },

  async getResaleSales(): Promise<Sale[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('user_id', userId)
      .eq('is_resale', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapSaleFromDB);
  },

  async getSaleByPhoneId(phoneId: number): Promise<Sale | undefined> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .eq('phone_id', phoneId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw error;
    }

    return data ? mapSaleFromDB(data) : undefined;
  },

  async updateSale(id: number, updates: Partial<Sale>): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const updateData: any = {};
    if (updates.salePrice !== undefined) updateData.sale_price = updates.salePrice;
    if (updates.saleDate !== undefined) updateData.sale_date = updates.saleDate;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName || null;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod || null;
    if (updates.profit !== undefined) updateData.profit = updates.profit;
    if (updates.isCredit !== undefined) updateData.is_credit = updates.isCredit;
    if (updates.creditReceived !== undefined) updateData.credit_received = updates.creditReceived || null;
    if (updates.creditRemaining !== undefined) updateData.credit_remaining = updates.creditRemaining || null;

    const { error } = await (supabase as any)
      .from('sales')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Return operations
  async addReturn(returnData: Omit<Return, 'id'>): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Default to 'refund' if returnType not specified (backward compatibility)
    const returnType = returnData.returnType || 'refund';

    const returnRow: any = {
      sale_id: returnData.saleId,
      phone_id: returnData.phoneId,
      return_type: returnType,
      return_price: returnData.returnPrice,
      new_price: returnData.newPrice,
      return_reason: returnData.returnReason || null,
      return_date: returnData.returnDate,
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('returns')
      .insert(returnRow)
      .select('id')
      .single();

    if (error) throw error;
    if (!data) throw new Error('Failed to insert return');

    const returnId = (data as any).id as number;

    // Get phone to check if it was sold on credit
    const phone = await this.getPhone(returnData.phoneId);
    if (phone) {
      // If phone was sold on credit, cancel the credit record
      if (phone.isCredit) {
        try {
          // Find the sale record
          const sale = await this.getSaleByPhoneId(returnData.phoneId);
          if (sale?.id) {
            // Find the credit record for this sale
            const { data: creditsData, error: creditsError } = await supabase
              .from('credits')
              .select('*')
              .eq('sale_id', sale.id)
              .eq('user_id', userId)
              .limit(1);

            if (!creditsError && creditsData && creditsData.length > 0) {
              const credit = mapCreditFromDB(creditsData[0]);
              // Cancel the credit record
              await this.updateCredit(credit.id!, {
                status: 'cancelled',
                remainingAmount: 0, // Clear remaining amount since phone is returned
              });
            }
          }
        } catch (error) {
          // Log error but don't fail the return operation
          console.error('Error cancelling credit on return:', error);
        }
      }

      // Update phone status back to in_stock
      await this.updatePhone(returnData.phoneId, {
        status: 'in_stock',
        saleDate: 'N/A',
        salePrice: undefined,
        customerName: undefined,
        paymentMethod: undefined,
        isCredit: false, // Clear credit flags
        creditReceived: undefined,
        creditRemaining: undefined,
        purchasePrice: returnData.newPrice,
      });
    }

    return returnId;
  },

  async getAllReturns(): Promise<Return[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReturnFromDB);
  },

  async getReturnsByPhoneId(phoneId: number): Promise<Return[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('phone_id', phoneId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapReturnFromDB);
  },

  // Credit operations
  async addCredit(credit: Omit<Credit, 'id'>): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const creditRow: any = {
      phone_id: credit.phoneId,
      sale_id: credit.saleId,
      customer_name: credit.customerName,
      total_amount: credit.totalAmount,
      received_amount: credit.receivedAmount,
      remaining_amount: credit.remainingAmount,
      sale_date: credit.saleDate,
      payment_method: credit.paymentMethod || null,
      status: credit.remainingAmount > 0 ? 'pending' : 'paid',
      user_id: userId,
    };

    const { data, error } = await supabase
      .from('credits')
      .insert(creditRow)
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  },

  async getAllCredits(): Promise<Credit[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapCreditFromDB);
  },

  async getPendingCredits(): Promise<Credit[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapCreditFromDB);
  },

  async updateCredit(id: number, updates: Partial<Credit>): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const updateData: any = {};
    if (updates.receivedAmount !== undefined) updateData.received_amount = updates.receivedAmount;
    if (updates.remainingAmount !== undefined) updateData.remaining_amount = updates.remainingAmount;
    if (updates.status !== undefined) updateData.status = updates.status; // Supports 'pending', 'paid', 'cancelled'

    const { error } = await (supabase as any)
      .from('credits')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Credit Payment operations
  async recordCreditPayment(
    creditId: number,
    amount: number,
    paymentDate: string,
    paymentMethod?: PaymentMethod
  ): Promise<number> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Get the credit record
    const { data: creditData, error: creditError } = await supabase
      .from('credits')
      .select('*')
      .eq('id', creditId)
      .eq('user_id', userId)
      .single();

    if (creditError || !creditData) {
      throw new Error('Credit record not found');
    }

    const credit = mapCreditFromDB(creditData);

    // Validate payment amount
    if (amount <= 0) {
      throw new Error('Payment amount must be greater than 0');
    }
    if (amount > credit.remainingAmount) {
      throw new Error(`Payment amount (${amount}) cannot exceed remaining amount (${credit.remainingAmount})`);
    }

    // Calculate new amounts
    const newReceivedAmount = credit.receivedAmount + amount;
    const newRemainingAmount = credit.remainingAmount - amount;
    const newStatus: 'pending' | 'paid' = newRemainingAmount <= 0 ? 'paid' : 'pending';

    // Add payment record
    const paymentData = mapCreditPaymentToDB({
      creditId,
      amount,
      paymentDate,
      paymentMethod,
    });
    paymentData.user_id = userId;

    const { data: paymentResult, error: paymentError } = await supabase
      .from('credit_payments')
      .insert(paymentData)
      .select('id')
      .single();

    if (paymentError) throw paymentError;
    if (!paymentResult) throw new Error('Failed to insert payment');

    // Update credit record
    await this.updateCredit(creditId, {
      receivedAmount: newReceivedAmount,
      remainingAmount: newRemainingAmount,
      status: newStatus,
    });

    // Update sale record
    const sale = await this.getSaleByPhoneId(credit.phoneId);
    if (sale?.id) {
      await this.updateSale(sale.id, {
        creditReceived: newReceivedAmount,
        creditRemaining: newRemainingAmount,
      });
    }

    // Update phone record
    await this.updatePhone(credit.phoneId, {
      creditReceived: newReceivedAmount,
      creditRemaining: newRemainingAmount,
    });

    return (paymentResult as any).id as number;
  },

  async getPaymentHistory(creditId: number): Promise<CreditPayment[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('credit_payments')
      .select('*')
      .eq('credit_id', creditId)
      .eq('user_id', userId)
      .order('payment_date', { ascending: true });

    if (error) throw error;
    return data.map(mapCreditPaymentFromDB);
  },

  async getAllCreditPayments(): Promise<CreditPayment[]> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('credit_payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(mapCreditPaymentFromDB);
  },

  // Clear all data (used for backup restore)
  async clearAllData(): Promise<void> {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Delete in order (respecting foreign keys)
    await supabase.from('credit_payments').delete().eq('user_id', userId);
    await supabase.from('credits').delete().eq('user_id', userId);
    await supabase.from('returns').delete().eq('user_id', userId);
    await supabase.from('sales').delete().eq('user_id', userId);
    await supabase.from('phones').delete().eq('user_id', userId);
  },
};

