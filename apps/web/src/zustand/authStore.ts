import { create } from'zustand';
import { persist } from 'zustand/middleware';

const authStore = create(persist((set) => ({
    token:'',
    name: '',
    email: '',
    role: '',
    profileImage: '',
    isVerified: null,
    totalPoint: null,
}),
{
    name: 'authToken',
    partialize: (state: any) => ({token: state.token})
}

))

export default authStore;