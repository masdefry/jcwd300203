'use client'

import Link from "next/link";
import { isSinglePageActive } from "../../../../utils/daynamicNavigation";
import Image from "next/image";
import { usePathname } from "next/navigation";

const SidebarMenu = () => {
  const pathname = usePathname();

  return (
    <div className="h-full">
      {/* Logo Header */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-700">
        <Link href="/" className="flex items-center gap-2">
          <Image
            width={40}
            height={45}
            src="/assets/images/header-logo2.png"
            alt="RentUp"
          />
          <span className="text-xl font-semibold">RentUp</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6 px-4">
        <p className="text-gray-400 text-sm uppercase font-medium mb-4">Main</p>
        
        <ul className="space-y-2">
          <li>
            <Link 
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isSinglePageActive("/dashboard", pathname) 
                  ? "bg-[#FF385C] text-white" 
                  : "text-gray-300 hover:bg-gray-700"}`}
            >
              <i className="flaticon-layers" />
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link 
              href="/dashboard/orders"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isSinglePageActive("/dashboard/orders", pathname) 
                  ? "bg-[#FF385C] text-white" 
                  : "text-gray-300 hover:bg-gray-700"}`}
            >
              <i className="flaticon-box" />
              <span>My Orders</span>
            </Link>
          </li>

          <li>
            <Link 
              href="/dashboard/listing"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isSinglePageActive("/dashboard/listing", pathname) 
                  ? "bg-[#FF385C] text-white" 
                  : "text-gray-300 hover:bg-gray-700"}`}
            >
              <i className="flaticon-plus" />
              <span>Create Listing</span>
            </Link>
          </li>

          <li>
            <Link 
              href="/dashboard/messages"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                ${isSinglePageActive("/dashboard/messages", pathname) 
                  ? "bg-[#FF385C] text-white" 
                  : "text-gray-300 hover:bg-gray-700"}`}
            >
              <i className="flaticon-envelope" />
              <span>Messages</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SidebarMenu;