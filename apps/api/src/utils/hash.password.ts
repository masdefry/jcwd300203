import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
    const saltRounds = 15
    return await bcrypt.hash(password, saltRounds)
}

export const comparePassword = async (passwordUser: string, passwordDb: string ) => {
    return await bcrypt.compare(passwordUser, passwordDb)
}
