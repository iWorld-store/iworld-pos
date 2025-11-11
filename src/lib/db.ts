import Dexie, { Table } from 'dexie';
import { Phone, Sale, Return, Credit, CreditPayment, PaymentMethod } from '@/types';

export class PhoneDatabase extends Dexie {
  phones!: Table<Phone, number>;
  sales!: Table<Sale, number>;
  returns!: Table<Return, number>;
  credits!: Table<Credit, number>;
  creditPayments!: Table<CreditPayment, number>;

  constructor() {
    super('PhonePOSDatabase');
    
    this.version(2).stores({
      phones: '++id, imei1, imei2, modelName, status, purchaseDate, saleDate',
      sales: '++id, phoneId, saleDate, receiptNumber',
      returns: '++id, saleId, phoneId, returnDate',
      credits: '++id, phoneId, saleId, customerName, status, saleDate',
    });

    this.version(3).stores({
      phones: '++id, imei1, imei2, modelName, status, purchaseDate, saleDate',
      sales: '++id, phoneId, saleDate, receiptNumber',
      returns: '++id, saleId, phoneId, returnDate',
      credits: '++id, phoneId, saleId, customerName, status, saleDate',
      creditPayments: '++id, creditId, paymentDate',
    });
  }
}

export const db = new PhoneDatabase();

// Helper functions for database operations
export const phoneDB = {
  // Phone operations
  async addPhone(phone: Omit<Phone, 'id'>): Promise<number> {
    const id = await db.phones.add({
      ...phone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Phone);
    
    return id as number;
  },

  async updatePhone(id: number, updates: Partial<Phone>): Promise<void> {
    await db.phones.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  async getPhone(id: number): Promise<Phone | undefined> {
    return await db.phones.get(id);
  },

  async getAllPhones(): Promise<Phone[]> {
    return await db.phones.toArray();
  },

  async getPhonesByStatus(status: Phone['status']): Promise<Phone[]> {
    return await db.phones.where('status').equals(status).toArray();
  },

  async searchPhones(query: string): Promise<Phone[]> {
    const lowerQuery = query.toLowerCase();
    const allPhones = await db.phones.toArray();
    return allPhones.filter(phone => 
      phone.imei1.toLowerCase().includes(lowerQuery) ||
      phone.imei2?.toLowerCase().includes(lowerQuery) ||
      phone.modelName.toLowerCase().includes(lowerQuery)
    );
  },

  async deletePhone(id: number): Promise<void> {
    // Get phone to check status
    const phone = await this.getPhone(id);
    if (!phone) {
      throw new Error('Phone not found');
    }

    // If phone is sold, cascade delete related records
    if (phone.status === 'sold') {
      // Delete related credits
      await db.credits.where('phoneId').equals(id).delete();
      
      // Delete related returns
      const relatedReturns = await db.returns.where('phoneId').equals(id).toArray();
      for (const returnRecord of relatedReturns) {
        await db.returns.delete(returnRecord.id!);
      }
      
      // Delete related sales
      await db.sales.where('phoneId').equals(id).delete();
    }
    
    // Delete the phone
    await db.phones.delete(id);
  },

  // Sale operations
  async addSale(sale: Omit<Sale, 'id'>): Promise<number> {
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

    const saleData: Sale = {
      ...sale,
      isResale: isResale || sale.isResale, // Use provided value or auto-detected
      originalReturnId: originalReturnId || sale.originalReturnId,
      createdAt: new Date().toISOString(),
    };

    const id = await db.sales.add(saleData);
    
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
    
    return id as number;
  },

  async getAllSales(): Promise<Sale[]> {
    return await db.sales.toArray();
  },

  async getResaleSales(): Promise<Sale[]> {
    const allSales = await db.sales.toArray();
    return allSales.filter(sale => sale.isResale === true);
  },

  async getSaleByPhoneId(phoneId: number): Promise<Sale | undefined> {
    return await db.sales.where('phoneId').equals(phoneId).first();
  },

  async updateSale(id: number, updates: Partial<Sale>): Promise<void> {
    await db.sales.update(id, updates);
  },

  // Return operations
  async addReturn(returnData: Omit<Return, 'id'>): Promise<number> {
    // Default to 'refund' if returnType not specified (backward compatibility)
    const returnWithType = {
      ...returnData,
      returnType: returnData.returnType || 'refund',
      createdAt: new Date().toISOString(),
    } as Return;
    
    const id = await db.returns.add(returnWithType);
    
    // Update phone status back to in_stock and update price
    const phone = await this.getPhone(returnData.phoneId);
    if (phone) {
      // If phone was sold on credit, cancel the credit record
      if (phone.isCredit) {
        try {
          // Find the sale record
          const sale = await this.getSaleByPhoneId(returnData.phoneId);
          if (sale?.id) {
            // Find the credit record for this sale
            const allCredits = await this.getAllCredits();
            const credit = allCredits.find(c => c.saleId === sale.id);
            if (credit?.id) {
              // Cancel the credit record
              await this.updateCredit(credit.id, {
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

      await this.updatePhone(returnData.phoneId, {
        status: 'in_stock',
        saleDate: 'N/A',
        salePrice: undefined,
        customerName: undefined,
        paymentMethod: undefined,
        isCredit: false, // Clear credit flags
        creditReceived: undefined,
        creditRemaining: undefined,
        purchasePrice: returnData.newPrice, // Update to new price
      });
    }
    
    return id as number;
  },

  async getAllReturns(): Promise<Return[]> {
    return await db.returns.toArray();
  },

  async getReturnsByPhoneId(phoneId: number): Promise<Return[]> {
    return await db.returns.where('phoneId').equals(phoneId).toArray();
  },

  // Credit operations
  async addCredit(credit: Omit<Credit, 'id'>): Promise<number> {
    const id = await db.credits.add({
      ...credit,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Credit);
    
    return id as number;
  },

  async getAllCredits(): Promise<Credit[]> {
    return await db.credits.toArray();
  },

  async getPendingCredits(): Promise<Credit[]> {
    // Get only pending credits (exclude cancelled and paid)
    return await db.credits
      .where('status')
      .equals('pending')
      .toArray();
  },

  async updateCredit(id: number, updates: Partial<Credit>): Promise<void> {
    await db.credits.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // Credit Payment operations
  async recordCreditPayment(
    creditId: number,
    amount: number,
    paymentDate: string,
    paymentMethod?: PaymentMethod
  ): Promise<number> {
    // Get the credit record
    const credit = await db.credits.get(creditId);
    if (!credit) {
      throw new Error('Credit record not found');
    }

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
    const paymentId = await db.creditPayments.add({
      creditId,
      amount,
      paymentDate,
      paymentMethod,
      createdAt: new Date().toISOString(),
    } as CreditPayment);

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

    return paymentId as number;
  },

  async getPaymentHistory(creditId: number): Promise<CreditPayment[]> {
    return await db.creditPayments
      .where('creditId')
      .equals(creditId)
      .sortBy('paymentDate');
  },

  async getAllCreditPayments(): Promise<CreditPayment[]> {
    return await db.creditPayments.toArray();
  },

  // Clear all data (used for backup restore)
  async clearAllData(): Promise<void> {
    await Promise.all([
      db.phones.clear(),
      db.sales.clear(),
      db.returns.clear(),
      db.credits.clear(),
      db.creditPayments.clear(),
    ]);
  },
};

