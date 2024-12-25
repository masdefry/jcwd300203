import axios from 'axios';
import authStore from '@/zustand/authStore';
import { toast } from 'react-toastify';
import jwt from 'jsonwebtoken';
const instance = axios.create({
    baseURL: 'http://localhost:4700/api',
    withCredentials: true
})

const getTokenExpiry = (token: string) => {
    const decodedToken: any = jwt.decode(token)
    return decodedToken!.exp * 1000;
}

const isTokenExpiring = (token: string) => {
    const expiryTime = getTokenExpiry(token);
    const currentTime = Date.now();
    const remainingTime = expiryTime - currentTime;
    return remainingTime <= 3 * 60 * 1000;
}
instance.interceptors.request.use(
    async request => {
        const token = authStore.getState().token
        if(token){
            if (isTokenExpiring(token)) {
                try {
                    const response = await axios.post(
                        'http://localhost:4700/api/auth/refresh-token', 
                        null, 
                        { withCredentials: true }
                    );
                    
                    const newAccessToken = response.data.data.token;
                    console.log('New access token:', newAccessToken);

                    authStore.getState().setAuth({
                        token: newAccessToken,
                        name: authStore.getState().name,
                        role: authStore.getState().role,
                        email: authStore.getState().email,
                        profileImage: authStore.getState().profileImage,
                        username: authStore.getState().username,
                        isVerified: authStore.getState().isVerified,
                    });
                    request.headers['Authorization'] = `Bearer ${newAccessToken}`;
                } catch (error) {
                    console.error('Failed to refresh token:', error);
                    toast.error('Session expired, please log in again.');
                    localStorage.removeItem('authToken');
                    authStore.getState().setAuthLogout();
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2500);
                    return Promise.reject(error);
                }
            } else {
                request.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return request

    },
    error => {
        console.log(error)
    }
)

const handleLogout = () => {
    localStorage.removeItem('authToken')
}

const setAuthLogout = authStore.getState().setAuthLogout
const token = authStore.getState().token; 

instance.interceptors.response.use(
    async (response) => {
        return response
    },
    
    async (error) => {
        const originalRequest = error.config;
        if(error?.response?.data?.message === 'jwt expired'){
            try {
            const response = await axios.post('http://localhost:4700/api/auth/refresh-token', null, {withCredentials: true})
            console.log('Refreshed token response:', response.data);
            const newAccessToken = response.data.data.token;
            console.log('New access token:', newAccessToken);
            authStore.getState().setToken(newAccessToken);
            console.log('Updated Zustand token:', authStore.getState().token);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return instance(originalRequest);
            } catch (error) {
                setAuthLogout()
                handleLogout()
                toast.error("Session expired")
                setTimeout(() => {
                window.location.href = '/' 
                },2500)
            }
        }

        return Promise.reject(error)
    }
)


export default instance;