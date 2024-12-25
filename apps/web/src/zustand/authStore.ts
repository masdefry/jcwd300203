import { create } from'zustand';
import { persist } from 'zustand/middleware';

const authStore = create(persist((set) => ({
    token:'',
    name: '',
    email: '',
    username: '',
    role: '',
    profileImage: '',
    isVerified: null,

    setAuth: ({ token, name, role, email, profileImage, username, isVerified }: any) => set({ token, name, role, email, profileImage, username, isVerified }),
    setKeepAuth: ({ name, role, email, profileImage, username, isVerified }: any) => set({ name, role, email, profileImage, username, isVerified }),
    setAuthLogout: () => set({name: '', role: '', token: '', email:'', profileImage: '',username: ''})
}),
{
    name: 'authToken',
    partialize: (state: any) => ({token: state.token})
}
))

export default authStore;