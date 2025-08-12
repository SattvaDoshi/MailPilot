import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { 
  setupTwoFactor, 
  enableTwoFactor, 
  disableTwoFactor, 
  regenerateBackupCodes, 
  resetTwoFactor
} from '../controllers/mfaController.js';

const router = express.Router();

router.post('/setup', authenticate, setupTwoFactor);
router.post('/enable', authenticate, enableTwoFactor);
router.post('/disable', authenticate, disableTwoFactor);
router.post('/backup-codes', authenticate, regenerateBackupCodes);
router.post('/reset', authenticate, resetTwoFactor);


export default router;
