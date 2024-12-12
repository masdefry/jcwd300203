import { changeCustomerPassword, changeEmail, changeTenantPassword, keepLogin, loginCustomer, loginTenant, loginWithSocialMedia, refreshToken, registerCustomer, registerTenant, requestChangeEmail, requestResetPassword, resetPassword, verifyEmailCustomer, verifyEmailTenant} from "@/controllers/auth.controller";
import { errorHandling } from "@/middlewares/validator/error.handling";
import { uploadRegisterTenant } from "@/middlewares/upload.register.tenant";
import { Router } from "express";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";
import { verifyRoleCustomer } from "@/middlewares/verify.role.customer";

const router = Router();
router.post('/verify/email/customer',errorHandling, verifyEmailCustomer);
router.post('/verify/email/tenant',errorHandling, verifyEmailTenant);
router.patch('/register/customer',verifyToken,errorHandling, registerCustomer);
router.patch('/register/tenant', uploadRegisterTenant , errorHandling, registerTenant);
router.post('/login/customer',errorHandling,loginCustomer);
router.post('/login/tenant',errorHandling,loginTenant);
router.post('/login/social',errorHandling, loginWithSocialMedia);
router.post('/request/reset/password',errorHandling, requestResetPassword);
router.patch('/reset/password', errorHandling, resetPassword);
router.get('/', verifyToken, keepLogin);
router.patch('/password/customer',verifyToken, verifyRoleCustomer, changeCustomerPassword);
router.patch('/password/tenant',verifyToken, verifyRoleTenant, changeTenantPassword);
router.post('/request/email', verifyToken, requestChangeEmail);
router.patch('/email', verifyToken, changeEmail);
router.post('/request/verify/customer', verifyToken, verifyRoleCustomer, errorHandling);
router.patch('/verify/customer', verifyToken, verifyRoleCustomer, errorHandling);
router.post('/refresh-token', refreshToken)

export default router;