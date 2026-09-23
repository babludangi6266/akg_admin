import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiDashboard3Line,
  RiBuilding4Line,
  RiFileList3Line,
  RiUserSettingsLine,
  RiUserStarLine,
  RiCloseLine,
  RiLogoutBoxRLine,
  RiShieldCheckLine,
  RiHome4Line,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: <RiDashboard3Line className="text-xl" /> },
  { path: '/leads', label: 'Real Estate Leads', icon: <RiFileList3Line className="text-xl" /> },
  { path: '/properties', label: 'Properties Catalog', icon: <RiBuilding4Line className="text-xl" /> },
  { path: '/partners', label: 'Channel Partners', icon: <RiUserStarLine className="text-xl" /> },
  { path: '/settings', label: 'Admin Settings', icon: <RiUserSettingsLine className="text-xl" /> },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border shadow-sm select-none">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy text-gold flex items-center justify-center font-display font-extrabold text-xl shadow-md border border-gold/30">
            A
          </div>
          <div>
            <h1 className="font-display font-extrabold text-lg text-navy leading-tight tracking-tight">
              ZAMIN <span className="text-gold">JUNCTION</span>
            </h1>
            <p className="text-2xs text-text-secondary font-semibold uppercase tracking-widest">
              Control Panel
            </p>
          </div>
        </div>

        {/* Close button on mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-text-secondary hover:text-navy hover:bg-bg transition-colors"
        >
          <RiCloseLine className="text-2xl" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-2xs font-bold text-text-muted uppercase tracking-wider">
          Main Navigation
        </div>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl font-display text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-navy text-gold shadow-md border border-gold/20'
                  : 'text-text-secondary hover:text-navy hover:bg-bg-alt'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}

        <div className="pt-6 px-3 pb-2 text-2xs font-bold text-text-muted uppercase tracking-wider">
          Quick Links
        </div>
        <a
          href="http://localhost:5174/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-display text-sm font-semibold text-text-secondary hover:text-navy hover:bg-bg-alt transition-all duration-200"
        >
          <RiHome4Line className="text-xl" />
          <span>View Live Website</span>
        </a>
      </div>

      {/* Admin User Footer Card */}
      <div className="p-4 border-t border-border bg-bg/50">
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border/80 shadow-xs">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gold/15 text-gold font-bold flex items-center justify-center text-sm shrink-0 border border-gold/30">
              {admin?.name ? admin.name.charAt(0) : 'A'}
            </div>
            <div className="truncate">
              <p className="font-display font-bold text-xs text-navy truncate">
                {admin?.name || 'Super Admin'}
              </p>
              <p className="text-2xs text-text-secondary truncate flex items-center gap-1">
                <RiShieldCheckLine className="text-gold" /> {admin?.role || 'Administrator'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            className="p-2 text-text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RiLogoutBoxRLine className="text-lg" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-navy/60 backdrop-blur-xs z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
