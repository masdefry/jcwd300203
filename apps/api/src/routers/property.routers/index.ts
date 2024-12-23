import { Router } from "express";
import { createFacilitiesIcons, createProperty, deleteProperty, getPropertiesAndRoomFacilities, getPropertiesList, getPropertiesListTenant, getPropertyDetails, getPropertyDetailsTenant } from "@/controllers/property.controller";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";
import { uploadIcon } from "@/middlewares/upload.multer.icon";
import { uploadProperty } from "@/middlewares/upload.property";

const router = Router();

router.get('/', getPropertiesList);
router.get('/details/:id', getPropertyDetails);
router.get('/tenant', verifyToken, verifyRoleTenant, getPropertiesListTenant);
router.get('/tenant/details/:id', verifyToken, verifyRoleTenant, getPropertyDetailsTenant);
router.delete('/:id', verifyToken, verifyRoleTenant, deleteProperty);
router.get('/facilites',  getPropertiesAndRoomFacilities);
router.post('/facilities/create',  uploadIcon, createFacilitiesIcons);
router.post('/', verifyToken, verifyRoleTenant, uploadProperty, createProperty);

export default router;