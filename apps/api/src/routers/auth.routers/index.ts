import { loginCustomer, loginTenant} from "@/controllers/auth.controller";
import { errorHandling } from "@/middlewares/validator/error.handling";
import { Router } from "express";

const router = Router();

router.post('/login/user',errorHandling,loginCustomer);
router.post('/login/customer',errorHandling,loginTenant);

export default router;