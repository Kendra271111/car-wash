import { Router } from 'express';
import userRoute from './userRoutes';
import orderRoute from './orderRoutes';
import authRoute from './authRoutes';
import serviceRoute from './serviceRoutes';
import customerRoute from './customerRoutes';
import vehicleRoute from './vehicleRoutes';

const router = Router();

router.use('/users', userRoute);
router.use('/orders', orderRoute);
router.use('/services', serviceRoute);
router.use('/customers', customerRoute);
router.use('/vehicles', vehicleRoute);
router.use('/auth', authRoute);

export default router;

