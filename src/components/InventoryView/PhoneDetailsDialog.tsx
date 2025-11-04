import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Divider,
} from '@mui/material';
import { Phone } from '../../types';
import { formatCurrency, formatDate } from '../../utils/validation';

interface PhoneDetailsDialogProps {
  open: boolean;
  phone: Phone | null;
  onClose: () => void;
}

const PhoneDetailsDialog: React.FC<PhoneDetailsDialogProps> = ({ open, phone, onClose }) => {
  if (!phone) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Phone Details</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              IMEI Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">IMEI 1:</Typography>
                <Typography variant="body1">{phone.imei1}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">IMEI 2:</Typography>
                <Typography variant="body1">{phone.imei2 || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Product Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Model Name:</Typography>
                <Typography variant="body1">{phone.model_name || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Storage:</Typography>
                <Typography variant="body1">{phone.storage || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Color:</Typography>
                <Typography variant="body1">{phone.color || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Condition:</Typography>
                <Typography variant="body1">{phone.condition || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Unlock Status:</Typography>
                <Typography variant="body1">{phone.unlock_status || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Status:</Typography>
                <Typography variant="body1">{phone.status.replace('_', ' ').toUpperCase()}</Typography>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Purchase Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Purchase Date:</Typography>
                <Typography variant="body1">
                  {phone.purchase_date ? formatDate(phone.purchase_date) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Purchase Price:</Typography>
                <Typography variant="body1">
                  {phone.purchase_price ? formatCurrency(parseFloat(phone.purchase_price.toString())) : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6} md={4}>
                <Typography variant="body2" color="textSecondary">Vendor:</Typography>
                <Typography variant="body1">{phone.vendor || 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Grid>

          {phone.status === 'sold' && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Sale Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Sale Date:</Typography>
                  <Typography variant="body1">
                    {phone.sale_date ? formatDate(phone.sale_date) : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Sale Price:</Typography>
                  <Typography variant="body1">
                    {phone.sale_price ? formatCurrency(parseFloat(phone.sale_price.toString())) : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Profit:</Typography>
                  <Typography variant="body1" color="success.main">
                    {phone.purchase_price && phone.sale_price
                      ? formatCurrency(
                          parseFloat(phone.sale_price.toString()) -
                            parseFloat(phone.purchase_price.toString())
                        )
                      : 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Customer Name:</Typography>
                  <Typography variant="body1">{phone.customer_name || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="textSecondary">Payment Method:</Typography>
                  <Typography variant="body1">{phone.payment_method || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Grid>
          )}

          {phone.notes && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">{phone.notes}</Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhoneDetailsDialog;

