import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const warehouseController = new WarehouseController();

router.get('/', authenticate, warehouseController.getAll);
router.get('/:id', authenticate, warehouseController.getById);
router.post('/', authenticate, authorize('admin'), warehouseController.create);
router.put('/:id', authenticate, authorize('admin'), warehouseController.update);

export default router;
