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
    console.log('Role from zustand:', role)

    const isValidToken = (token: string | null | undefined): boolean => !!token && token.trim() !== "";

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
        if (role === '' || role === undefined && isValidToken(token)) return;
        
        
        if (!isLoading) {
            console.log('Auth State Check:', {
                currentPath: pathname,
                userRole: role,
                hasValidToken: isValidToken(token)
            });
    
            if (typeof role === 'undefined') return;
            
    
            if (typeof pathname === 'undefined') return;
            
            const isTenantRoute = (path: string) => {
                return path === '/listing' || 
                       path === '/dashboard' || 
                       path.startsWith('/dashboard/') ||
                       path.startsWith('/listing/');
            };
    
            const isCustomerRoute = (path: string) => {
                return path === '/user' ||
                       path === '/user/profile' ||
                       path.startsWith('/user/');
            };
    
            const isPublicRoute = (path: string) => {
                return path === '/' || 
                       authRoutes.includes(path) || 
                       path === '/about' ||  
                       path === '/contact';
            };
    
            if (isPublicRoute(pathname) && !isValidToken(token)) {
                setIsAuthorized(true);
                return;
            }
    
            if (authRoutes.includes(pathname) && isValidToken(token)) {
                setErrorMessage('You are already logged in');
                router.push('/');
                return;
            }
    
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
    
            if (pathname.startsWith('/change-email') || pathname.startsWith('/verify-account')) {
                if (!isValidToken(token)) {
                    setErrorMessage('Invalid Token');
                    setIsAuthorized(false);
                    return;
                }
            }
    
            // If we get here, authorize access
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