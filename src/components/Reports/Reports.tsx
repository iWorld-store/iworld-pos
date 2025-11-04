import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { FileDownload as ExportIcon } from '@mui/icons-material';
import { ProfitReport, InventoryReport, DateRange } from '../../types';
import { formatCurrency } from '../../utils/validation';
import { api } from '../../services/api';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'profit' | 'inventory'>('profit');
  const [dateRange, setDateRange] = useState<DateRange>({ type: 'today' });
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [profitReport, setProfitReport] = useState<ProfitReport | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    if (reportType === 'profit') {
      loadProfitReport();
    } else {
      loadInventoryReport();
    }
  }, [reportType, dateRange]);

  const handleCustomDateChange = () => {
    if (customStartDate && customEndDate) {
      setDateRange({
        type: 'custom',
        startDate: customStartDate.toISOString().split('T')[0],
        endDate: customEndDate.toISOString().split('T')[0],
      });
    }
  };

  const loadProfitReport = async () => {
    setLoading(true);
    try {
      const report = await api.getProfitReport(dateRange);
      setProfitReport(report as ProfitReport);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading profit report',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadInventoryReport = async () => {
    setLoading(true);
    try {
      const report = await api.getInventoryReport();
      setInventoryReport(report as InventoryReport);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading inventory report',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportProfit = async (format: 'csv' | 'excel') => {
    if (!profitReport) return;

    try {
      const data = [
        {
          Period: dateRange.type,
          StartDate: dateRange.startDate || 'N/A',
          EndDate: dateRange.endDate || 'N/A',
          TotalSales: profitReport.totalSales,
          TotalSalesRevenue: profitReport.totalSalesRevenue,
          TotalPurchaseCosts: profitReport.totalPurchaseCosts,
          TotalRefunds: profitReport.totalRefunds,
          NetProfit: profitReport.netProfit,
          AverageProfitPerSale: profitReport.averageProfitPerSale,
        },
      ];

      const filename = `profit_report_${new Date().toISOString().split('T')[0]}`;
      
      const result = format === 'csv'
        ? await api.exportToCSV(data, filename)
        : await api.exportToExcel(data, filename);

      const exportResult = result as { success: boolean; path?: string; error?: string };
      if (exportResult.success) {
        setSnackbar({
          open: true,
          message: `Exported successfully to ${exportResult.path}`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: exportResult.error || 'Export failed',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error exporting data',
        severity: 'error',
      });
    }
  };

  const handleExportInventory = async (format: 'csv' | 'excel') => {
    if (!inventoryReport) return;

    try {
      const data = [
        {
          CurrentStockCount: inventoryReport.currentStockCount,
          CurrentStockValue: inventoryReport.currentStockValue,
          ReturnRate: `${inventoryReport.returnRate.toFixed(2)}%`,
          TotalPhones: inventoryReport.totalPhones.count,
        },
        ...inventoryReport.bestSellingModels.map((model) => ({
          ModelName: model.model_name,
          SalesCount: model.sales_count,
        })),
      ];

      const filename = `inventory_report_${new Date().toISOString().split('T')[0]}`;
      
      const result = format === 'csv'
        ? await api.exportToCSV(data, filename)
        : await api.exportToExcel(data, filename);

      const exportResult = result as { success: boolean; path?: string; error?: string };
      if (exportResult.success) {
        setSnackbar({
          open: true,
          message: `Exported successfully to ${exportResult.path}`,
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: exportResult.error || 'Export failed',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error exporting data',
        severity: 'error',
      });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Typography 
          variant="h4" 
          component="h1"
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Reports
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {reportType === 'profit' && profitReport && (
            <>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => handleExportProfit('csv')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => handleExportProfit('excel')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Export Excel
              </Button>
            </>
          )}
          {reportType === 'inventory' && inventoryReport && (
            <>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => handleExportInventory('csv')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => handleExportInventory('excel')}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  },
                }}
              >
                Export Excel
              </Button>
            </>
          )}
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <FormControl component="fieldset">
                <FormLabel component="legend">Report Type</FormLabel>
                <RadioGroup
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'profit' | 'inventory')}
                >
                  <FormControlLabel value="profit" control={<Radio />} label="Profit Report" />
                  <FormControlLabel value="inventory" control={<Radio />} label="Inventory Report" />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        {reportType === 'profit' && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <FormControl component="fieldset" fullWidth>
                  <FormLabel component="legend">Time Period</FormLabel>
                  <RadioGroup
                    value={dateRange.type}
                    onChange={(e) => {
                      const newType = e.target.value as DateRange['type'];
                      if (newType === 'custom') {
                        setDateRange({ type: newType });
                      } else {
                        setDateRange({ type: newType });
                        loadProfitReport();
                      }
                    }}
                  >
                    <FormControlLabel value="today" control={<Radio />} label="Today" />
                    <FormControlLabel value="week" control={<Radio />} label="This Week" />
                    <FormControlLabel value="month" control={<Radio />} label="This Month" />
                    <FormControlLabel value="year" control={<Radio />} label="This Year" />
                    <FormControlLabel value="custom" control={<Radio />} label="Custom Range" />
                  </RadioGroup>
                  {dateRange.type === 'custom' && (
                    <Box sx={{ mt: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Start Date"
                            type="date"
                            fullWidth
                            value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setCustomStartDate(e.target.value ? new Date(e.target.value) : null)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="End Date"
                            type="date"
                            fullWidth
                            value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => setCustomEndDate(e.target.value ? new Date(e.target.value) : null)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            onClick={() => {
                              handleCustomDateChange();
                              setTimeout(loadProfitReport, 100);
                            }}
                            disabled={!customStartDate || !customEndDate}
                            fullWidth
                          >
                            Load Report
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {reportType === 'profit' && profitReport && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      sx={{ 
                        mb: 3,
                        fontWeight: 600,
                        color: 'primary.main',
                      }}
                    >
                      Profit Report
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Total Number of Sales
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {profitReport.totalSales}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Total Sales Revenue
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatCurrency(profitReport.totalSalesRevenue)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(244, 67, 54, 0.1)',
                            border: '1px solid rgba(244, 67, 54, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Total Purchase Costs
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                            {formatCurrency(profitReport.totalPurchaseCosts)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4} lg={3}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(255, 152, 0, 0.1)',
                            border: '1px solid rgba(255, 152, 0, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Total Refunds
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {formatCurrency(profitReport.totalRefunds)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)',
                            border: '2px solid rgba(76, 175, 80, 0.3)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Net Profit
                          </Typography>
                          <Typography variant="h2" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {formatCurrency(profitReport.netProfit)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.15) 0%, rgba(76, 175, 80, 0.05) 100%)',
                            border: '2px solid rgba(76, 175, 80, 0.3)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Average Profit Per Sale
                          </Typography>
                          <Typography variant="h3" sx={{ fontWeight: 700, color: 'success.main' }}>
                            {formatCurrency(profitReport.averageProfitPerSale)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {reportType === 'inventory' && inventoryReport && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      sx={{ 
                        mb: 3,
                        fontWeight: 600,
                        color: 'primary.main',
                      }}
                    >
                      Inventory Report
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Current Stock Count
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {inventoryReport.currentStockCount}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Current Stock Value
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {formatCurrency(inventoryReport.currentStockValue)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: 'rgba(255, 152, 0, 0.1)',
                            border: '1px solid rgba(255, 152, 0, 0.2)',
                          }}
                        >
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                            Return Rate
                          </Typography>
                          <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                            {inventoryReport.returnRate.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)',
                    border: '1px solid rgba(33, 150, 243, 0.2)',
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      sx={{ 
                        mb: 3,
                        fontWeight: 600,
                        color: 'primary.main',
                      }}
                    >
                      Best Selling Models
                    </Typography>
                    <TableContainer
                      sx={{
                        borderRadius: 2,
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Model Name</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: 'text.primary' }}>Number of Sales</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {inventoryReport.bestSellingModels.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                                <Typography color="textSecondary">No sales data available</Typography>
                              </TableCell>
                            </TableRow>
                          ) : (
                            inventoryReport.bestSellingModels.map((model, index) => (
                              <TableRow key={index} hover>
                                <TableCell>{model.model_name || 'Unknown'}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 500 }}>
                                  {model.sales_count}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reports;

