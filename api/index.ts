import { initDatabase } from '../server/database';
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
} from '../server/database';
import { exportToCSV, exportToExcel } from '../server/export';
import express from 'express';
import cors from 'cors';

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// API Routes (no /api prefix - Vercel handles that)
app.get('/phones', async (req, res) => {
  try {
    const filters = {
      search: req.query.search as string | undefined,
      status: req.query.status as string | undefined,
    };
    const phones = getAllPhones(filters);
    res.json(phones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/phones/imei/:imei', async (req, res) => {
  try {
    const phone = getPhoneByImei(req.params.imei);
    if (!phone) {
      return res.status(404).json({ error: 'Phone not found' });
    }
    res.json(phone);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/phones', async (req, res) => {
  try {
    const result = addPhone(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/phones/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const result = updatePhone(id, req.body);
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
    const result = deletePhone(id);
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
    const result = sellPhone(phoneId, req.body);
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
    const result = processReturn(phoneId, req.body);
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
    const returns = getAllReturns();
    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/reports/profit', async (req, res) => {
  try {
    const report = getProfitReport(req.body);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/reports/inventory', async (_req, res) => {
  try {
    const report = getInventoryReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'iWorld Store API is running' });
});

// Export Express app for Vercel
export default app;

