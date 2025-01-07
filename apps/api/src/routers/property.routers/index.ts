import { Router } from "express";
import { createFacilitiesIcons, createProperty, deleteProperty, getPropertiesAndRoomFacilities, getPropertiesList, getPropertiesListTenant, getPropertyDetails, getPropertyDetailsTenant, getRoomDetailsById, getPropertyIdByRoomId, getPropertyCategories, createPropertyCategories } from "@/controllers/property.controller";
import { verifyToken } from "@/middlewares/verify.token";
import { verifyRoleTenant } from "@/middlewares/verify.role.tenant";
import { uploadIcon } from "@/middlewares/upload.multer.icon";
import { uploadProperty } from "@/middlewares/upload.property";

const router = Router();

router.get('/', getPropertiesList);
router.get('/details/:id', getPropertyDetails);
router.get('/tenant', verifyToken, verifyRoleTenant, getPropertiesListTenant);
router.get('/tenant/details/:id', verifyToken, verifyRoleTenant, getPropertyDetailsTenant);
router.patch('/delete/:id', verifyToken, verifyRoleTenant, deleteProperty);
router.get('/facilites',  getPropertiesAndRoomFacilities);
router.post('/facilities/create',  uploadIcon, createFacilitiesIcons);
router.post('/', verifyToken, verifyRoleTenant, uploadProperty, createProperty);
router.get('/roomType/details', getRoomDetailsById);
router.get('/roomType/propertyId', getPropertyIdByRoomId);
router.get('/categories', getPropertyCategories)
router.post('/categories', verifyToken, verifyRoleTenant, uploadIcon, createPropertyCategories)

export default router;