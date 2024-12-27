import { createFacilitiesIconsService, createPropertyService, deletePropertyService, getPropertiesAndRoomFacilitiesService, getPropertiesListService, getPropertiesListTenantService, getPropertyDetailsService, getPropertyDetailsTenantService, getRoomDetailsByIdService } from "@/services/property.service";
import { Request, Response, NextFunction } from "express";
import { parseCustomDate, parseCustomDateList } from "@/utils/parse.date";

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

        console.log('checkIn: ',checkIn)
        console.log('checkOut: ',checkOut)

        console.log('parsed checkin: ',parsedCheckIn)
        console.log('parsed checkout: ',parsedCheckOut)

        const pageNumber = page ? parseInt(page as string, 10) : 1
        const pageSize = limit ? parseInt(limit as string, 10) : 10
        const offset = (pageNumber - 1) * pageSize;

        const allowedSortBy = ['name', 'price'];
        const allowedSortOrder = ['asc', 'desc'];

        const validSort = allowedSortBy.includes(sortBy as string) ? (sortBy as string) : 'name'
        const validSortOrder = allowedSortOrder.includes (sortOrder as string) ? (sortOrder as string) : 'asc'

        console.log({
            parsedCheckIn,
            parsedCheckOut,
            search,
            guestCount,
            offset,
            pageSize,
            sortBy: validSort,
            sortOrder: validSortOrder
        });

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
        const {usersId, authorizationRole, name, address, city, category, description, roomCapacity, facilityIds, roomTypes} = req.body;
        console.log('Initial request body:', req.body);
        
        if (!name || !address || !city || !description || !roomCapacity || !roomTypes) throw { msg: 'Missing required fields', status: 400 };

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        console.log('Files in request:', req.files);

        if (!files.mainImage || !files.mainImage[0]) throw { msg: 'Main image is required', status: 400 };
        console.log('usersId from createProperty :', usersId);
        console.log('authorizationRole from createProperty :', authorizationRole);
        console.log('Initial request body:', req.body);
        console.log('Parsed facilityIds:', JSON.parse(req.body.facilityIds));
        console.log('Parsed roomTypes:', JSON.parse(req.body.roomTypes));
        console.log('Files in request:', req.files);
          
        const data = await createPropertyService({usersId, authorizationRole,
            propertyData: {
                name,
                address,
                city,
                category,
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

export const deleteProperty = async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {usersId, authorizationRole} = req.body;
        const {id} = req.params;

        await deletePropertyService({usersId, authorizationRole, id})

        res.status(200).json({
            error: false,
            message: 'Property deleted',
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

export const createFacilitiesIcons = async(req: Request, res: Response, next: NextFunction) => {
    try {
        // const {id, role} = req.body
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

      console.log(roomDetails)
  
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
  