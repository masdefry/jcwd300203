import jwt from "jsonwebtoken";

interface ICreateTokenParams {
    id: number | undefined;   
    role: string | undefined; 
}

export const ACCESS_TOKEN_SECRET = 'abc5dasar';
export const REFRESH_TOKEN_SECRET = 'tuyulkawin420'; 


export const createToken = ({id, role}: ICreateTokenParams) => {
    return jwt.sign({data: {id, role}}, ACCESS_TOKEN_SECRET, {expiresIn: '5m'});
}

export const createRefreshToken = ({id, role}: ICreateTokenParams) => {
    return jwt.sign({data: {id, role}}, REFRESH_TOKEN_SECRET, {expiresIn: '1d'});
}

export const decodeToken = (token: string) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export const decodeRefreshToken = (token: string) => {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
}