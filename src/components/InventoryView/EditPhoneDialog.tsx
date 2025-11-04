import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { Phone } from '../../types';
import { validatePrice } from '../../utils/validation';
import { api } from '../../services/api';

interface EditPhoneDialogProps {
  open: boolean;
  phone: Phone | null;
  onClose: () => void;
  onSave: () => void;
}

interface FormData {
  model_name: string;
  storage: string;
  color: string;
  condition: string;
  purchase_price: string;
  unlock_status: string;
  vendor: string;
  notes: string;
}

const EditPhoneDialog: React.FC<EditPhoneDialogProps> = ({ open, phone, onClose, onSave }) => {
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
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

  React.useEffect(() => {
    if (phone) {
      reset({
        model_name: phone.model_name || '',
        storage: phone.storage || '',
        color: phone.color || '',
        condition: phone.condition || 'Used',
        purchase_price: phone.purchase_price?.toString() || '',
        unlock_status: phone.unlock_status || '',
        vendor: phone.vendor || '',
        notes: phone.notes || '',
      });
    }
  }, [phone, reset]);

  const onSubmit = async (data: FormData) => {
    if (!phone) return;

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
      const result = await api.updatePhone(phone.id, {
        model_name: data.model_name.trim() || undefined,
        storage: data.storage.trim() || undefined,
        color: data.color.trim() || undefined,
        condition: data.condition || undefined,
        purchase_price: parseFloat(data.purchase_price),
        unlock_status: data.unlock_status.trim() || undefined,
        vendor: data.vendor.trim() || undefined,
        notes: data.notes.trim() || undefined,
      });

      const updateResult = result as { success: boolean; error?: string };
      if (updateResult.success) {
        setSnackbar({
          open: true,
          message: 'Phone updated successfully!',
          severity: 'success',
        });
        setTimeout(() => {
          onSave();
        }, 500);
      } else {
        setSnackbar({
          open: true,
          message: updateResult.error || 'Failed to update phone',
          severity: 'error',
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'An error occurred while updating phone',
        severity: 'error',
      });
    }
  };

  if (!phone) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Phone - {phone.imei1}</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Note: Sale price and sale date cannot be edited for sold phones.
          </Alert>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={2}>
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
                  label="Purchase Price"
                  type="number"
                  fullWidth
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
                  {...register('unlock_status')}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  label="Vendor"
                  fullWidth
                  {...register('vendor')}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  fullWidth
                  multiline
                  rows={4}
                  {...register('notes')}
                />
              </Grid>
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit(onSubmit)} variant="contained">
            Save
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
    </>
  );
};

export default EditPhoneDialog;

