import { Router } from "express";
import { getPropertiesList, getPropertiesListTenant, getPropertyDetails, getPropertyDetailsTenant } from "@/controllers/property.controller";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";

const router = Router();

router.get('/', getPropertiesList);
router.get('/details/:id', getPropertyDetails);
router.get('/tenant', verifyToken, verifyRoleTenant, getPropertiesListTenant);
router.get('/tenant/details/:id', verifyToken, verifyRoleTenant, getPropertyDetailsTenant);

export default router;