import fs from 'fs';

export const deleteFiles = ({imagesUploaded}: any) => {
    imagesUploaded.images.forEach((item: any) => {
        fs.rmSync(item.path)
    })
}