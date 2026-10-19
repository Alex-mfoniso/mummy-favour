import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  MessageSquare, 
  Settings, 
  ArrowLeft, 
  Menu, 
  X, 
  ShieldCheck, 
  UserCircle2,
  ExternalLink,
  ChevronRight,
  LogOut,
  Loader2,
  Users,
  ShieldAlert,
  ShoppingBag
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/context/AuthContext';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { PageTransition } from '@/components/layout/PageTransition';

interface AdminNavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  exact?: boolean;
}

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Body scroll lock
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('[Admin Logout Error]', error);
      navigate('/admin/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isSuper = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPERADMIN';

  const navItems: AdminNavItem[] = [
    {
      label: 'Overview',
      path: '/admin',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      exact: true,
    },
    {
      label: 'Products',
      path: '/admin/products',
      icon: <Package className="w-4 h-4 shrink-0" />,
    },
    {
      label: 'Categories',
      path: '/admin/categories',
      icon: <Layers className="w-4 h-4 shrink-0" />,
    },
    {
      label: 'Enquiries',
      path: '/admin/enquiries',
      icon: <MessageSquare className="w-4 h-4 shrink-0" />,
    },
    {
      label: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingBag className="w-4 h-4 shrink-0" />,
    },
    ...(isSuper
      ? [
          {
            label: 'Staff Management',
            path: '/admin/users',
            icon: <Users className="w-4 h-4 shrink-0" />,
          },
          {
            label: 'Audit Logs',
            path: '/admin/audit-logs',
            icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
          },
        ]
      : []),
    {
      label: 'Business Settings',
      path: '/admin/business-settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  // Resolve current page label for breadcrumbs
  const getPageTitle = () => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      return 'Dashboard Overview';
    }
    if (location.pathname.startsWith('/admin/products')) {
      return 'Product Management';
    }
    if (location.pathname.startsWith('/admin/categories')) {
      return 'Category Management';
    }
    if (location.pathname.startsWith('/admin/enquiries')) {
      return 'Enquiry Management';
    }
    if (location.pathname.startsWith('/admin/orders')) {
      return 'Order Management';
    }
    if (location.pathname.startsWith('/admin/users')) {
      return 'Staff Management';
    }
    if (location.pathname.startsWith('/admin/audit-logs')) {
      return 'Security Audit Logs';
    }
    if (location.pathname.startsWith('/admin/business-settings')) {
      return 'Business Settings';
    }
    return 'Admin Console';
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F4EF] text-[#252A27]">
      {/* =========================================================================
          TOP BANNER: AUTHENTICATED SESSION STATUS
          ========================================================================= */}
      <div className="bg-[#252A27] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-[#3A403C]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8EC3A2]" aria-hidden="true" />
          <span className="font-semibold text-[#8EC3A2]">Authenticated Admin Session</span>
          <span className="text-[#88918C] hidden sm:inline">
            — Connected to Divine Favour PostgreSQL database & secure session store.
          </span>
        </div>
        <Link
          to="/"
          className="text-white/80 hover:text-white inline-flex items-center gap-1.5 text-xs font-semibold py-0.5 px-2 rounded hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>View Public Website</span>
        </Link>
      </div>

      <div className="flex-1 flex">
        {/* =========================================================================
            DESKTOP PERSISTENT SIDEBAR
            ========================================================================= */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-[#E6E4DD] flex-col justify-between shrink-0">
          <div className="p-6 space-y-6">
            <div>
              <Logo size="sm" withLink={false} />
              <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#88918C]">
                ADMINISTRATION WORKSPACE
              </div>
            </div>

            <nav aria-label="Admin Navigation" className="space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-md text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#EAF3ED] text-[#246B45]'
                        : 'text-[#5C635F] hover:bg-[#F5F4EF] hover:text-[#252A27]'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-6 border-t border-[#E6E4DD] space-y-3">
            <Link
              to="/"
              className="flex items-center justify-between px-3 py-2 rounded text-xs font-semibold text-[#5C635F] hover:bg-[#F5F4EF] hover:text-[#252A27] transition-colors"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Storefront</span>
              </span>
              <span className="text-[10px] text-[#88918C]">↗</span>
            </Link>

            {/* User card in sidebar */}
            <div className="p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#88918C]">Active User</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#246B45]/10 text-[#246B45]">
                  {user?.role || 'ADMIN'}
                </span>
              </div>
              <div className="text-xs font-bold text-[#252A27] truncate">
                {user?.name || 'Administrator'}
              </div>
              <div className="text-[11px] text-[#5C635F] truncate">
                {user?.email || 'admin@divinefavour.com'}
              </div>
            </div>
          </div>
        </aside>

        {/* =========================================================================
            MAIN CONTENT AREA WITH TOP NAVIGATION
            ========================================================================= */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <header className="bg-white border-b border-[#E6E4DD] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              {/* Mobile Drawer Toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-md text-[#252A27] hover:bg-[#F5F4EF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#246B45]"
                aria-label="Open admin navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumbs / Page Title */}
              <nav aria-label="Admin Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#5C635F]">
                <span className="text-[#88918C]">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#D8D5CB]" />
                <h1 className="font-bold text-[#252A27] text-sm sm:text-base leading-none">
                  {getPageTitle()}
                </h1>
              </nav>
            </div>

            {/* Authenticated User Account Menu & Logout */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#FAF9F6] border border-[#E6E4DD]">
                <UserCircle2 className="w-4 h-4 text-[#246B45]" />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-[#252A27]">
                    {user?.name || 'Administrator'}
                  </div>
                  <div className="text-[10px] text-[#88918C] -mt-0.5">
                    {user?.email || 'admin@divinefavour.com'}
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#246B45]/10 text-[#246B45]">
                  {user?.role || 'ADMIN'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                title="Sign out of administration session"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 hover:border-red-600 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <LogOut className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </header>

          {/* Page Content Outlet with animated transition */}
          <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
            <ScrollToTop />
            <PageTransition>
              <Outlet />
            </PageTransition>
          </main>
        </div>
      </div>

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER
          ========================================================================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Admin Navigation"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative w-72 bg-white flex flex-col justify-between p-6 z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Logo size="sm" withLink={false} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded text-[#5C635F] hover:text-[#252A27] hover:bg-[#F5F4EF]"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-[#88918C]">
                ADMINISTRATION WORKSPACE
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-3 rounded-md text-sm font-semibold transition-colors ${
                        isActive
                          ? 'bg-[#EAF3ED] text-[#246B45]'
                          : 'text-[#5C635F] hover:bg-[#F5F4EF] hover:text-[#252A27]'
                      }`
                    }
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-[#E6E4DD] space-y-3">
              <div className="p-3 bg-[#FAF9F6] border border-[#E6E4DD] rounded-lg">
                <div className="text-xs font-bold text-[#252A27] truncate">
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-[11px] text-[#5C635F] truncate">
                  {user?.email || 'admin@divinefavour.com'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <Link
                to="/"
                className="flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-semibold text-[#5C635F] hover:bg-[#F5F4EF]"
              >
                <span>Return to Public Website</span>
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
