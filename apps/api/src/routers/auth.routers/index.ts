import { loginCustomer, loginTenant, loginWithSocialMedia, registerCustomer} from "@/controllers/auth.controller";
import { errorHandling } from "@/middlewares/validator/error.handling";
import { Router } from "express";

const router = Router();

router.post('/register/customer',errorHandling,registerCustomer);
router.post('/login/customer',errorHandling,loginCustomer);
router.post('/login/tenant',errorHandling,loginTenant);
router.post('/login/social',errorHandling, loginWithSocialMedia);

export default router;