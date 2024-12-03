import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'djayakarta.devan2004@gmail.com', //Email sender
        pass: 'wpdrvshaokbhhsyf' // Key generate or app password from google
    },
    tls: {
        rejectUnauthorized: false
    }
})
