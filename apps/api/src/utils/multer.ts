import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, 'src/public/images')
    },
    filename: function (req, file, cb){
        const splitOriginalName = file.originalname.split('.')
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + '.' + splitOriginalName[splitOriginalName.length-1]) // images-Date.now-Math.round()
    }
})
// const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: any) => {
    const extensionAccepted = ['png', 'jpg', 'jpeg', 'webp', 'svg']

    const splitOriginalName = file.originalname.split('.')
    if(!extensionAccepted.includes(splitOriginalName[splitOriginalName.length-1])){
        return cb(new Error('Format File Tidak Diizinkan'))
    }

    return cb(null, true)
}


export const uploadMulter = multer({storage: storage, fileFilter: fileFilter, limits: {fieldSize: 2 * 1024 * 1024}})