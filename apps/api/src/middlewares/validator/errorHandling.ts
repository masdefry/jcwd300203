import { Request, Response, NextFunction } from "express";
const { validationResult } = require('express-validator');

export const errorHandling = (req: Request, res: Response, next: NextFunction) => {
    try {
        const errorResult = validationResult(req)

        if(errorResult.isEmpty() === false){
            throw {msg: errorResult.array()[0].msg, status: 406}
        }else{
            console.log(errorResult)
            next()
        }
    } catch (error) {
        console.log(error)
        next(error)
    }
}