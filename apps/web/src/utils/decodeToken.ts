import jwt from 'jsonwebtoken';

export const isTokenValid = (token: string | null | undefined): boolean => {
  try {
    if (!token) return false;

    const decoded = jwt.decode(token) as { exp?: number };
    
    if (!decoded || typeof decoded !== 'object') return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp ? decoded.exp > currentTime : false;
    
  } catch (error) {
    return false;
  }
};