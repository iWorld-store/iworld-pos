import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Undo as UndoIcon,
  Inventory as InventoryIcon,
  Assessment as ReportsIcon,
  Inventory2 as Inventory2Icon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../utils/validation';
import { api } from '../../services/api';
import { Phone } from '../../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalInventory: 0,
    inStockCount: 0,
    soldToday: 0,
    profitToday: 0,
    currentStockValue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const allPhones = await api.getAllPhones();
      const inStockPhones = allPhones.filter((p: Phone) => p.status === 'in_stock');
      
      const today = new Date().toISOString().split('T')[0];
      const soldTodayPhones = allPhones.filter(
        (p: Phone) => p.status === 'sold' && p.sale_date?.startsWith(today)
      );
      
      const profitToday = soldTodayPhones.reduce((sum: number, p: Phone) => {
        return sum + ((parseFloat(p.sale_price?.toString() || '0') || 0) - (parseFloat(p.purchase_price?.toString() || '0') || 0));
      }, 0);
      
      const currentStockValue = inStockPhones.reduce((sum: number, p: Phone) => {
        return sum + (parseFloat(p.purchase_price?.toString() || '0') || 0);
      }, 0);

      setStats({
        totalInventory: allPhones.length,
        inStockCount: inStockPhones.length,
        soldToday: soldTodayPhones.length,
        profitToday,
        currentStockValue,
      });
      setApiError(null);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      setApiError(error.message || 'Error connecting to server. Please ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Inventory',
      value: stats.totalInventory,
      color: '#2196f3',
      icon: <Inventory2Icon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    },
    {
      title: 'In Stock',
      value: stats.inStockCount,
      color: '#4caf50',
      icon: <CheckCircleIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    },
    {
      title: 'Sold Today',
      value: stats.soldToday,
      color: '#ff9800',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
    },
    {
      title: 'Profit Today',
      value: formatCurrency(stats.profitToday),
      color: '#4caf50',
      icon: <AttachMoneyIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    },
    {
      title: 'Current Stock Value',
      value: formatCurrency(stats.currentStockValue),
      color: '#2196f3',
      icon: <StoreIcon sx={{ fontSize: 32 }} />,
      gradient: 'linear-gradient(135deg, #2196f3 0%, #1976d2 100%)',
    },
  ];

  const quickActions = [
    { label: 'Add to Inventory', icon: <AddIcon />, path: '/add-inventory', color: '#2196f3' },
    { label: 'Sell Phone', icon: <ShoppingCartIcon />, path: '/sell-phone', color: '#4caf50' },
    { label: 'Return/Refund', icon: <UndoIcon />, path: '/return-refund', color: '#ff9800' },
    { label: 'View Inventory', icon: <InventoryIcon />, path: '/inventory', color: '#2196f3' },
    { label: 'Reports', icon: <ReportsIcon />, path: '/reports', color: '#9c27b0' },
  ];

  if (apiError) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Dashboard
        </Typography>
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            <strong>To run the application properly:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1. Make sure the server is running: <code style={{ backgroundColor: '#2d2d2d', padding: '2px 6px', borderRadius: '4px' }}>npm run dev</code><br />
            2. The server should be available at <code style={{ backgroundColor: '#2d2d2d', padding: '2px 6px', borderRadius: '4px' }}>http://localhost:3001</code>
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          Dashboard
        </Typography>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Box>
    );
  }

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
        Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 5 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${card.color}15 0%, ${card.color}05 100%)`,
                border: `1px solid ${card.color}30`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: `${card.color}60`,
                },
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 100,
                  height: 100,
                  background: card.gradient,
                  borderRadius: '50%',
                  opacity: 0.1,
                }}
              />
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: card.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 12px ${card.color}40`,
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <Typography 
                  color="text.secondary" 
                  gutterBottom 
                  variant="body2"
                  sx={{ 
                    fontWeight: 500,
                    mb: 1,
                    opacity: 0.8,
                  }}
                >
                  {card.title}
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    color: card.color, 
                    fontWeight: 700,
                    fontSize: { xs: '1.75rem', md: '2rem' },
                  }}
                >
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          mb: 3,
          fontWeight: 600,
        }}
      >
        Quick Actions
      </Typography>

      <Grid container spacing={2.5}>
        {quickActions.map((action, index) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Button
              fullWidth
              variant="contained"
              startIcon={action.icon}
              onClick={() => navigate(action.path)}
              sx={{
                py: 3.5,
                px: 3,
                background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                borderRadius: 3,
                fontWeight: 600,
                fontSize: '0.95rem',
                boxShadow: `0 4px 12px ${action.color}40`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${action.color}dd 0%, ${action.color}bb 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${action.color}50`,
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {action.label}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;

