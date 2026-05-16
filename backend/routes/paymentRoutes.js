import express from 'express';
import { createPaymentSession, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/create-session', protect, createPaymentSession);
router.post('/verify', protect, verifyPayment);

export default router;
