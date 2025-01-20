'use client';

import SidebarMenu from "@/components/common/header/dashboard/SidebarMenu";
import { ReactNode } from "react";
import { usePathname } from 'next/navigation';

export default function DashboardLayout({children}: {children: ReactNode}) {
    const pathname = usePathname();
    const isPropertyDetailsPage = pathname?.match(/^\/dashboard\/properties\/\d+$/);

    if (isPropertyDetailsPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen">
            {/* Top Navbar - visible only on mobile */}
            <div className="lg:hidden h-16 fixed top-0 left-0 right-0 bg-white z-30 border-b">
                {/* Your mobile navbar content */}
            </div>

            <div className="flex pt-16 lg:pt-0"> {/* Add padding top for mobile navbar */}
                {/* Sidebar - hidden on mobile */}
                <aside className="hidden lg:block lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 bg-[#29303D] text-white lg:overflow-y-auto">
                    <SidebarMenu />
                </aside>

                {/* Main content */}
                <main className="flex-1 lg:ml-64 bg-gray-50 min-h-screen">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}