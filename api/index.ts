import { initDatabase } from './database';
import {
  getAllPhones,
  getPhoneByImei,
  addPhone,
  updatePhone,
  deletePhone,
  sellPhone,
  processReturn,
  getAllReturns,
  getProfitReport,
  getInventoryReport,
} from './database';

// Export functions - stub for Vercel (file system operations don't work on serverless)
async function exportToCSV(data: any[], filename: string): Promise<{ success: boolean; path?: string; error?: string }> {
  return { success: false, error: 'Export not available on Vercel serverless' };
}

async function exportToExcel(data: any[], filename: string): Promise<{ success: boolean; path?: string; error?: string }> {
  return { success: false, error: 'Export not available on Vercel serverless' };
}
import express from 'express';
import cors from 'cors';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize database (in-memory, no setup required!)
// In Vercel, functions are stateless, but in-memory works perfectly
let dbInitialized = false;
async function ensureDatabaseInitialized() {
  if (!dbInitialized) {
    try {
      console.log('🔄 Initializing database...');
      await initDatabase();
      dbInitialized = true;
      console.log('✅ Database initialized successfully');
    } catch (error: any) {
      console.error('❌ Database initialization failed:', error);
      console.error('Error stack:', error.stack);
      // Don't throw - in-memory should always work
      // But log it so we can see what's wrong
    }
  }
}

// API Routes (no /api prefix - Vercel handles that)
app.get('/phones', async (req, res) => {
  try {
    console.log('📞 /phones endpoint called');
    await ensureDatabaseInitialized();
    console.log('✅ Database initialized');
    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    };
    console.log('🔍 Filters:', filters);
    const phones = await getAllPhones(filters);
    console.log(`✅ Found ${phones.length} phones`);
    res.json(phones);
  } catch (error: any) {
    console.error('❌ Error in /phones:', error);
    console.error('Error stack:', error.stack);
    const errorMessage = error.message || 'Failed to fetch phones';
    res.status(500).json({ 
      error: errorMessage,
      details: error.stack || 'No stack trace available'
    });
  }
});

app.get('/phones/imei/:imei', async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    const phone = await getPhoneByImei(req.params.imei);
    if (!phone) {
      return res.status(404).json({ error: 'Phone not found' });
    }
    res.json(phone);
  } catch (error: any) {
    console.error('Error in /phones/imei:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/phones', async (req, res) => {
  try {
    await ensureDatabaseInitialized();
    const result = await addPhone(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    console.error('Error in POST /phones:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.put('/phones/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await updatePhone(id, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/phones/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = await deletePhone(id);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/phones/:id/sell', async (req, res) => {
  try {
    const phoneId = parseInt(req.params.id);
    const result = await sellPhone(phoneId, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/phones/:id/return', async (req, res) => {
  try {
    const phoneId = parseInt(req.params.id);
    const result = await processReturn(phoneId, req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/returns', async (_req, res) => {
  try {
    await ensureDatabaseInitialized();
    const returns = await getAllReturns();
    res.json(returns);
  } catch (error: any) {
    console.error('Error in /returns:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/reports/profit', async (req, res) => {
  try {
    const report = await getProfitReport(req.body);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/reports/inventory', async (_req, res) => {
  try {
    await ensureDatabaseInitialized();
    const report = await getInventoryReport();
    res.json(report);
  } catch (error: any) {
    console.error('Error in /reports/inventory:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.post('/export/csv', async (req, res) => {
  try {
    const { data, filename } = req.body;
    const result = await exportToCSV(data, filename);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/export/excel', async (req, res) => {
  try {
    const { data, filename } = req.body;
    const result = await exportToExcel(data, filename);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', async (_req, res) => {
  try {
    await ensureDatabaseInitialized();
    res.json({ 
      status: 'ok', 
      message: 'iWorld Store API is running',
      database: 'in-memory (no setup required!)',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({ 
      status: 'error', 
      message: 'iWorld Store API is running but database initialization failed',
      database: 'error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Simple test endpoint
app.get('/test', (_req, res) => {
  res.json({ 
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    nodeVersion: process.version
  });
});

// Error handling middleware (must be after routes)
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    details: process.env.VERCEL ? 'Check Vercel function logs for details' : err.stack
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Export Express app for Vercel
export default app;

