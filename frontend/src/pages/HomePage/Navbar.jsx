import { Search, Menu, LogOut } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-200 flex items-center justify-between px-6 py-3 border-b border-gray-300">
      {/* Left section: Logo and Menu button */}
      <div className="flex items-center gap-4">
        <div className="bg-white rounded-md p-2 shadow-sm">
          <div className="font-bold text-xl text-gray-900">B</div>
        </div>
        
        <button className="flex items-center gap-2 bg-white px-3 py-2 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <Menu size={18} className="text-gray-700" />
          <span className="text-sm text-gray-700">Hinted search text</span>
        </button>
      </div>
      {/* Center section: Search bar */}
      <div className="flex-1 max-w-lg mx-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Hinted search text"
            className="w-full bg-white rounded-full px-4 py-2 pr-10 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2">
            <Search size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Right section: User button and logout */}
      <div className="flex items-center gap-3">
        <button className="bg-gray-800 text-white px-5 py-2 rounded-md text-sm font-medium shadow-sm hover:bg-gray-900 transition-colors">
          User name example
        </button>
        <button className="bg-white p-2 rounded-md shadow-sm hover:shadow-md transition-shadow">
          <LogOut size={18} className="text-gray-700" />
        </button>
      </div>
    </nav>
  );
}