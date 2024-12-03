import jwt from "jsonwebtoken"

interface ICreateTokenParams{
    id: string | undefined,
    role: string | undefined
}

export const createToken = ({id, role}: ICreateTokenParams) => {
    return jwt.sign({data: {id, role} }, 'abc5dasar', {expiresIn: '1h'})
}

export const decodeToken = (token: string) => {
    return jwt.verify(token, 'abc5dasar')
}
