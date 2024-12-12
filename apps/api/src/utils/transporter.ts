import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    service: process.env.TRANSPORTER_SERVICE,
    auth: {
        user: process.env.TRANSPORTER_USER, 
        pass: process.env.TRANSPORTER_KEY 
    },
    tls: {
        rejectUnauthorized: false
    }
})