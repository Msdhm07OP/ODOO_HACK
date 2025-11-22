import { Router } from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();
const documentController = new DocumentController();

router.get('/', authenticate, documentController.getAll.bind(documentController));
router.get('/:id', authenticate, documentController.getById.bind(documentController));
router.post('/', authenticate, authorize('manager', 'admin'), documentController.create.bind(documentController));
router.patch('/:id/status', authenticate, authorize('manager', 'admin'), documentController.updateStatus.bind(documentController));
router.delete('/:id', authenticate, authorize('admin'), documentController.delete.bind(documentController));

export default router;
