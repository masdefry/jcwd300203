import express, {Router} from 'express';
import authRouters from './auth.routers/index';

const router = Router();

router.use('/api/auth', authRouters)

export default router;