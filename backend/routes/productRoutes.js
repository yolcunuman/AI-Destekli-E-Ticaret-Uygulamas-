import express from 'express';
import { getProducts, getProductById, deleteProduct, createProduct, updateProduct, getRecommendations, placeBid } from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);
// Öneri rotası id parametresinden önce olmalı
router.route('/recommendations/:id').get(getRecommendations);
router.route('/:id/bid').post(protect, placeBid);
router.route('/:id').get(getProductById).delete(protect, admin, deleteProduct).put(protect, admin, updateProduct);

export default router;
