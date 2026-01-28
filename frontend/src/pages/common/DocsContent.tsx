import { ReactNode } from 'react';
import { Typography, Box, List, ListItem, ListItemText, Paper, Divider, Chip, Grid } from '@mui/material';

export interface DocSection {
    id: string;
    title: string;
    content: ReactNode;
}

const CodeBlock = ({ children }: { children: ReactNode }) => (
    <Paper
        elevation={0}
        variant="outlined"
        sx={{
            p: 2,
            my: 2,
            bgcolor: 'action.hover',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflowX: 'auto',
            borderRadius: 1
        }}
    >
        {children}
    </Paper>
);

export const DOCS_SECTIONS: DocSection[] = [
    {
        id: 'intro',
        title: '1. Introduction',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>1. Introduction & Mental Model</Typography>
                <Typography paragraph>
                    Stockway is a <strong>modular monolithic backend platform</strong> designed to modernize and unify rural supply chains. It solves the fragmentation problem in last-mile logistics by connecting three key stakeholders—Shopkeepers, Warehouses, and Riders—into a single, geospatially aware ecosystem.
                </Typography>

                <Box sx={{ my: 4, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom align="center">
                        The Stockway Ecosystem
                    </Typography>
                    <Box display="flex" justifyContent="space-around" flexWrap="wrap" gap={2} textAlign="center">
                        <Paper sx={{ p: 2, width: 200, bgcolor: 'background.paper' }}>
                            <Typography variant="h6" color="primary">Shopkeeper</Typography>
                            <Typography variant="caption" display="block" color="text.secondary">Usually rural/semi-urban</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Browses inventory, places orders, awaits delivery.</Typography>
                        </Paper>
                        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>↔</Box>
                        <Paper sx={{ p: 2, width: 200, bgcolor: 'background.paper' }}>
                            <Typography variant="h6" color="secondary">Warehouse</Typography>
                            <Typography variant="caption" display="block" color="text.secondary">Strategic Hub</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Manages stock, validates orders, assigns riders.</Typography>
                        </Paper>
                        <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}>↔</Box>
                        <Paper sx={{ p: 2, width: 200, bgcolor: 'background.paper' }}>
                            <Typography variant="h6" color="success.main">Rider</Typography>
                            <Typography variant="caption" display="block" color="text.secondary">Logistics Agent</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>Accepts tasks, navigates to shop, confirms handover.</Typography>
                        </Paper>
                    </Box>
                </Box>

                <Typography variant="h6" gutterBottom>Core Philosophy</Typography>
                <List>
                    <ListItem>
                        <ListItemText
                            primary="Single Source of Truth"
                            secondary="One backend manages the state for all three apps/roles. No synchronization issues between disparate systems."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Role Integrity"
                            secondary="Strict permission boundaries ensure a shopkeeper cannot see warehouse admin panels, and riders only see their assigned deliveries."
                        />
                    </ListItem>
                    <ListItem>
                        <ListItemText
                            primary="Geospatial First"
                            secondary="Warehouses and deliveries are fundamentally tied to location. Logic prioritizes proximity to minimize cost and time."
                        />
                    </ListItem>
                </List>
            </>
        )
    },
    {
        id: 'architecture',
        title: '2. Architecture',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>2. Architecture Overview</Typography>
                <Typography paragraph>
                    Stockway is architected for reliability, auditability, and clear separation of concerns. It is not a microservice mesh, but a <strong>well-structured modular monolith</strong>.
                </Typography>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>The Stack</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>BACKEND</Typography>
                            <Typography variant="body2" paragraph><strong>Django + DRF</strong></Typography>
                            <Typography variant="body2" color="text.secondary">
                                Chosen for its robust ORM, rapid API development capabilities, and mature ecosystem. Handles all business logic, data validation, and core routing.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>DATABASE</Typography>
                            <Typography variant="body2" paragraph><strong>PostgreSQL + PostGIS</strong></Typography>
                            <Typography variant="body2" color="text.secondary">
                                Stores relational data and complex geospatial geometries. Spatial queries (e.g., "find warehouses within 5km") happen directly in the DB for performance.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>AUTH</Typography>
                            <Typography variant="body2" paragraph><strong>Supabase Auth + JWT</strong></Typography>
                            <Typography variant="body2" color="text.secondary">
                                Handles identity. We exchange Supabase tokens for internal JWTs to maintain session control and attach role metadata.
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>ASYNC</Typography>
                            <Typography variant="body2" paragraph><strong>Redis + Celery</strong></Typography>
                            <Typography variant="body2" color="text.secondary">
                                Offloads heavy computation (analytics, payouts) and handles high-frequency writes (location pings) to prevent API blocking.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Why Modular Monolith?</Typography>
                <Typography paragraph>
                    For a supply chain system, <strong>data consistency</strong> is non-negotiable. An order's state must be instantly visible to the warehouse and shopkeeper. A monolith allows us to share database transactions and models without the complexity of distributed consensus, while folder-based modularity (apps for `orders`, `inventory`, `users`) keeps the codebase organized.
                </Typography>
            </>
        )
    },
    {
        id: 'roles',
        title: '3. Role-Based Flows',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>3. Role-Based Flows</Typography>
                <Typography paragraph>
                    Every request in Stockway is scoped to a specific user role. The system strictly enforces these boundaries.
                </Typography>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h5" color="primary" gutterBottom>Shopkeeper Flow</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>Goal:</strong> Replenish store stock efficiently.
                    </Typography>
                    <List dense>
                        <ListItem>1. <strong>Locate</strong>: App requests lat/long. Backend queries PostGIS for warehouses within coverage radius.</ListItem>
                        <ListItem>2. <strong>Browse</strong>: Shopkeeper views aggregated inventory from nearby warehouses.</ListItem>
                        <ListItem>3. <strong>Order</strong>: Cart is converted to an Order Object. State = <code>PENDING</code>.</ListItem>
                        <ListItem>4. <strong>Track</strong>: Real-time updates as status changes to <code>ACCEPTED</code>, then <code>DELIVERED</code>.</ListItem>
                    </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="h5" color="secondary" gutterBottom>Warehouse Admin Flow</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>Goal:</strong> Fulfill orders and manage fleet.
                    </Typography>
                    <List dense>
                        <ListItem>1. <strong>Validate</strong>: Receive <code>PENDING</code> order. Check physical stock. Accept or Reject.</ListItem>
                        <ListItem>2. <strong>Assign</strong>: On Accept, system suggests available riders nearby. Admin confirms assignment.</ListItem>
                        <ListItem>3. <strong>Dispatch</strong>: Hand over package to rider. State = <code>PICKED_UP</code>.</ListItem>
                    </List>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="h5" color="success.main" gutterBottom>Rider Flow</Typography>
                    <Typography variant="body2" paragraph>
                        <strong>Goal:</strong> Pickup and deliver packages to earn money.
                    </Typography>
                    <List dense>
                        <ListItem>1. <strong>Online</strong>: Rider toggles availability. Location stream activates.</ListItem>
                        <ListItem>2. <strong>Task</strong>: Receives notification of assignment. Navigates to Warehouse.</ListItem>
                        <ListItem>3. <strong>Fulfill</strong>: Navigates to Shopkeeper. Confirms delivery via code/button. State = <code>DELIVERED</code>.</ListItem>
                        <ListItem>4. <strong>Earn</strong>: System calculates distance-based payout and credits wallet.</ListItem>
                    </List>
                </Box>
            </>
        )
    },
    {
        id: 'models',
        title: '4. Data & Models',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>4. Data & Domain Models</Typography>

                <Typography variant="h6" gutterBottom>Core Entities</Typography>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600}>User (Custom User Model)</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        The base identity. Contains <code>phone_number</code>, <code>role</code>, and auth tokens.
                    </Typography>
                    <CodeBlock>
                        {`role: 'SHOPKEEPER' | 'WAREHOUSE_MANAGER' | 'RIDER' | 'SUPER_ADMIN'
is_active: boolean // Soft deletion flag`}
                    </CodeBlock>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Order</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        The central transaction artifact. Connects all three roles.
                    </Typography>
                    <CodeBlock>
                        {`id: UUID
shopkeeper: ForeignKey(User)
warehouse: ForeignKey(Warehouse)
rider: ForeignKey(Rider, null=true)
status: 'PENDING' | 'ACCEPTED' | 'ASSIGNED' | 'PICKED_UP' | 'DELIVERED' | 'CANCELLED'
total_amount: Decimal
delivery_location: Point (PostGIS)`}
                    </CodeBlock>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600}>Warehouse</Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Represents physical distribution centers.
                    </Typography>
                    <CodeBlock>
                        {`manager: ForeignKey(User)
location: Point (PostGIS)
coverage_radius_km: Float`}
                    </CodeBlock>
                </Box>
            </>
        )
    },
    {
        id: 'api',
        title: '5. API Reference',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>5. API Documentation</Typography>
                <Typography paragraph>
                    <strong>Base URL:</strong> <code>/api/v1/</code>
                </Typography>

                <Typography variant="h6" gutterBottom color="primary">Orders Domain</Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>POST /orders/create/</Typography>
                    <Chip label="Role: Shopkeeper" size="small" color="primary" sx={{ mb: 1 }} />
                    <Typography variant="body2" paragraph>Creates a new order request for a specific warehouse.</Typography>

                    <Typography variant="caption" fontWeight={600}>Request Body</Typography>
                    <CodeBlock>
                        {`{
  "warehouse_id": "uuid-string",
  "items": [
    { "product_id": 12, "quantity": 5 }
  ]
}`}
                    </CodeBlock>

                    <Typography variant="caption" fontWeight={600}>Response (201 Created)</Typography>
                    <CodeBlock>
                        {`{
  "order_id": "uuid-string",
  "status": "PENDING",
  "total": 4500.00
}`}
                    </CodeBlock>
                </Paper>

                <Typography variant="h6" gutterBottom color="primary">Rider Domain</Typography>

                <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    <Typography variant="subtitle1" fontWeight={700} gutterBottom>POST /rider/location/</Typography>
                    <Chip label="Role: Rider" size="small" color="success" sx={{ mb: 1 }} />
                    <Typography variant="body2" paragraph>Updates rider's live coordinates. High-frequency endpoint.</Typography>

                    <Typography variant="caption" fontWeight={600}>Request Body</Typography>
                    <CodeBlock>
                        {`{
  "lat": 12.9716,
  "lng": 77.5946,
  "status": "AVAILABLE"
}`}
                    </CodeBlock>
                </Paper>
            </>
        )
    },
    {
        id: 'geo',
        title: '6. Geolocation',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>6. Geolocation & Intelligence</Typography>
                <Typography paragraph>
                    Location is a first-class citizen in Stockway. We use <strong>PostGIS</strong> geometries to handle spatial logic efficiently.
                </Typography>

                <Typography variant="h6" gutterBottom>How "Nearby" Works</Typography>
                <Typography paragraph>
                    When a shopkeeper opens the app, we utilize the <code>ST_DWithin</code> PostGIS function to filter warehouses.
                </Typography>
                <CodeBlock>
                    {`SELECT * FROM warehouse 
WHERE ST_DWithin(
  location, 
  ST_MakePoint(user_lng, user_lat)::geography, 
  coverage_radius_meters
);`}
                </CodeBlock>
                <Typography paragraph>
                    This ensures that a shopkeeper only sees warehouses capable of serving them, preventing logistical dead-ends.
                </Typography>

                <Typography variant="h6" gutterBottom>Rider Assignment</Typography>
                <Typography paragraph>
                    On order acceptance, the system queries for Available riders sorted by <code>ST_Distance</code> to the warehouse. This greedy approach minimizes the "first mile" pickup time.
                </Typography>
            </>
        )
    },
    {
        id: 'security',
        title: '7. Security',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>7. Security & Permissions</Typography>

                <Typography variant="h6" gutterBottom>Request Lifecycle</Typography>
                <List component="ol">
                    <ListItem>1. <strong>Authentication</strong>: Is the token valid?</ListItem>
                    <ListItem>2. <strong>Identification</strong>: Load user from DB. Is <code>is_active=True</code>?</ListItem>
                    <ListItem>3. <strong>Authorization</strong>: Check <code>RolePermission</code> class.</ListItem>
                    <ListItem>4. <strong>Object Level</strong>: Does this user own this specific Order/Profile?</ListItem>
                </List>

                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Common Error Codes</Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="401 Unauthorized" secondary="Token missing or invalid. Log in again." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="403 Forbidden" secondary="You are logged in, but your role cannot perform this action (e.g., Shopkeeper trying to Accept Order)." />
                    </ListItem>
                </List>
            </>
        )
    },
    {
        id: 'ops',
        title: '8. Operations',
        content: (
            <>
                <Typography variant="h4" gutterBottom fontWeight={700}>8. Operational Notes</Typography>

                <Typography variant="h6" gutterBottom>Configuration</Typography>
                <Typography paragraph>
                    The system relies on a `.env` file for secrets.
                </Typography>
                <CodeBlock>
                    {`DATABASE_URL=postgres://...
REDIS_URL=redis://...
SUPABASE_URL=...
SUPABASE_KEY=...`}
                </CodeBlock>

                <Typography variant="h6" gutterBottom>Testing Strategy</Typography>
                <Typography paragraph>
                    We use <code>pytest</code> driven by high-level business cases.
                </Typography>
                <List>
                    <ListItem>
                        <ListItemText primary="Unit Tests" secondary="Test individual model methods (e.g., calculating payout distance)." />
                    </ListItem>
                    <ListItem>
                        <ListItemText primary="Integration Tests" secondary="Test full API flows (Create Order -> Response 201)." />
                    </ListItem>
                </List>
            </>
        )
    }
];
