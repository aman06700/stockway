import { Box, Container, Typography, Grid, List, ListItem, ListItemText, useTheme, useMediaQuery, Drawer, Fab } from '@mui/material';
import PublicNavbar from '@/components/common/PublicNavbar';
import Footer from '@/components/common/Footer';
import { useState } from 'react';
import { DOCS_SECTIONS, DocSection } from './DocsContent';

// Icons could be imported from mui icons, but using text/css for now to avoid dependency friction
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function DocsPage() {
  const [activeSectionId, setActiveSectionId] = useState(DOCS_SECTIONS[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const activeSection = DOCS_SECTIONS.find(s => s.id === activeSectionId) || DOCS_SECTIONS[0];

  const handleSectionClick = (id: string) => {
    setActiveSectionId(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NavigationList = () => (
    <List component="nav">
      {DOCS_SECTIONS.map((section: DocSection) => (
        <ListItem
          button
          key={section.id}
          selected={activeSectionId === section.id}
          onClick={() => handleSectionClick(section.id)}
          sx={{
            borderRadius: 2,
            mb: 0.5,
            borderLeft: activeSectionId === section.id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
            bgcolor: activeSectionId === section.id ? 'action.selected' : 'transparent',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <ListItemText
            primary={section.title}
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: activeSectionId === section.id ? 600 : 400,
              color: activeSectionId === section.id ? 'primary.main' : 'text.primary'
            }}
          />
        </ListItem>
      ))}
    </List>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default', color: 'text.primary' }}>
      <PublicNavbar />

      {/* Mobile Nav Toggle */}
      {isMobile && (
        <Fab
          color="primary"
          size="medium"
          aria-label="menu"
          onClick={() => setMobileOpen(true)}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2000 }}
        >
          <MenuIcon />
        </Fab>
      )}

      {/* Introduction Header */}
      <Box sx={{ bgcolor: 'background.paper', py: 6, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight={800} gutterBottom>Documentation</Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Everything you need to build, integrate, and deploy with Stockway.
          </Typography>
        </Container>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={6}>
            {/* Desktop Sidebar */}
            <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'sticky', top: 100 }}>
                <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ px: 2, mb: 1, display: 'block' }}>
                  CONTENTS
                </Typography>
                <NavigationList />
              </Box>
            </Grid>

            {/* Main Content */}
            <Grid item xs={12} md={9}>
              <Box
                sx={{
                  minHeight: '600px',
                  '& h4': { mt: 0, mb: 3 },
                  '& h5': { mt: 4, mb: 2 },
                  '& h6': { mt: 3, mb: 1.5, fontWeight: 600 },
                  '& p': { mb: 2, lineHeight: 1.7, color: 'text.secondary' },
                  '& li': { mb: 1, color: 'text.secondary' },
                  '& code': { bgcolor: 'action.hover', px: 0.8, py: 0.4, borderRadius: 1, fontFamily: 'monospace', fontSize: '0.85em' }
                }}
              >
                {activeSection.content}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        PaperProps={{ sx: { width: 280, p: 2 } }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ px: 2, mb: 2, mt: 2 }}>
          Documentation
        </Typography>
        <NavigationList />
      </Drawer>
    </Box>
  );
}
