import Database from 'better-sqlite3';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

let db: Database.Database | null = null;

function getDatabasePath(): string {
  // For Vercel/serverless: Use /tmp (writable directory, but data won't persist!)
  const isVercel = process.env.VERCEL || process.env.VERCEL_ENV;
  
  if (isVercel) {
    // Vercel serverless: Use /tmp (note: data won't persist across deployments!)
    // SQLite doesn't work well on Vercel anyway due to native module issues
    const dbDir = '/tmp';
    return path.join(dbDir, 'database.db');
  }
  
  // For Railway: Use project root (persistent storage)
  // Railway has persistent volumes, so data will persist
  const isRailway = process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY;
  
  if (isRailway) {
    // Railway: Use project root for persistent storage
    const dbDir = process.cwd();
    const dataDir = path.join(dbDir, 'data');
    
    // Create data directory if it doesn't exist
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Create backups directory
    const backupsDir = path.join(dataDir, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }
    
    return path.join(dataDir, 'database.db');
  }
  
  // Local development: Use user's home directory
  const platform = process.platform;
  let dbDir: string;
  
  if (platform === 'win32') {
    dbDir = path.join(os.homedir(), 'AppData', 'Local', 'iWorldStore');
  } else {
    dbDir = path.join(os.homedir(), '.local', 'share', 'iWorldStore');
  }
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  // Create backups directory
  const backupsDir = path.join(dbDir, 'backups');
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
  
  return path.join(dbDir, 'database.db');
}

export function initDatabase() {
  try {
    const dbPath = getDatabasePath();
    console.log('Initializing database at:', dbPath);
    
    // Ensure directory exists
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new Database(dbPath);
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Create Phones table
    db.exec(`
      CREATE TABLE IF NOT EXISTS phones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imei1 TEXT NOT NULL,
        imei2 TEXT,
        model_name TEXT,
        storage TEXT,
        color TEXT,
        condition TEXT,
        unlock_status TEXT,
        purchase_date DATETIME NOT NULL,
        purchase_price DECIMAL(10,2) NOT NULL,
        sale_date DATETIME,
        sale_price DECIMAL(10,2),
        status TEXT NOT NULL DEFAULT 'in_stock',
        vendor TEXT,
        customer_name TEXT,
        payment_method TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_imei1 ON phones(imei1);
      CREATE INDEX IF NOT EXISTS idx_imei2 ON phones(imei2);
      CREATE INDEX IF NOT EXISTS idx_status ON phones(status);
    `);
    
    // Create Returns table
    db.exec(`
      CREATE TABLE IF NOT EXISTS returns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_id INTEGER NOT NULL,
        return_date DATETIME NOT NULL,
        return_reason TEXT NOT NULL,
        refund_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (phone_id) REFERENCES phones(id)
      );
      
      CREATE INDEX IF NOT EXISTS idx_phone_id ON returns(phone_id);
      CREATE INDEX IF NOT EXISTS idx_return_date ON returns(return_date);
    `);
    
    console.log('Database initialized at:', dbPath);
  } catch (error: any) {
    console.error('Database initialization failed:', error);
    throw new Error(`Failed to initialize database: ${error.message}`);
  }
}

function getDb(): Database.Database {
  if (!db) {
    initDatabase();
  }
  return db!;
}

// Phone operations
export function getAllPhones(filters?: {
  search?: string;
  status?: string;
}): any[] {
  const database = getDb();
  let query = 'SELECT * FROM phones WHERE 1=1';
  const params: any[] = [];
  
  if (filters?.search) {
    query += ' AND (imei1 LIKE ? OR imei2 LIKE ? OR model_name LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  if (filters?.status && filters.status !== 'all') {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  
  query += ' ORDER BY created_at DESC';
  
  return database.prepare(query).all(...params) as any[];
}

export function getPhoneByImei(imei: string): any | null {
  const database = getDb();
  const phone = database
    .prepare('SELECT * FROM phones WHERE imei1 LIKE ? OR imei2 LIKE ?')
    .get(`%${imei}%`, `%${imei}%`) as any;
  return phone || null;
}

export function addPhone(phoneData: {
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
}): { success: boolean; id?: number; error?: string } {
  const database = getDb();
  
  try {
    // Check for duplicate IMEI
    const existing = getPhoneByImei(phoneData.imei1);
    if (existing) {
      const modelInfo = existing.model_name ? ` (${existing.model_name})` : '';
      return { success: false, error: `IMEI "${phoneData.imei1}"${modelInfo} already exists in the database. Please use a different IMEI or check the existing phone in inventory.` };
    }
    
    const result = database
      .prepare(`
        INSERT INTO phones (
          imei1, imei2, model_name, storage, color, condition, 
          unlock_status, purchase_date, purchase_price, vendor, notes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in_stock')
      `)
      .run(
        phoneData.imei1,
        phoneData.imei2 || null,
        phoneData.model_name || null,
        phoneData.storage || null,
        phoneData.color || null,
        phoneData.condition || null,
        phoneData.unlock_status || null,
        phoneData.purchase_date,
        phoneData.purchase_price,
        phoneData.vendor || null,
        phoneData.notes || null
      );
    
    return { success: true, id: result.lastInsertRowid as number };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function updatePhone(
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
): { success: boolean; error?: string } {
  const database = getDb();
  
  try {
    const phone = database.prepare('SELECT * FROM phones WHERE id = ?').get(id) as any;
    if (!phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status === 'sold') {
      return { success: false, error: 'Cannot edit sold phone' };
    }
    
    database
      .prepare(`
        UPDATE phones SET
          model_name = COALESCE(?, model_name),
          storage = COALESCE(?, storage),
          color = COALESCE(?, color),
          condition = COALESCE(?, condition),
          unlock_status = COALESCE(?, unlock_status),
          purchase_price = COALESCE(?, purchase_price),
          vendor = COALESCE(?, vendor),
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(
        phoneData.model_name,
        phoneData.storage,
        phoneData.color,
        phoneData.condition,
        phoneData.unlock_status,
        phoneData.purchase_price,
        phoneData.vendor,
        phoneData.notes,
        id
      );
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function deletePhone(id: number): { success: boolean; error?: string } {
  const database = getDb();
  
  try {
    const phone = database.prepare('SELECT * FROM phones WHERE id = ?').get(id) as any;
    if (!phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status === 'sold' || phone.sale_date) {
      return { success: false, error: 'Cannot delete sold phone' };
    }
    
    database.prepare('DELETE FROM phones WHERE id = ?').run(id);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function sellPhone(
  phoneId: number,
  saleData: {
    sale_price: number;
    customer_name?: string;
    payment_method?: string;
    notes?: string;
  }
): { success: boolean; error?: string } {
  const database = getDb();
  
  try {
    const phone = database.prepare('SELECT * FROM phones WHERE id = ?').get(phoneId) as any;
    if (!phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status === 'sold') {
      return { success: false, error: `This phone was already sold on ${phone.sale_date}` };
    }
    
    database
      .prepare(`
        UPDATE phones SET
          status = 'sold',
          sale_date = CURRENT_TIMESTAMP,
          sale_price = ?,
          customer_name = ?,
          payment_method = ?,
          notes = COALESCE(?, notes),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(
        saleData.sale_price,
        saleData.customer_name || null,
        saleData.payment_method || null,
        saleData.notes || null,
        phoneId
      );
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function processReturn(
  phoneId: number,
  returnData: {
    return_reason: string;
    refund_amount: number;
    notes?: string;
  }
): { success: boolean; error?: string } {
  const database = getDb();
  
  try {
    const phone = database.prepare('SELECT * FROM phones WHERE id = ?').get(phoneId) as any;
    if (!phone) {
      return { success: false, error: 'Phone not found' };
    }
    
    if (phone.status !== 'sold') {
      return { success: false, error: 'This phone is currently in stock and hasn\'t been sold yet.' };
    }
    
    // Create return record
    database
      .prepare(`
        INSERT INTO returns (phone_id, return_date, return_reason, refund_amount, notes)
        VALUES (?, CURRENT_TIMESTAMP, ?, ?, ?)
      `)
      .run(
        phoneId,
        returnData.return_reason,
        returnData.refund_amount,
        returnData.notes || null
      );
    
    // Restock phone
    database
      .prepare(`
        UPDATE phones SET
          status = 'in_stock',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
      .run(phoneId);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export function getAllReturns(): any[] {
  const database = getDb();
  return database
    .prepare(`
      SELECT r.*, p.model_name, p.imei1, p.sale_price
      FROM returns r
      JOIN phones p ON r.phone_id = p.id
      ORDER BY r.return_date DESC
    `)
    .all() as any[];
}

// Reports
export function getProfitReport(dateRange: {
  type: 'today' | 'week' | 'month' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}): any {
  const database = getDb();
  
  let dateFilter = '';
  const params: any[] = [];
  
  if (dateRange.type === 'today') {
    dateFilter = "DATE(sale_date) = DATE('now')";
  } else if (dateRange.type === 'week') {
    dateFilter = "DATE(sale_date) >= DATE('now', '-7 days')";
  } else if (dateRange.type === 'month') {
    dateFilter = "DATE(sale_date) >= DATE('now', 'start of month')";
  } else if (dateRange.type === 'year') {
    dateFilter = "DATE(sale_date) >= DATE('now', 'start of year')";
  } else if (dateRange.type === 'custom' && dateRange.startDate && dateRange.endDate) {
    dateFilter = "DATE(sale_date) >= DATE(?) AND DATE(sale_date) <= DATE(?)";
    params.push(dateRange.startDate, dateRange.endDate);
  }
  
  // Get sales in date range
  const sales = database
    .prepare(`
      SELECT * FROM phones 
      WHERE status = 'sold' 
      ${dateFilter ? `AND ${dateFilter}` : ''}
    `)
    .all(...params) as any[];
  
  // Get returns in date range
  let returnDateFilter = dateFilter.replace('sale_date', 'return_date');
  const returns = database
    .prepare(`
      SELECT * FROM returns 
      WHERE 1=1
      ${returnDateFilter ? `AND ${returnDateFilter}` : ''}
    `)
    .all(...params) as any[];
  
  const totalSales = sales.length;
  const totalSalesRevenue = sales.reduce((sum, s) => sum + (parseFloat(s.sale_price) || 0), 0);
  const totalPurchaseCosts = sales.reduce((sum, s) => sum + (parseFloat(s.purchase_price) || 0), 0);
  const totalRefunds = returns.reduce((sum, r) => sum + (parseFloat(r.refund_amount) || 0), 0);
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
    returns,
  };
}

export function getInventoryReport(): any {
  const database = getDb();
  
  const inStock = database
    .prepare("SELECT * FROM phones WHERE status = 'in_stock'")
    .all() as any[];
  
  const currentStockCount = inStock.length;
  const currentStockValue = inStock.reduce((sum, p) => sum + (parseFloat(p.purchase_price) || 0), 0);
  
  // Best selling models
  const bestSelling = database
    .prepare(`
      SELECT model_name, COUNT(*) as sales_count
      FROM phones
      WHERE status = 'sold'
      GROUP BY model_name
      ORDER BY sales_count DESC
      LIMIT 10
    `)
    .all() as any[];
  
  // Return rate
  const totalSales = database
    .prepare("SELECT COUNT(*) as count FROM phones WHERE status = 'sold'")
    .get() as any;
  const totalReturns = database
    .prepare("SELECT COUNT(*) as count FROM returns")
    .get() as any;
  const returnRate = totalSales.count > 0 
    ? (totalReturns.count / totalSales.count) * 100 
    : 0;
  
  return {
    currentStockCount,
    currentStockValue,
    bestSellingModels: bestSelling,
    returnRate,
    totalPhones: database.prepare("SELECT COUNT(*) as count FROM phones").get() as any,
  };
}


