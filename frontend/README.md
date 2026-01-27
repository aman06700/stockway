# Stockway Frontend

A production-grade React frontend for the Stockway platform, built with TypeScript, Material-UI, and modern React patterns.

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **React Router** for routing
- **Zustand** for state management
- **Axios** for API communication
- **Vite** for build tooling
- **date-fns** for date formatting

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Backend API running on `http://localhost:8000` (or configured via `.env`)

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env and configure your API URL
VITE_API_BASE_URL=http://localhost:8000
```

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── common/      # Common components (Loading, Error, etc.)
│   ├── shopkeeper/  # Shopkeeper-specific components
│   ├── warehouse/   # Warehouse-specific components
│   ├── rider/       # Rider-specific components
│   └── admin/       # Admin-specific components
├── pages/           # Page components organized by role
│   ├── auth/        # Authentication pages
│   ├── shopkeeper/  # Shopkeeper pages
│   ├── warehouse/   # Warehouse pages
│   ├── rider/       # Rider pages
│   └── admin/       # Admin pages
├── services/        # API service layer
├── store/           # Zustand state management
├── hooks/           # Custom React hooks
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── routes/          # Routing configuration
├── theme/           # MUI theme configuration
├── App.tsx          # Root application component
└── main.tsx         # Application entry point
```

## Features by Role

### Shopkeeper
- View nearby warehouses
- Browse inventory
- Create and manage orders
- Track order status
- View delivery information

### Warehouse Manager
- Manage warehouse profile
- Manage inventory items
- Accept/reject orders
- Assign riders to deliveries
- View order history

### Rider
- View assigned deliveries
- Update delivery status
- Track earnings
- Update availability status

### Admin
- User management
- Warehouse approval
- System-wide analytics
- Platform configuration

## Key Features

- **OTP-based Authentication**: Secure login via email OTP
- **Role-based Access Control**: Different interfaces for each user role
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Real-time Updates**: Live order and delivery tracking
- **Error Handling**: Comprehensive error boundaries and fallbacks
- **Loading States**: Smooth loading indicators
- **Accessibility**: ARIA labels and keyboard navigation
- **Type Safety**: Full TypeScript coverage

## API Integration

The frontend connects to the Django backend API. All API calls go through the centralized service layer in `src/services/`.

### Authentication Flow

1. User enters email on login page
2. Backend sends OTP to email
3. User enters OTP
4. Backend validates and returns JWT token
5. Token stored in localStorage
6. Included in all subsequent API requests

### API Services

- `authService`: Authentication (login, logout, user info)
- `shopkeeperService`: Shopkeeper operations
- `warehouseService`: Warehouse management
- `inventoryService`: Inventory browsing
- `orderService`: Order creation and management
- `riderService`: Rider operations

## Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deployment Options

1. **Static Hosting** (Netlify, Vercel, Cloudflare Pages)
   - Deploy the `dist/` folder
   - Configure environment variables
   - Set up redirects for SPA routing

2. **Docker**
   - Use nginx to serve static files
   - Configure API proxy if needed

3. **Traditional Web Server**
   - Deploy `dist/` contents to web root
   - Configure server for SPA routing

### Environment Configuration

For production, update the `.env` file with production API URL:

```env
VITE_API_BASE_URL=https://api.stockway.com
```

## Development Guidelines

- Use functional components with hooks
- Follow the established folder structure
- Add proper TypeScript types
- Handle loading and error states
- Test on mobile devices
- Keep components small and focused
- Use MUI components consistently
- Follow Material Design guidelines

## Troubleshooting

### Common Issues

**API Connection Failed**
- Ensure backend is running
- Check `.env` configuration
- Verify CORS settings on backend

**Build Errors**
- Clear `node_modules` and reinstall
- Check TypeScript errors with `npm run type-check`

**Path Alias Issues**
- Ensure `tsconfig.json` has correct path mappings
- Restart VS Code/IDE after changes

## License

Proprietary - Stockway Platform

## Support

For issues or questions, contact the development team.
