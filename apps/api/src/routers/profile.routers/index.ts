import { editCustomerProfile, editTenantProfile, getCustomerProfile, getTenantProfile } from "@/controllers/profile.controller";
import { uploadProfile } from "@/middlewares/upload.profile";
import { uploadRegisterTenant } from "@/middlewares/upload.register.tenant";
import { verifyRoleCustomer } from "@/middlewares/verify.role.customer";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";
import { verifyToken } from "@/middlewares/verify.token";
import { Router } from "express";

const router = Router();

router.get('/customer', verifyToken, verifyRoleCustomer, getCustomerProfile);
router.get('/tenant', verifyToken, verifyRoleTenant, getTenantProfile);
router.patch('/customer', verifyToken, verifyRoleCustomer, uploadProfile, editCustomerProfile);
router.patch('/tenant', verifyToken, verifyRoleTenant, uploadRegisterTenant, editTenantProfile);

export default router;