import Dexie, { Table } from 'dexie';
import { Phone, Sale, Return, Credit } from '@/types';

export class PhoneDatabase extends Dexie {
  phones!: Table<Phone, number>;
  sales!: Table<Sale, number>;
  returns!: Table<Return, number>;
  credits!: Table<Credit, number>;

  constructor() {
    super('PhonePOSDatabase');
    
    this.version(2).stores({
      phones: '++id, imei1, imei2, modelName, status, purchaseDate, saleDate',
      sales: '++id, phoneId, saleDate, receiptNumber',
      returns: '++id, saleId, phoneId, returnDate',
      credits: '++id, phoneId, saleId, customerName, status, saleDate',
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

  // Sale operations
  async addSale(sale: Omit<Sale, 'id'>): Promise<number> {
    const id = await db.sales.add({
      ...sale,
      createdAt: new Date().toISOString(),
    } as Sale);
    
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

  // Return operations
  async addReturn(returnData: Omit<Return, 'id'>): Promise<number> {
    const id = await db.returns.add({
      ...returnData,
      createdAt: new Date().toISOString(),
    } as Return);
    
    // Update phone status back to in_stock and update price
    const phone = await this.getPhone(returnData.phoneId);
    if (phone) {
      await this.updatePhone(returnData.phoneId, {
        status: 'in_stock',
        saleDate: 'N/A',
        salePrice: undefined,
        customerName: undefined,
        paymentMethod: undefined,
        purchasePrice: returnData.newPrice, // Update to new price
      });
    }
    
    return id as number;
  },

  async getAllReturns(): Promise<Return[]> {
    return await db.returns.toArray();
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
    return await db.credits.where('status').equals('pending').toArray();
  },

  async updateCredit(id: number, updates: Partial<Credit>): Promise<void> {
    await db.credits.update(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },

  // Clear all data (used for backup restore)
  async clearAllData(): Promise<void> {
    await Promise.all([
      db.phones.clear(),
      db.sales.clear(),
      db.returns.clear(),
      db.credits.clear(),
    ]);
  },
};

