import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import {
  Store,
  Warehouse,
  DeliveryDining,
  TrendingUp,
  Speed,
  Security,
  ArrowForward,
  CheckCircleOutline,
  Inventory2,
  LocalShipping,
  ShoppingCart
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import PublicNavbar from '@/components/common/PublicNavbar';
import Footer from '@/components/common/Footer';
import FadeIn from '@/components/common/FadeIn';
import MagneticButton from '@/components/common/MagneticButton';
import TiltCard from '@/components/common/TiltCard';
import StaggerReveal from '@/components/common/StaggerReveal';
import AnimatedText from '@/components/common/AnimatedText';
import FloatingParticles from '@/components/common/FloatingParticles';
import ScrollProgress from '@/components/common/ScrollProgress';

export default function LandingPage() {
  const ecosystem = [
    {
      icon: <Store sx={{ fontSize: 32 }} />,
      title: 'For Shopkeepers',
      description: 'Order inventory from nearby warehouses and track deliveries in real-time.',
    },
    {
      icon: <Warehouse sx={{ fontSize: 32 }} />,
      title: 'For Warehouses',
      description: 'Manage stock levels, process incoming orders, and assign riders efficiently.',
    },
    {
      icon: <DeliveryDining sx={{ fontSize: 32 }} />,
      title: 'For Riders',
      description: 'Receive delivery tasks, navigate to locations, and track earnings.',
    },
  ];

  const workflow = [
    {
      step: '01',
      title: 'Order',
      desc: 'Shopkeeper browses catalog and places order.',
      icon: <ShoppingCart color="primary" />,
    },
    {
      step: '02',
      title: 'Process',
      desc: 'Warehouse accepts order and assigns a rider.',
      icon: <Inventory2 color="warning" />,
    },
    {
      step: '03',
      title: 'Deliver',
      desc: 'Rider picks up package and delivers to shop.',
      icon: <LocalShipping color="success" />,
    },
  ];

  const capabilities = [
    {
      icon: <TrendingUp />,
      title: 'Analytics',
      description: 'Data-driven insights for better decision making.',
    },
    {
      icon: <Speed />,
      title: 'Speed',
      description: 'Optimized routing for faster delivery times.',
    },
    {
      icon: <Security />,
      title: 'Security',
      description: 'End-to-end encryption for all transaction data.',
    },
    {
      icon: <CheckCircleOutline />,
      title: 'Reliability',
      description: '99.9% uptime guarantee for business continuity.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', display: 'flex', flexDirection: 'column' }}>
      <ScrollProgress />
      <PublicNavbar />

      {/* Hero Section - Full Viewport Height */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.default',
          py: { xs: 8, md: 0 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <FloatingParticles count={40} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={{ xs: 8, md: 8 }} alignItems="center">
            {/* Left Column: Narrative */}
            <Grid item xs={12} md={6}>
              <Box maxWidth="600px">
                <FadeIn delay={0}>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 600,
                      color: 'primary.main',
                      letterSpacing: '0.1em',
                      mb: 2,
                      display: 'block'
                    }}
                  >
                    MODULAR LOGISTICS PLATFORM
                  </Typography>
                </FadeIn>

                <Box sx={{ mb: 3 }}>
                  <AnimatedText
                    variant="h1"
                    animation="words"
                    stagger={80}
                    delay={200}
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4.5rem' },
                      fontWeight: 700,
                      letterSpacing: '-0.03em',
                      lineHeight: 1.1,
                      color: 'text.primary',
                      display: 'block',
                    }}
                  >
                    The operating system for rural commerce.
                  </AnimatedText>
                </Box>

                <FadeIn delay={600}>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 5, fontSize: '1.25rem', lineHeight: 1.6, maxWidth: '520px' }}
                  >
                    Stockway is the infrastructure connecting shopkeepers, warehouses, and logistics fleets in{' '}
                    <Box component="span" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      one seamless network
                    </Box>.
                  </Typography>
                </FadeIn>

                <FadeIn delay={800}>
                  <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                    <MagneticButton strength={0.2}>
                      <Button
                        component={RouterLink}
                        to="/signup"
                        variant="contained"
                        size="large"
                        endIcon={<ArrowForward />}
                        sx={{
                          px: 4,
                          py: 1.5,
                          borderRadius: 2,
                          fontSize: '1rem',
                          textTransform: 'none',
                          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)',
                          '&:hover': {
                            boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                            transform: 'translateY(-2px)',
                          },
                          transition: 'all 0.3s cubic-bezier(0.33, 1, 0.68, 1)',
                        }}
                      >
                        Start Free Trial
                      </Button>
                    </MagneticButton>
                    <MagneticButton strength={0.15}>
                      <Button
                        component={RouterLink}
                        to="/docs"
                        variant="text"
                        size="large"
                        sx={{
                          px: 3,
                          py: 1.5,
                          fontSize: '1rem',
                          textTransform: 'none',
                          color: 'text.primary',
                          position: 'relative',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: 8,
                            left: 12,
                            right: 12,
                            height: 2,
                            bgcolor: 'primary.main',
                            transform: 'scaleX(0)',
                            transformOrigin: 'right',
                            transition: 'transform 0.3s cubic-bezier(0.33, 1, 0.68, 1)',
                          },
                          '&:hover::after': {
                            transform: 'scaleX(1)',
                            transformOrigin: 'left',
                          },
                        }}
                      >
                        View Documentation
                      </Button>
                    </MagneticButton>
                  </Box>
                </FadeIn>
              </Box>
            </Grid>

            {/* Right Column: System Schematic with floating animation */}
            <Grid item xs={12} md={6}>
              <FadeIn delay={400} direction="left" distance={40}>
                <Box
                  sx={{
                    position: 'relative',
                    p: 4,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    maxWidth: '500px',
                    mx: 'auto',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0)' },
                      '50%': { transform: 'translateY(-10px)' },
                    },
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                      System Architecture
                    </Typography>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
                        animation: 'pulse 2s ease-in-out infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                          '50%': { opacity: 0.7, transform: 'scale(1.2)' },
                        },
                      }}
                    />
                  </Box>

                  {/* Architecture Nodes with stagger */}
                  <StaggerReveal stagger={150} baseDelay={600}>
                    {[
                      { label: 'Shopkeeper App', sub: 'Order Placement', icon: <Store fontSize="small" /> },
                      { label: 'Warehouse RMS', sub: 'Inventory Sync', icon: <Warehouse fontSize="small" /> },
                      { label: 'Rider Client', sub: 'Route Optimization', icon: <DeliveryDining fontSize="small" /> }
                    ].map((node, i) => (
                      <Box key={i} sx={{ position: 'relative' }}>
                        {i !== 2 && (
                          <Box sx={{
                            position: 'absolute',
                            left: 24,
                            top: 48,
                            bottom: -24,
                            width: 2,
                            bgcolor: 'divider',
                            zIndex: 0
                          }} />
                        )}
                        <Box display="flex" alignItems="center" gap={2} sx={{ position: 'relative', zIndex: 1, bgcolor: 'background.paper', py: 1 }}>
                          <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            border: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'background.default',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'action.hover',
                            },
                          }}>
                            {node.icon}
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={600}>{node.label}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{node.sub}</Typography>
                          </Box>
                          <Box sx={{ ml: 'auto' }}>
                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'divider' }} />
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </StaggerReveal>
                </Box>
              </FadeIn>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Section 2: Ecosystem (Who it's for) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ py: 12 }}>
          <FadeIn>
            <Box mb={8} textAlign="center">
              <Typography variant="h3" fontWeight={700} letterSpacing="-0.02em" mb={2}>
                Built for the{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  entire chain
                </Box>
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth="600px" mx="auto">
                Every stakeholder gets a dedicated interface tailored to their specific workflow needs.
              </Typography>
            </Box>
          </FadeIn>
          <Grid container spacing={4}>
            {ecosystem.map((role, index) => (
              <Grid item xs={12} md={4} key={index}>
                <FadeIn delay={index * 100}>
                  <TiltCard maxTilt={6} scale={1.02}>
                    <Card
                      sx={{
                        height: '100%',
                        bgcolor: 'background.default',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                      variant="outlined"
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{
                          width: 56,
                          height: 56,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          border: 1,
                          borderColor: 'divider',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 3,
                          color: 'text.primary',
                          transition: 'all 0.3s ease',
                        }}>
                          {role.icon}
                        </Box>
                        <Typography variant="h5" gutterBottom fontWeight={600}>
                          {role.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {role.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </TiltCard>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Section 3: Workflow (How it works) */}
      <Container maxWidth="lg" sx={{ py: 16 }}>
        <FadeIn>
          <Box mb={10} textAlign={{ xs: 'left', md: 'center' }}>
            <Typography variant="h3" fontWeight={700} letterSpacing="-0.02em" mb={2}>
              How Stockway Works
            </Typography>
          </Box>
        </FadeIn>

        <FadeIn delay={100}>
          <Grid container spacing={0} sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: { xs: 4, md: 4 },
            overflow: 'hidden'
          }}>
            {workflow.map((step, index) => (
              <Grid item xs={12} md={4} key={index} sx={{
                borderBottom: { xs: 1, md: 0 },
                borderRight: { xs: 0, md: 1 },
                borderColor: 'divider',
                '&:last-child': { borderRight: 0, borderBottom: 0 }
              }}>
                <Box
                  sx={{
                    p: 6,
                    height: '100%',
                    bgcolor: 'background.paper',
                    transition: 'all 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: 'background.default',
                      '& .step-number': {
                        opacity: 0.2,
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  <Box display="flex" justifyContent="space-between" mb={4}>
                    <Typography
                      className="step-number"
                      variant="h2"
                      fontWeight={800}
                      sx={{
                        opacity: 0.08,
                        transition: 'all 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
                        color: 'primary.main',
                      }}
                    >
                      {step.step}
                    </Typography>
                    {step.icon}
                  </Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>{step.title}</Typography>
                  <Typography variant="body1" color="text.secondary">{step.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </FadeIn>
      </Container>


      {/* Section 4: Capabilities (Platform) */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.default', position: 'relative', overflow: 'hidden' }}>
        <FloatingParticles count={20} />
        <Container maxWidth="lg" sx={{ py: 16, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={8} alignItems="center">
            <Grid item xs={12} md={5}>
              <FadeIn direction="left" distance={50}>
                <Typography variant="h3" fontWeight={700} mb={3}>
                  <Box component="span" sx={{ color: 'primary.main' }}>
                    Enterprise-grade
                  </Box>
                  <br /> capabilities
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={4} fontSize="1.125rem">
                  Scalable infrastructure designed to handle high-frequency transactions and large-scale inventory management without compromising performance.
                </Typography>
                <MagneticButton>
                  <Button
                    variant="outlined"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      textTransform: 'none',
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        bgcolor: 'action.hover',
                      },
                    }}
                    component={RouterLink}
                    to="/signup"
                  >
                    Explore Features
                  </Button>
                </MagneticButton>
              </FadeIn>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                {capabilities.map((cap, i) => (
                  <Grid item xs={12} sm={6} key={i}>
                    <FadeIn delay={i * 100}>
                      <TiltCard maxTilt={8} scale={1.03}>
                        <Box
                          sx={{
                            p: 3,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            height: '100%',
                            cursor: 'pointer',
                            transition: 'border-color 0.3s ease',
                            '&:hover': {
                              borderColor: 'primary.main',
                            },
                          }}
                        >
                          <Box
                            sx={{
                              mb: 2,
                              color: 'text.primary',
                              width: 40,
                              height: 40,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'action.hover',
                            }}
                          >
                            {cap.icon}
                          </Box>
                          <Typography variant="h6" fontWeight={600} gutterBottom>{cap.title}</Typography>
                          <Typography variant="body2" color="text.secondary">{cap.description}</Typography>
                        </Box>
                      </TiltCard>
                    </FadeIn>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Section 5: Final CTA */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', py: 16, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="md" sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <FadeIn direction="scale">
            <Typography variant="h2" fontWeight={700} mb={3} letterSpacing="-0.03em">
              Ready to{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                optimize
              </Box>
              {' '}your supply chain?
            </Typography>
            <Typography variant="h6" color="text.secondary" fontWeight={400} mb={6} maxWidth="600px" mx="auto">
              Join hundreds of businesses using Stockway to streamline their delivery network.
            </Typography>
            <MagneticButton strength={0.15}>
              <Button
                component={RouterLink}
                to="/signup"
                variant="contained"
                size="large"
                sx={{
                  px: 8,
                  py: 2,
                  fontSize: '1.125rem',
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: '0 8px 30px rgba(59, 130, 246, 0.4)',
                  transition: 'all 0.3s cubic-bezier(0.33, 1, 0.68, 1)',
                  '&:hover': {
                    boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                Get Started Now
              </Button>
            </MagneticButton>
          </FadeIn>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
