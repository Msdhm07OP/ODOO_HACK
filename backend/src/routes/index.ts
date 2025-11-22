import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import warehouseRoutes from './warehouse.routes';
import documentRoutes from './document.routes'; // ADD THIS LINE
import dashboardRoutes from './dashboard.routes';
import alertsRoutes from './alerts.routes';
import { apiLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

// Apply rate limiting to all API routes
router.use(apiLimiter);

// Mount routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/documents', documentRoutes); // ADD THIS LINE
router.use('/dashboard', dashboardRoutes);
router.use('/alerts', alertsRoutes);

export default router;
