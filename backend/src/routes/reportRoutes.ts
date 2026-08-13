import { Router } from 'express';
import { getRevenueReport, getOrdersReport } from '../controllers/reportControllers';
import { authent } from '../middlewares/authMiddleware';

const router = Router();

router.get('/revenue', authent, getRevenueReport);
router.get('/orders', authent, getOrdersReport);

export default router;
