import { Box, Container, Typography, Grid, Paper, Divider, List, ListItem, ListItemText, Link } from '@mui/material';
import PublicNavbar from '@/components/common/PublicNavbar';
import Footer from '@/components/common/Footer';
import { useState } from 'react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('intro');

  const sections = [
    { id: 'intro', label: 'Introduction' },
    { id: 'auth', label: 'Authentication' },
    { id: 'roles', label: 'User Roles' },
    { id: 'orders', label: 'Orders & Fulfillment' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'auth':
        return (
          <>
            <Typography variant="h4" fontWeight={600} gutterBottom>Authentication</Typography>
            <Typography paragraph>
              Stockway uses a secure OTP-based authentication system. All API requests must include the `Authorization` header.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
              <code>Authorization: Token &lt;your_token&gt;</code>
            </Paper>
            <Typography variant="h6" gutterBottom>Endpoints</Typography>
            <List>
              <ListItem>
                <ListItemText primary="POST /api/auth/request-otp/" secondary="Request an OTP for your mobile number." />
              </ListItem>
              <ListItem>
                <ListItemText primary="POST /api/auth/verify-otp/" secondary="Verify OTP and receive an auth token." />
              </ListItem>
            </List>
          </>
        );
      case 'roles':
        return (
          <>
            <Typography variant="h4" fontWeight={600} gutterBottom>User Roles</Typography>
            <Typography paragraph>
              The platform distinguishes between four primary roles, each with specific permissions.
            </Typography>
            <Typography variant="h6" gutterBottom>Shopkeeper</Typography>
            <Typography paragraph color="text.secondary">
              Can browse inventory, place orders, and track deliveries.
            </Typography>
            <Typography variant="h6" gutterBottom>Warehouse Manager</Typography>
            <Typography paragraph color="text.secondary">
              Manages inventory, approves orders, and assigns riders.
            </Typography>
            <Typography variant="h6" gutterBottom>Rider</Typography>
            <Typography paragraph color="text.secondary">
              Receives delivery assignments and updates delivery status.
            </Typography>
          </>
        );
      case 'orders':
        return (
          <>
            <Typography variant="h4" fontWeight={600} gutterBottom>Orders & Fulfillment</Typography>
            <Typography paragraph>
              The order lifecycle drives the core logistics flow.
            </Typography>
            <Typography variant="h6" gutterBottom>Lifecycle Statuses</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default', mb: 3 }}>
              <List dense>
                <ListItem><ListItemText primary="PENDING" secondary="Order placed by shopkeeper." /></ListItem>
                <ListItem><ListItemText primary="ACCEPTED" secondary="Warehouse has validated stock." /></ListItem>
                <ListItem><ListItemText primary="ASSIGNED" secondary="Rider has been assigned." /></ListItem>
                <ListItem><ListItemText primary="PICKED_UP" secondary="Rider has collected the package." /></ListItem>
                <ListItem><ListItemText primary="DELIVERED" secondary="Order successfully delivered." /></ListItem>
              </List>
            </Paper>
          </>
        )
      default:
        return (
          <>
            <Typography variant="h4" fontWeight={600} gutterBottom>Introduction</Typography>
            <Typography paragraph>
              Welcome to the Stockway API documentation. Stockway is a unified platform for rural logistics, connecting shopkeepers to warehouses and riders.
            </Typography>
            <Typography paragraph>
              This platform allows for seamless inventory management, order processing, and last-mile delivery tracking.
            </Typography>
            <Typography variant="h6" gutterBottom>Getting Started</Typography>
            <Typography paragraph>
              To get started, create an account via the signup page. Once authenticated, you can explore the API endpoints specific to your role.
            </Typography>
          </>
        );
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
      <PublicNavbar />
      <Box sx={{ flex: 1, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={8}>
            {/* Sidebar */}
            <Grid item xs={12} md={3}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ mb: 2, display: 'block' }}>
                  Documentation
                </Typography>
                <List component="nav">
                  {sections.map((section) => (
                    <ListItem
                      button
                      key={section.id}
                      selected={activeSection === section.id}
                      onClick={() => setActiveSection(section.id)}
                      sx={{
                        borderRadius: 2,
                        mb: 0.5,
                        '&.Mui-selected': { bgcolor: 'action.selected' }
                      }}
                    >
                      <ListItemText primary={section.label} primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: activeSection === section.id ? 600 : 400 }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Grid>

            {/* Content */}
            <Grid item xs={12} md={9}>
              <Box sx={{ maxWidth: '800px', minHeight: '600px' }}>
                {renderContent()}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}
