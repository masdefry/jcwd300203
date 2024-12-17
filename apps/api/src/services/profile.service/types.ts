export interface IEditCustomerProfile {
    name: string;
    username: string;
    usersId: number;
    uploadedImage: { [fieldname: string]: Express.Multer.File[] | any};
}

export interface IEditTenantProfile extends IEditCustomerProfile{   
}

