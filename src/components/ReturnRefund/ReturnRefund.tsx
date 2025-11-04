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
import { Phone, ReturnData } from '../../types';
import { validatePrice, formatCurrency, formatDate } from '../../utils/validation';
import { api } from '../../services/api';

interface FormData {
  imei: string;
  return_reason: string;
  refund_amount: string;
  notes: string;
}

const ReturnRefund: React.FC = () => {
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
      return_reason: '',
      refund_amount: '',
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
          message: 'Phone not found in database.',
          severity: 'error',
        });
        setPhone(null);
      } else if (foundPhone.status !== 'sold') {
        setSnackbar({
          open: true,
          message: 'This phone is currently in stock and hasn\'t been sold yet.',
          severity: 'error',
        });
        setPhone(foundPhone);
      } else {
        setPhone(foundPhone);
        // Pre-fill refund amount with sale price
        if (foundPhone.sale_price) {
          setValue('refund_amount', foundPhone.sale_price.toString());
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

    if (!data.return_reason || data.return_reason.trim() === '') {
      setSnackbar({
        open: true,
        message: 'Return reason is required',
        severity: 'error',
      });
      return;
    }

    const priceValidation = validatePrice(data.refund_amount);
    if (!priceValidation.valid) {
      setSnackbar({
        open: true,
        message: priceValidation.error || 'Invalid refund amount',
        severity: 'error',
      });
      return;
    }

    try {
      const returnData: ReturnData = {
        return_reason: data.return_reason.trim(),
        refund_amount: parseFloat(data.refund_amount),
        notes: data.notes.trim() || undefined,
      };

      const result = await api.processReturn(phone.id, returnData);

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Return processed successfully! Phone has been restocked.',
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
          message: result.error || 'Failed to process return',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while processing return',
        severity: 'error',
      });
    }
  };

  const profit = phone && phone.purchase_price && phone.sale_price
    ? parseFloat(phone.sale_price.toString()) - parseFloat(phone.purchase_price.toString())
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
        Return/Refund
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255, 152, 0, 0.02) 100%)',
              border: '1px solid rgba(255, 152, 0, 0.2)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, md: 4 } }}>
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  mb: 2,
                  fontWeight: 600,
                  color: 'warning.main',
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

              {phone && phone.status === 'sold' && (
                <>
                  <Paper 
                    sx={{ 
                      p: 3, 
                      mb: 3, 
                      background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.08) 0%, rgba(255, 152, 0, 0.03) 100%)',
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                      borderRadius: 3,
                    }}
                  >
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom 
                      sx={{ 
                        fontWeight: 600,
                        color: 'warning.main',
                        mb: 2,
                      }}
                    >
                      Sale Information
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
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Sale Date:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {phone.sale_date ? formatDate(phone.sale_date) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Sale Price:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2">
                          {phone.sale_price ? formatCurrency(parseFloat(phone.sale_price.toString())) : 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Profit:</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color={profit && profit > 0 ? 'success.main' : 'error.main'}>
                          {profit !== null ? formatCurrency(profit) : 'N/A'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="Return Reason *"
                          fullWidth
                          required
                          multiline
                          rows={4}
                          error={!!errors.return_reason}
                          helperText={errors.return_reason?.message}
                          {...register('return_reason', {
                            required: 'Return reason is required',
                          })}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          label="Refund Amount *"
                          type="number"
                          fullWidth
                          required
                          inputProps={{ step: '0.01', min: '0' }}
                          error={!!errors.refund_amount}
                          helperText={errors.refund_amount?.message || `Sale price: ${phone.sale_price ? formatCurrency(parseFloat(phone.sale_price.toString())) : 'N/A'}`}
                          {...register('refund_amount', {
                            required: 'Refund amount is required',
                            min: { value: 0.01, message: 'Amount must be greater than 0' },
                          })}
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
                        <Alert 
                          severity="info" 
                          sx={{ 
                            mb: 2,
                            borderRadius: 2,
                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                            border: '1px solid rgba(33, 150, 243, 0.2)',
                          }}
                        >
                          This phone will be automatically restocked to inventory after processing the return.
                        </Alert>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          sx={{
                            background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                            boxShadow: '0 4px 12px rgba(255, 152, 0, 0.4)',
                            py: 1.5,
                            fontWeight: 600,
                            '&:hover': {
                              background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                              boxShadow: '0 6px 16px rgba(255, 152, 0, 0.5)',
                            },
                          }}
                        >
                          Process Return
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </>
              )}

              {phone && phone.status !== 'sold' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  This phone is currently in stock and hasn't been sold yet. Returns can only be processed for sold phones.
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

export default ReturnRefund;

