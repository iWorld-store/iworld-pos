import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Add as AddIcon,
  ShoppingCart as ShoppingCartIcon,
  Undo as UndoIcon,
  Inventory as InventoryIcon,
  Assessment as ReportsIcon,
} from '@mui/icons-material';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Keyboard shortcuts
      if (event.key === 'F1') {
        event.preventDefault();
        navigate('/add-inventory');
      } else if (event.key === 'F2') {
        event.preventDefault();
        navigate('/sell-phone');
      } else if (event.key === 'F3') {
        event.preventDefault();
        navigate('/return-refund');
      } else if (event.key === 'F4') {
        event.preventDefault();
        navigate('/inventory');
      } else if (event.key === 'F5') {
        event.preventDefault();
        navigate('/reports');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [navigate]);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <DashboardIcon />, key: null },
    { path: '/add-inventory', label: 'Add Inventory', icon: <AddIcon />, key: 'F1' },
    { path: '/sell-phone', label: 'Sell Phone', icon: <ShoppingCartIcon />, key: 'F2' },
    { path: '/return-refund', label: 'Return/Refund', icon: <UndoIcon />, key: 'F3' },
    { path: '/inventory', label: 'Inventory', icon: <InventoryIcon />, key: 'F4' },
    { path: '/reports', label: 'Reports', icon: <ReportsIcon />, key: 'F5' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: 'background.paper',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.03))',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0, 
              mr: { xs: 2, md: 4 },
              fontWeight: 700,
              background: 'linear-gradient(135deg, #2196f3 0%, #64b5f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            iWorld Store POS
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  variant={isActive ? 'contained' : 'text'}
                  sx={{
                    position: 'relative',
                    backgroundColor: isActive 
                      ? 'primary.main' 
                      : 'transparent',
                    color: isActive ? 'white' : 'text.primary',
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    minWidth: { xs: 'auto', md: 140 },
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      backgroundColor: isActive 
                        ? 'primary.dark' 
                        : 'rgba(255, 255, 255, 0.08)',
                      transform: 'translateY(-1px)',
                    },
                    '&::after': isActive ? {
                      content: '""',
                      position: 'absolute',
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 3,
                      background: 'linear-gradient(90deg, transparent, primary.light, transparent)',
                    } : {},
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box component="span" sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                      {item.label}
                    </Box>
                    {item.key && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          ml: 0.5, 
                          opacity: isActive ? 0.9 : 0.6,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                        }}
                      >
                        {item.key}
                      </Typography>
                    )}
                  </Box>
                </Button>
              );
            })}
          </Box>
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} sx={{ flexGrow: 1, overflow: 'auto', py: 4, px: { xs: 2, md: 4 } }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;

