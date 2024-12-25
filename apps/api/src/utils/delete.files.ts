import fs from 'fs';

export const deleteFiles = ({imagesUploaded}: {imagesUploaded: {images: {path: string}[]}}) => {
    imagesUploaded.images.forEach((item) => {
        if (fs.existsSync(item.path)) {  
            fs.rmSync(item.path);
        }
    });
};