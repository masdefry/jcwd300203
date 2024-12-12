import { JwtPayload } from "jsonwebtoken";

export interface ILogin{
    emailOrUsername: string;
    password: string
}

export interface IRegisterCustomer{
    name: string;
    username: string;
    password: string;
    resetPasswordToken: string | undefined;
}

export interface IRegisterTenant extends IRegisterCustomer{
    profileImage: string;
    idCardImage: string;
}

export interface IChangePassword {
    usersId: number;
    password: string;
    newPassword: string;
}

export interface ChangeEmailTokenPayload extends JwtPayload{
    data: {
        newEmail: string ;
    }
}

export interface IDecodeRefreshToken extends JwtPayload{
    data: {
        id: number;
        role: string;
    }
}
