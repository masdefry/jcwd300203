import Header from "../../common/header/dashboard/Header";
import SidebarMenu from "../../common/header/dashboard/SidebarMenu";
import MobileMenu from "../../common/header/MobileMenu";
import ChatBox from "./ChatBox";
import Image from "next/image";

const index = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-screen bg-gray-50">
        {/* Header */}
        <div className="px-4 py-6 bg-white border-b">
            <h2 className="text-2xl font-semibold mb-2">Message</h2>
            <p className="text-gray-600">We are glad to see you again!</p>
        </div>

        {/* Chat Container */}
        <div className="flex flex-1 overflow-hidden">
            {/* Contact List */}
            <div className="w-full md:w-80 bg-white border-r flex flex-col">
                {/* Search */}
                <div className="p-4 border-b">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full px-4 py-2 pr-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF385C]"
                        />
                        <button className="absolute right-3 top-1/2 -translate-y-1/2">
                            🔍
                        </button>
                    </div>
                </div>

                {/* Contact List */}
                <div className="flex-1 overflow-y-auto">
                    {/* Contact Item */}
                    <div className="p-4 border-b hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0">
                                <Image
                                    src="/57x57.png"
                                    alt="Contact"
                                    width={57} // Set the exact width
                                    height={57} // Set the exact height
                                    className="rounded-full"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium truncate">Vincent Porter</h3>
                                    <span className="text-xs text-gray-500">10:51</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">I&apos;m going to office.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area - Using ChatBox Component */}
            <div className="hidden md:flex flex-col flex-1">
                <ChatBox />
            </div>
        </div>
    </div>
  );
};

export default index;
