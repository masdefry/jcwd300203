import { RequestWithFiles } from "@/controllers/auth.controller/types";

export interface IEditCustomerProfile {
    name: string;
    username: string;
    usersId: number;
    uploadedImage: { [fieldname: string]: Express.Multer.File[] | any};
}