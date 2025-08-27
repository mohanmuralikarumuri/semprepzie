import { Router } from 'express';
import { deviceController } from '../controllers/device.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { asyncHandler } from '../middlewares/error.middleware';

const router = Router();

// Device management routes
router.post('/register', asyncHandler(deviceController.registerDevice));
router.get('/', authenticateToken, asyncHandler(deviceController.getDevices));
router.post('/count', asyncHandler(deviceController.getDeviceCount));
router.post('/logout-others', authenticateToken, asyncHandler(deviceController.logoutOtherDevices));
router.delete('/:deviceId', authenticateToken, asyncHandler(deviceController.revokeDevice));

export default router;
