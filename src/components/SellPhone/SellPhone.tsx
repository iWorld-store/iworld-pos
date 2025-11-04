import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Phone, SaleData } from '../../types';
import { validatePrice, formatCurrency, formatDate } from '../../utils/validation';
import { api } from '../../services/api';

interface FormData {
  imei: string;
  sale_price: string;
  customer_name: string;
  payment_method: string;
  notes: string;
}

const SellPhone: React.FC = () => {
  const [imeiInput, setImeiInput] = useState<HTMLInputElement | null>(null);
  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      imei: '',
      sale_price: '',
      customer_name: '',
      payment_method: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (imeiInput) {
      imeiInput.focus();
    }
  }, [imeiInput]);

  // Handle scanner input - auto-search on Enter key
  const handleImeiKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValue = (event.target as HTMLInputElement).value.trim();
      
      // If IMEI looks complete (14-16 digits), auto-search
      if (currentValue.length >= 14 && currentValue.length <= 16 && /^\d+$/.test(currentValue)) {
        handleImeiSearch();
      }
    }
  };

  const handleImeiSearch = async () => {
    const imei = watch('imei');
    if (!imei || imei.trim() === '') {
      return;
    }

    setLoading(true);
    try {
      const foundPhone = await api.getPhoneByImei(imei.trim());
      
      if (!foundPhone) {
        setSnackbar({
          open: true,
          message: 'Phone not found in inventory. Please add to inventory first.',
          severity: 'error',
        });
        setPhone(null);
      } else if (foundPhone.status === 'sold') {
        setSnackbar({
          open: true,
          message: `This phone was already sold on ${foundPhone.sale_date ? formatDate(foundPhone.sale_date) : 'unknown date'}`,
          severity: 'error',
        });
        setPhone(foundPhone);
      } else {
        setPhone(foundPhone);
        // Pre-fill sale price if available
        if (foundPhone.purchase_price) {
          // Suggest a sale price slightly higher than purchase price
          const suggestedPrice = (parseFloat(foundPhone.purchase_price.toString()) * 1.2).toFixed(2);
          setValue('sale_price', suggestedPrice);
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Error searching for phone',
        severity: 'error',
      });
      setPhone(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!phone) {
      setSnackbar({
        open: true,
        message: 'Please search for a phone first',
        severity: 'error',
      });
      return;
    }

    const priceValidation = validatePrice(data.sale_price);
    if (!priceValidation.valid) {
      setSnackbar({
        open: true,
        message: priceValidation.error || 'Invalid sale price',
        severity: 'error',
      });
      return;
    }

    try {
      const saleData: SaleData = {
        sale_price: parseFloat(data.sale_price),
        customer_name: data.customer_name.trim() || undefined,
        payment_method: data.payment_method.trim() || undefined,
        notes: data.notes.trim() || undefined,
      };

      const result = await api.sellPhone(phone.id, saleData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Phone sold successfully!',
          severity: 'success',
        });
        reset();
        setPhone(null);
        if (imeiInput) {
          imeiInput.focus();
        }
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to sell phone',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while selling phone',
        severity: 'error',
      });
    }
  };

  const profit = phone && phone.purchase_price && watch('sale_price')
    ? parseFloat(watch('sale_price')) - parseFloat(phone.purchase_price.toString())
    : null;

  return (
    <Box>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          mb: 4,
          fontWeight: 700,
          background: 'linear-gradient(135deg, #ffffff 0%, #b0b0b0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Sell Phone
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.02) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  color: 'success.main',
                }}
              >
                Scan IMEI
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  inputRef={(e) => {
                    register('imei').ref(e);
                    setImeiInput(e);
                  }}
                  label="IMEI"
                  fullWidth
                  {...register('imei')}
                  onBlur={handleImeiSearch}
                  onKeyDown={handleImeiKeyDown}
                  helperText="Scan or enter IMEI - Press Enter after scan to auto-search"
                  autoFocus
                />
                <Button
                  variant="contained"
                  onClick={handleImeiSearch}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>

              {phone && phone.status === 'in_stock' && (
                <>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.03) 100%)',
                      border: '1px solid rgba(33, 150, 243, 0.2)',
                      borderRadius: 3,
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: 'primary.main',
                        mb: 2,
                      }}
                    >
                      Phone Details
                    </Typography>
                    <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Model:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{phone.model_name || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Storage:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{phone.storage || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Color:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{phone.color || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Condition:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{phone.condition || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Unlock Status:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">{phone.unlock_status || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Purchase Date:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {phone.purchase_date ? formatDate(phone.purchase_date) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Purchase Price:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {phone.purchase_price ? formatCurrency(parseFloat(phone.purchase_price.toString())) : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Sale Price *"
                          type="number"
                          fullWidth
                          required
                          inputProps={{ step: '0.01', min: '0' }}
                          error={!!errors.sale_price}
                          helperText={errors.sale_price?.message || (profit !== null ? `Estimated Profit: ${formatCurrency(profit)}` : '')}
                          {...register('sale_price', {
                            required: 'Sale price is required',
                            min: { value: 0.01, message: 'Price must be greater than 0' },
                          })}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Customer Name (Optional)"
                          fullWidth
                          {...register('customer_name')}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <TextField
                          label="Payment Method (Optional)"
                          fullWidth
                          placeholder="e.g., Cash, Credit Card, PayPal"
                          {...register('payment_method')}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Notes (Optional)"
                          fullWidth
                          multiline
                          rows={3}
                          {...register('notes')}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          sx={{
                            background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
                            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                            py: 1.5,
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #388e3c 0%, #2e7d32 100%)',
                              boxShadow: '0 6px 16px rgba(76, 175, 80, 0.5)',
                            },
                          }}
                        >
                          Confirm Sale
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </>
              )}

              {phone && phone.status === 'sold' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    This phone was already sold
                  </Typography>
                  {phone.sale_date && (
                    <Typography variant="body2">
                      Sale Date: {formatDate(phone.sale_date)}
                    </Typography>
                  )}
                  {phone.sale_price && (
                    <Typography variant="body2">
                      Sale Price: {formatCurrency(parseFloat(phone.sale_price.toString()))}
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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

export default SellPhone;

