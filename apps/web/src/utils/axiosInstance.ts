import axios from 'axios';
import authStore from '@/zustand/authStore';
import { toast } from 'react-toastify';

const instance = axios.create({
    baseURL: 'http://localhost:4700/api'
})

instance.interceptors.request.use(
    async request => {
        const token = authStore.getState().token
        if(token){
            request.headers['Authorization'] = `Bearer ${token}`
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

instance.interceptors.response.use(
    async response => {
        return response
    },
    
    error => {
        if(error?.response?.data?.message === 'jwt expired' ){
            const setAuthLogout = authStore.getState().setAuthLogout
            setAuthLogout()
            handleLogout()
            toast.error("Session expired",{
                position: "top-right"
            })
            setTimeout(() => {
            window.location.href = '/' 
            },1000)
        }

        return Promise.reject(error)
    }
)


export default instance;