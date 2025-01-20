export interface IBaseProfile {
    name: string;
    email: string;
    username: string;
    role: string;
    profileImage?: string;
  }
  
  export interface ICustomerProfile extends IBaseProfile {
    verified: boolean;
  }
  
  export interface ITenantProfile extends IBaseProfile {
    idCardImage?: string;
  }
  
  export interface IEditProfileInput {
    name: string;
    username: string;
    profileImage?: File;
  }
  
  export interface IChangePasswordInput {
    password: string;
    newPassword: string;
  }
  
  export interface IChangeEmailInput {
    newEmail: string;
  }
  
  export interface IUploadIdCardInput {
    idCardImage: File;
  }