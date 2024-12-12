import express, {Router} from 'express';
import authRouters from './auth.routers/index';
import profileRouters from './profile.routers/index';
import propertyRouters from './property.routers/index';

const router = Router();

router.use('/api/auth', authRouters);
router.use('/api/profile', profileRouters);
router.use('/api/property', propertyRouters);

export default router;