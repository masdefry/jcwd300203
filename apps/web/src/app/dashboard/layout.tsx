'use client';

import { ReactNode } from "react";
import { usePathname } from 'next/navigation';
import Footer from "@/components/common/footer/Footer";
import CopyrightFooter from "@/components/common/footer/CopyrightFooter";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const isPropertyDetailsPage = pathname?.match(/^\/dashboard\/properties\/\d+$/);

    if (isPropertyDetailsPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-30">
                <nav className="container mx-auto flex items-center justify-between h-16 px-6">
                    <div className="text-lg font-semibold">
                        RentUp Dashboard
                    </div>
                    <div>
                        <ul className="flex space-x-6 text-gray-700">
                            <li>
                                <a href="/dashboard" className="hover:text-blue-500">Dashboard</a>
                            </li>
                            <li>
                                <a href="/orders" className="hover:text-blue-500">Orders</a>
                            </li>
                            <li>
                                <a href="/properties" className="hover:text-blue-500">Properties</a>
                            </li>
                            <li>
                                <a href="/messages" className="hover:text-blue-500">Messages</a>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="pt-20 container mx-auto px-6">
                {children}
            </main>

            {/* Footer sections */}
            <section className="footer_one">
                <div className="container">
                    <div className="row">
                        <Footer />
                    </div>
                </div>
            </section>
            
            {/* Copyright footer */}
            <section className="footer_middle_area pt40 pb40">
                <div className="container">
                    <CopyrightFooter />
                </div>
            </section>
        </div>
    );
}
