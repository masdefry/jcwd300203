'use client';
import { ReactNode, useEffect, useState } from "react";
import instance from "@/utils/axiosInstance";
import authStore from "@/zustand/authStore";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";

export default function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasTriggered, setHasTriggered] = useState(false);

    const setKeepAuth = authStore((state: any) => state.setKeepAuth);
    const authLogout = authStore((state: any) => state.setAuthLogout);
    const role = authStore((state: any) => state.role);
    const token = authStore((state: any) => state.token);

    const isValidToken = (token: string | null | undefined): boolean => !!token && token.trim() !== "";

    useEffect(() => {
        const fetchKeepAuth = async () => {
            try {
                const res = await instance.get('/auth');
                setKeepAuth({
                    name: res?.data?.data?.name,
                    role: res?.data?.data?.role,
                    email: res?.data?.data?.email,
                    profileImage: res?.data?.data?.profileImage,
                    isVerified: res?.data?.data?.verified
                });
            } catch (err) {
                console.log(err);
                authLogout();
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (isValidToken(token)) {
            fetchKeepAuth();
        } else {
            setIsLoading(false);
            setIsAuthorized(true);
        }
    }, [token, router, setKeepAuth, authLogout]);

    useEffect(() => {
        const authRoutes = ['/login/user', '/login/tenant', '/register/user', '/register/tenant', '/forget-password'];

        if (!isLoading) {
            if (authRoutes.includes(pathname) && isValidToken(token)) {
                setErrorMessage('You are already logged in');
                router.push('/');
                return;
            }

            if (pathname.startsWith('/dashboard') && role !== 'tenant') {
                setErrorMessage('Unauthorized access');
                setIsAuthorized(false);
                return;
            }

            if (pathname.startsWith('/user') && role !== 'customer') {
                setErrorMessage('Unauthorized access');
                setIsAuthorized(false);
                return;
            }

            if(pathname.startsWith('/change-email') && role === '' && !isValidToken(token)) {
                setErrorMessage('Invalid Token');
                setIsAuthorized(false);
                return;
            }

            if(pathname.startsWith('/verify-account') && role === '' && !isValidToken(token)) {
                setErrorMessage('Invalid Token');
                setIsAuthorized(false);
                return;
            }

            setIsAuthorized(true);
        }
    }, [isLoading, token, pathname, role, router]);

    useEffect(() => {
        if (!isAuthorized && !hasTriggered) {
            toast.error(errorMessage);
            setHasTriggered(true);
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }
    }, [isAuthorized, hasTriggered, router, errorMessage]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50">
                <div className="animate-fade-in transition-opacity duration-1000">
                    <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
                    <p className="mt-4 text-gray-600 text-lg animate-pulse">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized && errorMessage) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-gray-50 flex-col animate-fadeInOpacity duration-1000">
                <h1 className="text-2xl text-red-500 font-bold pb-5 animate-fadeInUp transition-all duration-1000">
                    Oopsie, something went wrong
                </h1>
                <div className="animate-fadeInOpacity transition-opacity duration-1000 pb-10">
                    <p className="text-red-500 text-lg text-center">{errorMessage} | 401</p>
                </div>
                <button className="bg-blue-500 rounded-lg p-3 text-white text-lg font-semibold transition-all transform hover:scale-105 hover:bg-blue-600 hover:shadow-lg duration-300 ease-in-out">
                    <a href="/">Back to Homepage</a>
                </button>
            </div>
        );
    }

    if (!isAuthorized) return null;

    return <>{children}</>;
}