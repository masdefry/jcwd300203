import express, {Router} from 'express';
import authRouters from './auth.routers/index';
import profileRouters from './profile.routers/index';
import propertyRouters from './property.routers/index';
import transactionRouters from './transaction.routers/index'
import orderRouters from "./order.routers/index"
import reviewRouters from "./review.routers/index"

const router = Router();

router.use('/api/auth', authRouters);
router.use('/api/profile', profileRouters);
router.use('/api/property', propertyRouters);
router.use('/api/transaction', transactionRouters)
router.use('/api/orders', orderRouters)
router.use('/api/reviews', reviewRouters)

export default router;