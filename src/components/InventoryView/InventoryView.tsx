import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { Phone } from '../../types';
import { formatCurrency, formatDateOnly } from '../../utils/validation';
import { api } from '../../services/api';
import PhoneDetailsDialog from './PhoneDetailsDialog';
import EditPhoneDialog from './EditPhoneDialog';

const InventoryView: React.FC = () => {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [filteredPhones, setFilteredPhones] = useState<Phone[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPhone, setSelectedPhone] = useState<Phone | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<Phone | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadPhones();
  }, []);

  useEffect(() => {
    filterPhones();
  }, [searchTerm, statusFilter, phones]);

  const loadPhones = async () => {
    try {
      // Load all phones - no server-side filtering
      const filters: any = {};
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const data = await api.getAllPhones(filters);
      setPhones(data as Phone[]);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error loading inventory',
        severity: 'error',
      });
    }
  };

  const filterPhones = () => {
    let filtered = [...phones];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((p) =>
        p.imei1?.toLowerCase().includes(search) ||
        p.imei2?.toLowerCase().includes(search) ||
        p.model_name?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    setFilteredPhones(filtered);
  };

  const handleView = (phone: Phone) => {
    setSelectedPhone(phone);
    setViewDialogOpen(true);
  };

  const handleEdit = (phone: Phone) => {
    if (phone.status === 'in_stock') {
      setSelectedPhone(phone);
      setEditDialogOpen(true);
    }
  };

  const handleDelete = (phone: Phone) => {
    if (phone.status !== 'sold' && !phone.sale_date) {
      setPhoneToDelete(phone);
      setDeleteDialogOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (phoneToDelete) {
      try {
        const result = await api.deletePhone(phoneToDelete.id);
        if ((result as { success: boolean; error?: string }).success) {
          setSnackbar({
            open: true,
            message: 'Phone deleted successfully',
            severity: 'success',
          });
          loadPhones();
        } else {
          const errorResult = result as { success: boolean; error?: string };
          setSnackbar({
            open: true,
            message: errorResult.error || 'Failed to delete phone',
            severity: 'error',
          });
        }
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error deleting phone',
          severity: 'error',
        });
      }
    }
    setDeleteDialogOpen(false);
    setPhoneToDelete(null);
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const data = filteredPhones.map((p) => ({
        id: p.id,
        imei1: p.imei1,
        imei2: p.imei2 || '',
        model_name: p.model_name || '',
        storage: p.storage || '',
        color: p.color || '',
        condition: p.condition || '',
        unlock_status: p.unlock_status || '',
        purchase_date: p.purchase_date,
        purchase_price: p.purchase_price,
        sale_date: p.sale_date || '',
        sale_price: p.sale_price || '',
        status: p.status,
        vendor: p.vendor || '',
        customer_name: p.customer_name || '',
        payment_method: p.payment_method || '',
        notes: p.notes || '',
      }));

      const filename = `inventory_${new Date().toISOString().split('T')[0]}`;
      
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

  const getStatusColor = (status: string): 'success' | 'primary' | 'warning' | 'default' => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'sold':
        return 'primary';
      case 'returned':
        return 'warning';
      default:
        return 'default';
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
          Inventory View
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={() => handleExport('csv')}
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
            onClick={() => handleExport('excel')}
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
        </Box>
      </Box>

      <Card sx={{ mb: 3, p: 2, background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)', border: '1px solid rgba(33, 150, 243, 0.2)' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              placeholder="Search by IMEI or Model Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchTerm('');
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                },
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={statusFilter}
                label="Status Filter"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  backgroundColor: 'background.paper',
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="sold">Sold</MenuItem>
                <MenuItem value="returned">Returned</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Card>

      <TableContainer 
        component={Paper}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>IMEI1</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Model Name</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Storage</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Color</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Purchase Price</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Purchase Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Sale Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Sale Price</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPhones.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <InventoryIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                    <Typography variant="h6" color="textSecondary">
                      No phones found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm ? 'Try adjusting your search or filter criteria' : 'No inventory items available'}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              filteredPhones.map((phone) => (
                <TableRow key={phone.id} hover>
                  <TableCell>{phone.imei1}</TableCell>
                  <TableCell>{phone.model_name || 'N/A'}</TableCell>
                  <TableCell>{phone.storage || 'N/A'}</TableCell>
                  <TableCell>{phone.color || 'N/A'}</TableCell>
                  <TableCell>
                    {phone.purchase_price ? formatCurrency(parseFloat(phone.purchase_price.toString())) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={phone.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(phone.status) as 'success' | 'primary' | 'warning' | 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {phone.purchase_date ? formatDateOnly(phone.purchase_date) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {phone.sale_date ? formatDateOnly(phone.sale_date) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {phone.sale_price ? formatCurrency(parseFloat(phone.sale_price.toString())) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleView(phone)}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(phone)}
                        disabled={phone.status !== 'in_stock'}
                        title={phone.status !== 'in_stock' ? 'Cannot edit sold phone' : 'Edit'}
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                          },
                          '&.Mui-disabled': {
                            color: 'text.disabled',
                          },
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(phone)}
                        disabled={phone.status === 'sold' || !!phone.sale_date}
                        title={phone.status === 'sold' ? 'Cannot delete sold phone' : 'Delete'}
                        sx={{
                          color: 'error.main',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)',
                          },
                          '&.Mui-disabled': {
                            color: 'text.disabled',
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        Showing {filteredPhones.length} of {phones.length} phones
      </Typography>

      <PhoneDetailsDialog
        open={viewDialogOpen}
        phone={selectedPhone}
        onClose={() => {
          setViewDialogOpen(false);
          setSelectedPhone(null);
        }}
      />

      <EditPhoneDialog
        open={editDialogOpen}
        phone={selectedPhone}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedPhone(null);
        }}
        onSave={() => {
          setEditDialogOpen(false);
          setSelectedPhone(null);
          loadPhones();
        }}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this phone? This action cannot be undone.
          </Typography>
          {phoneToDelete && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">IMEI: {phoneToDelete.imei1}</Typography>
              <Typography variant="body2">Model: {phoneToDelete.model_name || 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default InventoryView;

