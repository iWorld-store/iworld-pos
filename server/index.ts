import express from 'express';
import cors from 'cors';
import * as path from 'path';
import * as fs from 'fs';
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
import { exportToCSV, exportToExcel } from './export';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initDatabase();

// API Routes (must come before static files)

// Phone operations
app.get('/api/phones', async (req, res) => {
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

app.get('/api/phones/imei/:imei', async (req, res) => {
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

app.post('/api/phones', async (req, res) => {
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

app.put('/api/phones/:id', async (req, res) => {
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

app.delete('/api/phones/:id', async (req, res) => {
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

app.post('/api/phones/:id/sell', async (req, res) => {
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

app.post('/api/phones/:id/return', async (req, res) => {
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

app.get('/api/returns', async (req, res) => {
  try {
    const returns = getAllReturns();
    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reports
app.post('/api/reports/profit', async (req, res) => {
  try {
    const report = getProfitReport(req.body);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/inventory', async (req, res) => {
  try {
    const report = getInventoryReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Export
app.post('/api/export/csv', async (req, res) => {
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

app.post('/api/export/excel', async (req, res) => {
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'iWorld Store API is running' });
});

// Serve static files from React build (in production/Electron)
// This must come AFTER all API routes
const reactBuildPath = path.join(__dirname, '../dist/react');
if (fs.existsSync(reactBuildPath)) {
  app.use(express.static(reactBuildPath));
  
  // Serve React app for all non-API routes (SPA routing)
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(reactBuildPath, 'index.html'));
    } else {
      res.status(404).json({ error: 'API endpoint not found' });
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  if (fs.existsSync(reactBuildPath)) {
    console.log(`🌐 React app served from: ${reactBuildPath}`);
  }
});

