import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, User, Settings, Home, X, Menu, ChevronRight, ClipboardList, MessageSquare, PlusCircle, MapPin, Inbox } from 'lucide-react';
import authStore from '@/zustand/authStore';
import jwt from 'jsonwebtoken';
import { AvatarWithFallback } from '@/components/profile/AvatarWithFallback';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { role, token, name, email, profileImage, setAuthLogout } = authStore();
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [decodedToken, setDecodedToken] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 95);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwt.decode(token);
        if (decoded && typeof decoded === 'object') {
          setDecodedToken(decoded);
          const currentTime = Date.now() / 1000;
          setIsTokenValid(decoded.exp ? decoded.exp > currentTime : false);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsTokenValid(false);
      }
    } else {
      setIsTokenValid(false);
    }
  }, [token]);

  const handleLogout = () => {
    setAuthLogout();
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  const NavigationItems = ({ isMobile = false }: { isMobile?: boolean }) => {
    const baseClasses = isMobile
      ? "block w-full px-4 py-2 text-base text-gray-700 hover:bg-gray-50 transition-colors"
      : "px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#e54949] transition-colors";

    if (!isTokenValid || !role) {
      // If token is invalid or role is not defined, do not display any navigation items.
      return null;
    }

    return (
      <>
        {/* Dashboard Route */}
        <Link
          href={role === 'tenant' ? '/dashboard' : '/user/dashboard'}
          className={baseClasses}
        >
          My Dashboard
        </Link>

        {/* Review Route - Only accessible if not a tenant */}
        {role !== "tenant" && (
          <Link href="/user/review" className={baseClasses}>
            Review
          </Link>
        )} 

        {/* Tenant-Protected Routes */}
        {role === 'tenant' && (
          <>
            {/* My Orders */}
            <Link href="/dashboard/orders" className={baseClasses}>
              Orders
            </Link>

            {/* My Messages */}
            {/* <Link href="/dashboard/messages" className={baseClasses}>
              Messages
            </Link> */}

            {/* Create Listing */}
            <Link href="/dashboard/calendar" className={baseClasses}>
              Calendar 
            </Link>

            {/* Properties - Accessible to all roles */}
            <Link href="/properties" className={baseClasses}>
              Properties
            </Link>
          </>
        )}
      </>
    );
  };

  const ProfileDropdown = ({ isMobile = false }) => {
    const dropdownTrigger = (
      <div className="scale-[0.5]">
        <AvatarWithFallback
          src={profileImage}
          name={name || 'User'}
        />
      </div>
    );

    if (isMobile) {
      return dropdownTrigger;
    }

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="outline-none">
          {dropdownTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{name}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Profile Link - Conditional Redirect */}
          <DropdownMenuItem
            onClick={() =>
              window.location.href = role === 'tenant' ? '/dashboard/profile' : '/user/profile'
            }
          >
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
          </DropdownMenuItem>

          {/* My Dashboard - Conditional Redirect
          <DropdownMenuItem
            onClick={() =>
              window.location.href = role === 'tenant' ? '/dashboard' : '/user/dashboard'
            }
          >
            <Home className="mr-2 h-4 w-4" />
            <span>My Dashboard</span>
          </DropdownMenuItem> */}

          {/* my messages */}
          {role === 'tenant' && (
            <DropdownMenuItem
              onClick={() => (window.location.href = '/dashboard/messages')}
            >
              <Inbox className="mr-2 h-4 w-4" />
              <span>My Messages</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Logout Link - Accessible to All Roles */}
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const MobileMenu = () => (
    <div 
      className={`fixed inset-0 bg-white transform transition-transform duration-300 ease-in-out z-50 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link href="/" className="flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <Image
              src="/assets/images/header-logo2.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-8 w-auto"
            />
            <span className="ml-2 text-xl font-bold text-gray-900">RentUp</span>
          </Link>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {isTokenValid && role ? (
              <div className="px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <div className="scale-[0.6]">
                    <AvatarWithFallback
                      src={profileImage}
                      name={name || 'User'}
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="text-sm text-gray-500">{email}</p>
                  </div>
                </div>
              </div>
            ) : null}
            
            <nav className="px-4 py-2">
              {/* Profile Link */}
              <Link
                href={role === 'tenant' ? '/dashboard/profile' : '/user/profile'}
                className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span
                  className={`text-lg ${
                    location.pathname === (role === 'tenant' ? '/dashboard/profile' : '/user/profile') ? 'text-[#f15b5b]' : ''
                  }`}
                >
                  My Profile
                </span>
              </Link>
              
              {/* My Dashboard Link */}
              <Link 
                href={role === 'tenant' ? '/dashboard' : '/user/dashboard'}
                className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={`text-lg ${location.pathname === (role === 'tenant' ? '/dashboard' : '/user/dashboard') ? 'text-[#f15b5b]' : ''}`}>
                  {role === 'tenant' ? 'My Dashboard' : 'My Bookings'}
                </span>
              </Link>

              {/* My Orders Link */}
              <Link 
                href={role === 'tenant' ? '/dashboard/orders' : '/user/dashboard'}
                className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={`text-lg ${location.pathname === (role === 'tenant' ? '/dashboard/orders' : '/user/dashboard') ? 'text-[#f15b5b]' : ''}`}>
                  {role === 'tenant' ? 'My Orders' : 'My Bookings'}
                </span>
              </Link>

              {/* My Messages Link */}
              {/* <Link
                href={role === "tenant" ? "/dashboard/messages" : "/user/messages"}
                className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span
                  className={`text-lg ${
                    location.pathname === (role === "tenant" ? "/dashboard/messages" : "/user/messages")
                      ? "text-[#f15b5b]"
                      : ""
                  }`}
                >
                  My Messages
                </span>
              </Link> */}

              {/* My Reviews Link */}
              {role !== "tenant" && (
                <Link
                  href="/user/review"
                  className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span
                    className={`text-lg ${
                      location.pathname === "/user/reviews" ? "text-[#f15b5b]" : ""
                    }`}
                  >
                    My Reviews
                  </span>
                </Link>
              )}
                            
              {/* Create Listing Link */}
              {role === "tenant" && (
                <Link
                  href="/dashboard/listing"
                  className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span
                    className={`text-lg ${
                      location.pathname === '/dashboard/listing' ? 'text-[#f15b5b]' : ''
                    }`}
                  >
                    Create Listing
                  </span>
                </Link>
              )}

              {/* Properties Link */}
              <Link 
                href="/properties"
                className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={`text-lg ${location.pathname === '/properties' ? 'text-[#f15b5b]' : ''}`}>Properties</span>
              </Link>
              {/* {role === 'tenant' && (
                <Link 
                  href="/dashboard"
                  className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className={`text-lg ${location.pathname === '/dashboard' ? 'text-[#f15b5b]' : ''}`}>Dashboard</span>
                </Link>
              )}
              <div className="flex items-center justify-between py-3 hover:text-[#f15b5b] cursor-pointer">
                <span className="text-lg">Blog</span>
                <ChevronRight className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between py-3 hover:text-[#f15b5b] cursor-pointer">
                <span className="text-lg">Pages</span>
                <ChevronRight className="h-5 w-5" />
              </div>
              <Link 
                href="/contact"
                className="flex items-center justify-between py-3 hover:text-[#f15b5b]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className={`text-lg ${location.pathname === '/contact' ? 'text-[#f15b5b]' : ''}`}>Contact</span>
              </Link> */}
            </nav>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4">
          {isTokenValid && role ? (
            <button
              onClick={handleLogout}
              className="w-full py-3 text-white bg-[#f15b5b] rounded-full hover:bg-[#e54949] transition-colors"
            >
              Log Out
            </button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Link
                  href="/login/user"
                  className="flex-1 py-3 text-center border border-[#f15b5b] text-[#f15b5b] rounded-full hover:bg-[#f15b5b] hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register/user"
                  className="flex-1 py-3 text-center border border-[#f15b5b] text-[#f15b5b] rounded-full hover:bg-[#f15b5b] hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
              <Link
                href="/login/tenant"
                className="block w-full py-3 text-center text-white bg-[#f15b5b] rounded-full hover:bg-[#e54949] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Create Listing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* This spacer div prevents content from going under the fixed navbar */}
      <div className={`h-16 ${isScrolled ? 'mb-16' : ''}`} />
      
      {/* Main Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo Section */}
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/images/header-logo2.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-bold text-gray-900">RentUp</span>
            </Link>
  
            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              <NavigationItems />
              {isTokenValid && role ? (
                <div className="flex items-center ml-4">
                  {role === 'tenant' && (
                    <Link
                      href="/dashboard/listing"
                      className="px-6 py-2 text-sm font-medium text-white bg-[#f15b5b] rounded-full hover:bg-[#e54949] transition-colors mr-4"
                    >
                      Add Property
                    </Link>
                  )}
                  <ProfileDropdown />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link 
                    href="/register/user" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#e54949] transition-colors"
                  >
                    Register
                  </Link>
                  <Link 
                    href="/login/user" 
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#e54949] transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/login/tenant"
                    className="px-6 py-2 text-sm font-medium text-white bg-[#f15b5b] rounded-full hover:bg-[#e54949] transition-colors"
                  >
                    List Your Property
                  </Link>
                </div>
              )}
            </div>
  
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-full"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>
      </nav>
  
      {/* Mobile Menu */}
      <MobileMenu />
    </>
  );
};

export default Navbar;