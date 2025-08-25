import { Request, Response } from 'express';
import { createError } from '../middlewares/error.middleware';
import { logger } from '../utils/logger';

// In-memory storage for devices (in production, use a database)
const deviceSessions = new Map<string, Set<string>>();

class DeviceController {
  public async registerDevice(req: Request, res: Response): Promise<void> {
    const { email, deviceId } = req.body;

    if (!email || !deviceId) {
      throw createError('Email and deviceId are required', 400);
    }

    try {
      // Store device session
      if (!deviceSessions.has(email)) {
        deviceSessions.set(email, new Set());
      }
      deviceSessions.get(email)!.add(deviceId);

      logger.info(`Device registered: ${deviceId} for ${email}`);

      res.json({
        success: true,
        message: 'Device registered successfully',
        deviceId,
        email
      });
    } catch (error) {
      logger.error('Device registration error:', error);
      throw createError('Failed to register device', 500);
    }
  }

  public async getDevices(req: Request, res: Response): Promise<void> {
    const email = req.user!.email;

    try {
      const devices = deviceSessions.get(email) || new Set();
      const deviceList = Array.from(devices).map(deviceId => ({
        id: deviceId,
        isActive: true,
        lastActive: new Date().toISOString()
      }));

      res.json({
        success: true,
        devices: deviceList,
        count: deviceList.length
      });
    } catch (error) {
      throw createError('Failed to fetch devices', 500);
    }
  }

  public async getDeviceCount(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    try {
      const devices = deviceSessions.get(email) || new Set();
      const deviceCount = devices.size;
      const hasMultipleDevices = deviceCount > 1;

      res.json({
        success: true,
        hasMultipleDevices,
        deviceCount,
        devices: Array.from(devices)
      });
    } catch (error) {
      logger.error('Device check error:', error);
      throw createError('Failed to check devices', 500);
    }
  }

  public async logoutOtherDevices(req: Request, res: Response): Promise<void> {
    const { currentDeviceId } = req.body;
    const email = req.user!.email;

    if (!currentDeviceId) {
      throw createError('Current device ID is required', 400);
    }

    try {
      // Clear all devices except current one
      const devices = deviceSessions.get(email) || new Set();
      const otherDevices = Array.from(devices).filter(id => id !== currentDeviceId);
      
      // Keep only current device
      deviceSessions.set(email, new Set([currentDeviceId]));

      logger.info(`Logged out ${otherDevices.length} other devices for ${email}`);

      res.json({
        success: true,
        message: 'Other devices logged out successfully',
        loggedOutDevices: otherDevices.length,
        currentDevice: currentDeviceId
      });
    } catch (error) {
      logger.error('Logout other devices error:', error);
      throw createError('Failed to logout other devices', 500);
    }
  }

  public async revokeDevice(req: Request, res: Response): Promise<void> {
    const { deviceId } = req.params;
    const email = req.user!.email;

    if (!deviceId) {
      throw createError('Device ID is required', 400);
    }

    try {
      const devices = deviceSessions.get(email);
      if (devices && devices.has(deviceId)) {
        devices.delete(deviceId);
        
        logger.info(`Device revoked: ${deviceId} for ${email}`);
        
        res.json({
          success: true,
          message: 'Device revoked successfully',
          deviceId
        });
      } else {
        throw createError('Device not found', 404);
      }
    } catch (error) {
      logger.error('Device revocation error:', error);
      throw createError('Failed to revoke device', 500);
    }
  }
}

export const deviceController = new DeviceController();
