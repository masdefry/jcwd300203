//Multer.ts
import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
            cb(null, 'src/public/images');
      
    },
    filename: function (req, file, cb) {
        const splitOriginalName = file.originalname.split('.');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}.${splitOriginalName[splitOriginalName.length - 1]}`);
    },
});

const iconStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/public/images');
  
},
filename: function (req, file, cb) {
    const splitOriginalName = file.originalname.split('.');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${file.fieldname}-${uniqueSuffix}.${splitOriginalName[splitOriginalName.length - 1]}`);
},
})

const fileFilter = (req: any, file: any, cb: any) => {
    const extensionAccepted = ['png', 'jpg', 'jpeg', 'webp', 'svg'];

    const splitOriginalName = file.originalname.split('.');
    if (!extensionAccepted.includes(splitOriginalName[splitOriginalName.length - 1])) {
        return cb(new Error('File format is not allowed'));
    }

    return cb(null, true);
};

const fileFilterProfile = (req: any, file: any, cb: any) => {
    const extensionAccepted = ['png', 'jpg', 'jpeg', 'gif'];

    const splitOriginalName = file.originalname.split('.');
    if (!extensionAccepted.includes(splitOriginalName[splitOriginalName.length - 1])) {
        return cb(new Error('Only .jpg, .jpeg, .png, and .gif formats are allowed!'));
    }

    return cb(null, true);
};

const fileFilterIcon = (req: any, file: any, cb: any) => {
    const extensionAccepted = ['svg'];

    const splitOriginalName = file.originalname.split('.');
    if (!extensionAccepted.includes(splitOriginalName[splitOriginalName.length - 1])) {
        return cb(new Error('Only .svg formats are allowed!'));
    }

    return cb(null, true);
}

const fileFilterProperty = (req: any, file: any, cb: any) => {
    const extensionAccepted = ['png', 'jpg', 'jpeg', 'webp'];

    const splitOriginalName = file.originalname.split('.');
    const extension = splitOriginalName[splitOriginalName.length - 1].toLowerCase();

    if (file.size > 2 * 1024 * 1024) return cb(new Error('File size too large! Maximum size is 2MB'));
 

    // Validate extension
    if (!extensionAccepted.includes(extension)) return cb(new Error('Only .png, .jpg, .jpeg, and .webp formats are allowed for property images!'));

    return cb(null, true);
};

export const uploadMulterProperty = multer({
    storage: storage,
    fileFilter: fileFilterProperty,
    limits: { 
        fileSize: 2 * 1024 * 1024, 
    },
});

export const uploadMulterProfile = multer({
    storage: storage,
    fileFilter: fileFilterProfile,
    limits: { fileSize: 1 * 1024 * 1024 }, 
})

export const uploadMulterIcon = multer({
    storage: iconStorage,
    fileFilter: fileFilterIcon,
    limits: { fileSize: 1 * 1024 * 1024 }, 
})

export const uploadMulter = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, 
});