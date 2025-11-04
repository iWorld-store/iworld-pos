import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { validateIMEI, validatePrice } from '../../utils/validation';
import { api } from '../../services/api';

interface FormData {
  imei1: string;
  imei2: string;
  model_name: string;
  storage: string;
  color: string;
  condition: string;
  purchase_price: string;
  unlock_status: string;
  vendor: string;
  notes: string;
}

const AddInventory: React.FC = () => {
  const [imei1Input, setImei1Input] = useState<HTMLInputElement | null>(null);
  const [imei2Input, setImei2Input] = useState<HTMLInputElement | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      imei1: '',
      imei2: '',
      model_name: '',
      storage: '',
      color: '',
      condition: 'Used',
      purchase_price: '',
      unlock_status: '',
      vendor: '',
      notes: '',
    },
  });

  useEffect(() => {
    // Auto-focus on IMEI 1 field
    if (imei1Input) {
      imei1Input.focus();
    }
  }, [imei1Input]);

  const onSubmit = async (data: FormData) => {
    // Validate IMEI1
    const imei1Validation = validateIMEI(data.imei1);
    if (!imei1Validation.valid) {
      setSnackbar({
        open: true,
        message: imei1Validation.error || 'Invalid IMEI 1',
        severity: 'error',
      });
      return;
    }

    // Validate IMEI2 if provided
    if (data.imei2 && data.imei2.trim() !== '') {
      const imei2Validation = validateIMEI(data.imei2);
      if (!imei2Validation.valid) {
        setSnackbar({
          open: true,
          message: imei2Validation.error || 'Invalid IMEI 2',
          severity: 'error',
        });
        return;
      }
    }

    // Validate purchase price
    const priceValidation = validatePrice(data.purchase_price);
    if (!priceValidation.valid) {
      setSnackbar({
        open: true,
        message: priceValidation.error || 'Invalid purchase price',
        severity: 'error',
      });
      return;
    }

    try {
      const result: { success: boolean; id?: number; error?: string } = await api.addPhone({
        imei1: data.imei1.trim(),
        imei2: data.imei2.trim() || undefined,
        model_name: data.model_name.trim() || undefined,
        storage: data.storage.trim() || undefined,
        color: data.color.trim() || undefined,
        condition: data.condition || undefined,
        unlock_status: data.unlock_status.trim() || undefined,
        purchase_date: new Date().toISOString(),
        purchase_price: parseFloat(data.purchase_price),
        vendor: data.vendor.trim() || undefined,
        notes: data.notes.trim() || undefined,
      });

      if (result.success) {
        setSnackbar({
          open: true,
          message: 'Phone added to inventory successfully!',
          severity: 'success',
        });
        reset();
        // Refocus on IMEI1 field
        if (imei1Input) {
          imei1Input.focus();
        }
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to add phone',
          severity: 'error',
        });
      }
    } catch (error: any) {
      // Extract error message from API response
      const errorMessage = error?.message || 'An error occurred while adding phone';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleSubmit(onSubmit)();
    }
  };

  // Handle scanner input - auto-move to IMEI2 after IMEI1 scan
  const handleImei1KeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValue = (event.target as HTMLInputElement).value.trim();
      
      // If IMEI1 looks complete (14-16 digits), validate and move to IMEI2
      if (currentValue.length >= 14 && currentValue.length <= 16 && /^\d+$/.test(currentValue)) {
        // Validate IMEI1
        const validation = validateIMEI(currentValue);
        if (validation.valid) {
          // Move focus to IMEI2 field
          setTimeout(() => {
            if (imei2Input) {
              imei2Input.focus();
            }
          }, 50);
        } else {
          // Show validation error
          setSnackbar({
            open: true,
            message: validation.error || 'Invalid IMEI 1',
            severity: 'error',
          });
        }
      }
    }
  };

  // Handle all input changes to detect scanner input
  const handleImei1Change = () => {
    // Input change handler (can be used for future enhancements)
  };

  // Handle scanner input on IMEI2 - just validate, don't auto-submit (user needs to fill other fields)
  const handleImei2KeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const currentValue = (event.target as HTMLInputElement).value.trim();
      
      // If IMEI2 is provided and looks complete, validate it
      if (currentValue.length >= 14 && currentValue.length <= 16 && /^\d+$/.test(currentValue)) {
        const validation = validateIMEI(currentValue);
        if (!validation.valid) {
          setSnackbar({
            open: true,
            message: validation.error || 'Invalid IMEI 2',
            severity: 'error',
          });
        }
      }
      // Move focus to next field (Model Name) - find by label or use tab
      const form = (event.target as HTMLInputElement).closest('form');
      if (form) {
        const inputs = Array.from(form.querySelectorAll('input[type="text"], input:not([type])'));
        const currentIndex = inputs.indexOf(event.target as HTMLInputElement);
        if (currentIndex < inputs.length - 1) {
          const nextInput = inputs[currentIndex + 1] as HTMLInputElement;
          setTimeout(() => nextInput?.focus(), 50);
        }
      }
    }
  };

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
        Add to Inventory
      </Typography>

      <Card
        sx={{
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(33, 150, 243, 0.02) 100%)',
          border: '1px solid rgba(33, 150, 243, 0.2)',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <form onSubmit={handleSubmit(onSubmit)} onKeyDown={handleKeyPress}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                IMEI Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Scan or enter IMEI numbers. The form will automatically move to the next field after scanning.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  inputRef={(e) => {
                    register('imei1').ref(e);
                    setImei1Input(e);
                  }}
                  label="IMEI 1 *"
                  fullWidth
                  required
                  error={!!errors.imei1}
                  helperText={errors.imei1?.message || 'Scan or enter IMEI 1 (14-16 digits) - Press Enter after scan to move to IMEI 2'}
                  {...register('imei1', {
                    required: 'IMEI 1 is required',
                  })}
                  onKeyDown={handleImei1KeyDown}
                  onChange={handleImei1Change}
                  autoFocus
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  inputRef={(e) => {
                    register('imei2').ref(e);
                    setImei2Input(e);
                  }}
                  label="IMEI 2 (Optional)"
                  fullWidth
                  helperText="Optional - for dual IMEI phones. Press Enter after scan to move to next field"
                  {...register('imei2')}
                  onKeyDown={handleImei2KeyDown}
                />
              </Grid>

            </Grid>

            <Box sx={{ mt: 4, mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, color: 'primary.main' }}>
                Phone Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Enter the phone specifications and purchase information.
              </Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  label="Model Name"
                  fullWidth
                  {...register('model_name')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Storage"
                  fullWidth
                  placeholder="e.g., 64GB, 128GB, 256GB"
                  {...register('storage')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Color"
                  fullWidth
                  {...register('color')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Controller
                  name="condition"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label="Condition"
                      fullWidth
                    >
                      <MenuItem value="New">New</MenuItem>
                      <MenuItem value="Used">Used</MenuItem>
                      <MenuItem value="Refurbished">Refurbished</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Purchase Price *"
                  type="number"
                  fullWidth
                  required
                  inputProps={{ step: '0.01', min: '0' }}
                  error={!!errors.purchase_price}
                  helperText={errors.purchase_price?.message}
                  {...register('purchase_price', {
                    required: 'Purchase price is required',
                    min: { value: 0.01, message: 'Price must be greater than 0' },
                  })}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Unlock Status"
                  fullWidth
                  placeholder="e.g., Locked, Unlocked, AT&T Locked"
                  {...register('unlock_status')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Vendor (Optional)"
                  fullWidth
                  {...register('vendor')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes (Optional)"
                  fullWidth
                  multiline
                  rows={4}
                  {...register('notes')}
                />
              </Grid>

              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'flex-end',
                    mt: 2,
                    pt: 3,
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => reset()}
                    sx={{
                      minWidth: 120,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                      '&:hover': {
                        borderColor: 'rgba(255, 255, 255, 0.5)',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      minWidth: 160,
                      background: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.5)',
                      },
                    }}
                  >
                    Save (Ctrl+Enter)
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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

export default AddInventory;

