const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Auto-discovery of routes
const routesPath = __dirname;
const routeFiles = fs.readdirSync(routesPath)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== 'index.js' &&
      file.slice(-3) === '.js'
    );
  });

// Automatically load all route files
routeFiles.forEach(file => {
  const routeName = path.basename(file, '.js');
  const routePath = path.join(routesPath, file);
  
  try {
    const routeModule = require(routePath);
    
    // Extract route prefix from filename with better logic
    let routePrefix = routeName.replace(/Routes?$/i, '');
    
    // Special cases for common route names
    const specialCases = {
      'auth': 'auth',
      'authentication': 'auth',
      'user': 'users',
      'post': 'posts',
      'product': 'products',
      'category': 'categories',
      'order': 'orders'
    };
    
    // Check if it's a special case
    if (specialCases[routePrefix.toLowerCase()]) {
      routePrefix = specialCases[routePrefix.toLowerCase()];
    } else if (!routePrefix.endsWith('s') && routePrefix !== 'auth') {
      // Convert to plural if not already (basic pluralization)
      routePrefix += 's';
    }
    
    router.use(`/${routePrefix}`, routeModule);
    console.log(`📍 Route loaded: /api/${routePrefix} from ${file}`);
  } catch (error) {
    console.error(`❌ Error loading route ${file}:`, error.message);
  }
});

// List all available routes
router.get('/', (req, res) => {
  const availableRoutes = routeFiles.map(file => {
    const routeName = path.basename(file, '.js');
    let routePrefix = routeName.replace(/Routes?$/i, '');
    
    // Apply same logic as route loading
    const specialCases = {
      'auth': 'auth',
      'authentication': 'auth',
      'user': 'users',
      'post': 'posts',
      'product': 'products',
      'category': 'categories',
      'order': 'orders'
    };
    
    if (specialCases[routePrefix.toLowerCase()]) {
      routePrefix = specialCases[routePrefix.toLowerCase()];
    } else if (!routePrefix.endsWith('s') && routePrefix !== 'auth') {
      routePrefix += 's';
    }
    
    return `/api/${routePrefix}`;
  });

  res.status(200).json({
    success: true,
    message: 'Available API routes',
    routes: {
      health: '/api/health',
      ...availableRoutes.reduce((acc, route) => {
        const routeName = route.split('/').pop();
        acc[routeName] = route;
        return acc;
      }, {})
    }
  });
});

module.exports = router;
