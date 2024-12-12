import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define destination based on field name
        if (file.fieldname === 'profileImage') {
            cb(null, 'src/public/images/profileImage');
        } else if (file.fieldname === 'idCardImage') {
            cb(null, 'src/public/images/idCards');
        } else {
            cb(null, 'src/public/images');
        }
    },
    filename: function (req, file, cb) {
        const splitOriginalName = file.originalname.split('.');
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${file.fieldname}-${uniqueSuffix}.${splitOriginalName[splitOriginalName.length - 1]}`);
    },
});

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

export const uploadMulterProfile = multer({
    storage: storage,
    fileFilter: fileFilterProfile,
    limits: { fileSize: 1 * 1024 * 1024 }, // Adjusted key name
})

export const uploadMulter = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }, // Adjusted key name
});