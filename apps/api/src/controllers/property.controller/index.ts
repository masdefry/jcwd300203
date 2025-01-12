import { createFacilitiesIconsService, createPropertyService, deletePropertyService, getPropertiesAndRoomFacilitiesService, getPropertiesListService, getPropertiesListTenantService, getPropertyDetailsService, getPropertyDetailsTenantService, getRoomDetailsByIdService, getPropertyIdByRoomIdService, getPropertyCategoriesService, createPropertyCategoriesService, editPropertyService } from "@/services/property.service";
import { Request, Response, NextFunction } from "express";
import { parseCustomDate, parseCustomDateList } from "@/utils/parse.date";
import { error } from "console";
import { deleteFiles } from "@/utils/delete.files";

export  const getPropertiesList = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const currentDate = new Date()
        currentDate.setHours(0, 0, 0, 0)

        const {search, checkIn, checkOut, guest, sortBy, sortOrder, page, limit} = req.query

        console.log('checkIn: ', checkIn)
        console.log('checkOut: ', checkOut) 

        console.log('type of checkIn: ', typeof checkIn)
        console.log('type of checkOut: ', typeof checkOut)

        if (checkIn && typeof checkIn !== "string") throw { msg: "Invalid date", status: 406 };
        if (checkOut && typeof checkOut !== "string") throw { msg: "Invalid date", status: 406 };
        if (search && typeof search !== "string") throw { msg: "Invalid search input", status: 406 };
        if (guest && typeof guest !== "string") throw { msg: "Invalid guest count", status: 406 };

        if (search && !checkIn && !checkOut && !guest) throw {msg: 'Please complete the input', status:400}

        const parsedCheckIn = checkIn ? parseCustomDateList(checkIn) : undefined;
        if (parsedCheckIn! < currentDate) throw {msg: 'Invalid Date', status: 406}
        const parsedCheckOut = checkOut ? parseCustomDateList(checkOut) : undefined;
        const guestCount = guest ? Number(guest) : undefined 

        const pageNumber = page ? parseInt(page as string, 10) : 1
        const pageSize = limit ? parseInt(limit as string, 10) : 10
        const offset = (pageNumber - 1) * pageSize;

        const allowedSortBy = ['name', 'price'];
        const allowedSortOrder = ['asc', 'desc'];

        const validSort = allowedSortBy.includes(sortBy as string) ? (sortBy as string) : 'name'
        const validSortOrder = allowedSortOrder.includes (sortOrder as string) ? (sortOrder as string) : 'asc'

        const properties = await getPropertiesListService({parsedCheckIn, parsedCheckOut, search: search || undefined, guest: guest || undefined, offset, pageSize, sortBy: validSort, sortOrder: validSortOrder})

        res.status(200).json({
            error: false,
            message: 'Properties retrieved',
            data: properties
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertyDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {id} = req.params;
        const {checkIn, checkOut} = req.query;

        
        const parsedCheckIn = checkIn ? parseCustomDate(checkIn as any) : undefined
        const parsedCheckOut = checkOut ? parseCustomDate(checkOut as any) : undefined ;
        console.log(parsedCheckIn)
        console.log(parsedCheckOut)
        const data = await getPropertyDetailsService({id, parsedCheckIn, parsedCheckOut})
        
        res.status(200).json({
            error: false,
            message: 'Property founded',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertiesListTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body

        const data = await getPropertiesListTenantService({usersId, authorizationRole})

        res.status(200).json({
            error: false,
            message: 'Properties retrieved',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertyDetailsTenant = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body
        const {id} = req.params

        const data = await getPropertyDetailsTenantService({usersId, authorizationRole, id})

        res.status(200).json({
            error: false,
            message: 'Property found',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const createProperty = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole, name, address, city, categoryId, description, roomCapacity, facilityIds, roomTypes} = req.body;
        console.log('Initial request body:', req.body);
        
        if (!name || !address || !city || !description || !roomCapacity || !roomTypes) throw { msg: 'Missing required fields', status: 400 };

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        console.log('Files in request:', req.files);

        if (!files.mainImage || !files.mainImage[0]) throw { msg: 'Main image is required', status: 400 };
          
        const data = await createPropertyService({usersId, authorizationRole,
            propertyData: {
                name,
                address,
                city,
                categoryId: Number(categoryId),
                description,
                roomCapacity: Number(roomCapacity),
                facilityIds: JSON.parse(facilityIds),
                roomTypes: JSON.parse(roomTypes)
            },
        files});
        
        res.status(201).json({
            error: false,
            message: 'Property successfully created',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const editProperty = async(req: Request, res: Response, next: NextFunction) => {
    // Track uploaded files for cleanup in case of error
    const uploadedFiles: { path: string }[] = [];
    
    try {
        const { usersId, authorizationRole } = req.body;
        const { id } = req.params;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Parse the property data
        const propertyData = JSON.parse(req.body.data);

        // Track uploaded files
        if (files) {
            Object.values(files).flat().forEach(file => {
                uploadedFiles.push({ path: file.path });
            });
        }

        // Handle main image
        const mainImage = files?.mainImage?.[0]?.filename;

        // Handle property images
        const propertyImages = files?.propertyImages?.map(file => file.filename) || [];

        // Handle room images
        const roomImages: { [key: number]: string[] } = {};
        Object.keys(files || {}).forEach(key => {
            if (key.startsWith('roomTypeImages')) {
                const index = parseInt(key.replace('roomTypeImages', ''));
                roomImages[index] = files[key].map(file => file.filename);
            }
        });

        // Map room types with their images
        const roomTypesToUpdate = propertyData.roomTypesToUpdate?.map((room: any, index: number) => ({
            ...room,
            images: roomImages[index] || undefined, // Only include if new images were uploaded
            specialPrice: room.specialPrice?.map((sp: any) => ({
                ...sp,
                date: new Date(sp.date),
                price: parseFloat(sp.price)
            }))
        })) || [];

        const roomTypesToAdd = propertyData.roomTypesToAdd?.map((room: any, index: number) => ({
            ...room,
            images: roomImages[10000 + index] || [], // Use offset for new rooms
            specialPrice: room.specialPrice?.map((sp: any) => ({
                date: new Date(sp.date),
                price: parseFloat(sp.price)
            }))
        })) || [];

        const updatedProperty = await editPropertyService({
            propertyId: Number(id),
            tenantId: usersId,
            tenantRole: authorizationRole,
            name: propertyData.name,
            address: propertyData.address,
            city: propertyData.city,
            categoryId: propertyData.categoryId ? parseInt(propertyData.categoryId) : undefined,
            description: propertyData.description,
            roomCapacity: propertyData.roomCapacity ? parseInt(propertyData.roomCapacity) : undefined,
            mainImage,
            propertyImages,
            facilityIds: propertyData.facilityIds?.map((id: string) => parseInt(id)),
            roomTypesToUpdate,
            roomTypesToAdd,
            roomTypesToDelete: propertyData.roomTypesToDelete?.map((id: string) => parseInt(id)),
            imagesToDelete: propertyData.imagesToDelete?.map((id: string) => parseInt(id))
        });

        res.status(200).json({
            error: false,
            message: 'Property updated successfully',
            data: updatedProperty
        });
    } catch (error) {
        if (uploadedFiles.length > 0) deleteFiles({ imagesUploaded: { images: uploadedFiles } });
        next(error);
    }
};

export const deleteProperty = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body;
        const {id} = req.params;

        await deletePropertyService({usersId, authorizationRole, id})

        res.status(200).json({
            error: false,
            message: 'Property successfully deleted',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertiesAndRoomFacilities = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getPropertiesAndRoomFacilitiesService()

        res.status(200).json({
            error: false,
            message: 'Facilities list retrieved',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const getPropertyCategories = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const data = await getPropertyCategoriesService()

        res.status(200).json({
            error: false,
            message: 'Categories retrieved',
            data: data
        })
    } catch (error) {
        next(error)
    }
}

export const createPropertyCategories = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {name} = req.body
        const iconFileName = req?.file?.filename

        if(!name || !iconFileName) throw {msg: 'Icon or Name required'}

        await createPropertyCategoriesService({name, iconFileName})

        res.status(201).json({
            error: false,
            message: 'Category created',
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

export const createFacilitiesIcons = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {name, type} = req.body
        const iconFileName = req?.file?.filename

        await createFacilitiesIconsService({name, type, iconFileName})

        res.status(200).json({
            error: false,
            message: `Facility ${name} added`,
            data: {}
        })
    } catch (error) {
        next(error)
    }
}

// Controller to fetch room details by ID
export const getRoomDetailsById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId, checkIn, checkOut } = req.query;
  
      // Validate roomId
      if (!roomId) {
        return res.status(400).json({ error: "Missing roomId in query parameters." });
      }
  
      // Parse and validate check-in and check-out dates
      const parsedCheckIn = checkIn ? new Date(checkIn as string) : new Date();
      const parsedCheckOut = checkOut ? new Date(checkOut as string) : new Date();
  
      if (
        (checkIn && isNaN(parsedCheckIn.getTime())) ||
        (checkOut && isNaN(parsedCheckOut.getTime()))
      ) {
        return res.status(400).json({ error: "Invalid checkIn or checkOut date format." });
      }
  
      // Fetch room details from the service
      const roomDetails = await getRoomDetailsByIdService({
        roomId: roomId as string,
        parsedCheckIn,
        parsedCheckOut,
      });

      console.log("roomDetails from controller: ", roomDetails)
  
      if (!roomDetails) {
        return res.status(404).json({ error: "Room not found." });
      }
  
      // Return room details
      return res.status(200).json({ data: roomDetails });
    } catch (error) {
      console.error("Error fetching room details:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
};

// controller to fetch property ID by Room ID
export const getPropertyIdByRoomId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roomId } = req.query;
  
      if (!roomId) {
        return res.status(400).json({ error: true, message: "Missing roomId parameter." });
      }
  
      const propertyId = await getPropertyIdByRoomIdService(roomId as string);
  
      if (!propertyId) {
        return res.status(404).json({ error: true, message: "Property not found for the given roomId." });
      }
  
      res.status(200).json({ error: false, data: { propertyId } });
    } catch (error) {
      next(error);
    }
};