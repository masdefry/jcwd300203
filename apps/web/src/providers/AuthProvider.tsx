'use client';
import { ReactNode, useEffect, useState } from "react";
import instance from "@/utils/axiosInstance";
import authStore from "@/zustand/authStore";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import LoadingWithSpinner from "@/components/Loading";

interface DecodedToken{
    data: {
      id: string;
      role: string;
      email: string;
    };
    exp: number;
    iat: number;
  }

export default function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [hasTriggered, setHasTriggered] = useState(false);

    const setKeepAuth = authStore((state: any) => state.setKeepAuth);
    const authLogout = authStore((state: any) => state.setAuthLogout);
    const token = localStorage?.getItem('authToken');

    const getRole = (token: string): string => {
        try {
            const decoded = jwtDecode<DecodedToken>(token);
            return decoded.data.role;
        } catch (error) {
            console.error('Error decoding token for role:', error);
            return '';
        }
    }

    const role = getRole(token!);
        
    const isValidToken = (token: string | null | undefined): boolean => {
        if (!token || token.trim() === "") return false;
        try {
            const decoded = jwtDecode<{ exp: number }>(token); 
            const currentTime = Math.floor(Date.now() / 1000); 
            return decoded.exp > currentTime;
        } catch (error) {
            return false; 
        }
    };

    useEffect(() => {
        console.log('Current role:', role);
        console.log('Current pathname:', pathname);
        console.log('Is token valid:', isValidToken(token));
    }, [role, pathname, token]);

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
                console.log('Role from keepauth: ', res?.data?.data?.role)
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

        if (isLoading) return; // Wait until loading is complete

        if(!isLoading){
            const isPublicRoute = (path: string) => {
                return path === '/' || path === '/about' || path === '/contact';
            };
    
            const isTenantRoute = (path: string) => {
                return ['/listing', '/dashboard', '/dashboard/', '/listing/'].some(route => path.startsWith(route));
            };
    
            const isCustomerRoute = (path: string) => {
                return ['/user', '/user/profile', '/user/'].some(route => path.startsWith(route));
            };
    
            // Allow access to public routes without authentication
            if (isPublicRoute(pathname)) {
                setIsAuthorized(true);
                return;
            }
    
            // If the user is logged in and tries to access auth routes, redirect them
            if (authRoutes.includes(pathname) && isValidToken(token)) {
                setErrorMessage('You are already logged in');
                setIsAuthorized(false)
                router.push('/');
                return;
            }
    
            // Check for tenant routes
            if (isTenantRoute(pathname)) {
                if (!isValidToken(token)) {
                    setErrorMessage('Please login first');
                    setIsAuthorized(false);
                    return;
                }
                if (role !== 'tenant') {
                    setErrorMessage('Unauthorized access - Tenant only');
                    setIsAuthorized(false);
                    return;
                }
            }
    
            // Check for customer routes
            if (isCustomerRoute(pathname)) {
                if (!isValidToken(token)) {
                    setErrorMessage('Please login first');
                    setIsAuthorized(false);
                    return;
                }
                if (role !== 'customer') {
                    setErrorMessage('Unauthorized access - Customer only');
                    setIsAuthorized(false);
                    return;
                }
            }
    
            // Handle specific routes that require a valid token
            if (pathname.startsWith('/change-email') || pathname.startsWith('/verify-account')) {
                if (!isValidToken(token)) {
                    setErrorMessage('Invalid Token');
                    setIsAuthorized(false);
                    return;
                }
            }
    
            // If all checks pass, set authorized to true
            setIsAuthorized(true);
            setErrorMessage(null);
        }
        
    }, [isLoading, token, pathname, role]);



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
            <LoadingWithSpinner/>
        );
    }

    if (!isAuthorized) {
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