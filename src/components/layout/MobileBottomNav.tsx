import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Package, FileText, Search, Menu } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const handleToggleMenu = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-menu'));
  };

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E6E4DD] shadow-[0_-2px_12px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
        {/* Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#246B45]' : 'text-[#5C635F] hover:text-[#252A27]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 stroke-[2] ${isActive ? 'text-[#246B45]' : 'text-[#5C635F]'}`} />
              <span>Home</span>
            </>
          )}
        </NavLink>

        {/* Products */}
        <NavLink
          to="/products"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#246B45]' : 'text-[#5C635F] hover:text-[#252A27]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Package className={`w-5 h-5 stroke-[2] ${isActive ? 'text-[#246B45]' : 'text-[#5C635F]'}`} />
              <span>Products</span>
            </>
          )}
        </NavLink>

        {/* Request Quote - Highlighted Action */}
        <NavLink
          to="/request-quote"
          className="flex flex-col items-center justify-center -mt-3.5 text-[10px] font-bold transition-transform active:scale-95"
          aria-label="Request a Quote"
        >
          <div className="w-12 h-12 rounded-full bg-[#246B45] text-white flex items-center justify-center shadow-md border-2 border-white hover:bg-[#1D5838] transition-colors">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[#246B45] mt-1 font-bold">Quote</span>
        </NavLink>

        {/* Track Enquiry */}
        <NavLink
          to="/track-enquiry"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
              isActive ? 'text-[#246B45]' : 'text-[#5C635F] hover:text-[#252A27]'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Search className={`w-5 h-5 stroke-[2] ${isActive ? 'text-[#246B45]' : 'text-[#5C635F]'}`} />
              <span>Track</span>
            </>
          )}
        </NavLink>

        {/* Full Menu Toggle */}
        <button
          type="button"
          onClick={handleToggleMenu}
          className="flex flex-col items-center justify-center gap-1 py-1 text-[11px] font-semibold text-[#5C635F] hover:text-[#252A27] focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5 stroke-[2]" />
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
};
