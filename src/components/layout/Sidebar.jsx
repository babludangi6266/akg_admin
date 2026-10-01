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
  RiPulseLine,
  RiDatabase2Line,
  RiExternalLinkLine,
  RiFolderShield2Line,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    title: 'CORE CRM & PIPELINE',
    items: [
      { path: '/', label: 'Executive Dashboard', icon: RiDashboard3Line, badge: null },
      { path: '/leads', label: 'Leads & Inquiries', icon: RiFileList3Line, badge: 'Live' },
      { path: '/partners', label: 'Channel Partners', icon: RiUserStarLine, badge: null },
    ],
  },
  {
    title: 'INVENTORY ERP',
    items: [
      { path: '/properties', label: 'Property Catalog', icon: RiBuilding4Line, badge: null },
    ],
  },
  {
    title: 'OPERATIONS & SYSTEM',
    items: [
      { path: '/settings', label: 'Settings & Security', icon: RiUserSettingsLine, badge: null },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuth();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border select-none shadow-xs">
      {/* Brand Header */}
      <div className="p-5 border-b border-border flex items-center justify-between bg-bg/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy text-gold flex items-center justify-center font-display font-black text-xl shadow-md border border-gold/40">
            Z
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-display font-black text-sm text-navy tracking-tight">
                ZAMIN <span className="text-gold">JUNCTION</span>
              </h1>
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-text-muted mt-0.5">
              ENTERPRISE CRM / ERP
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

      {/* Navigation Groups */}
      <div className="flex-1 px-3.5 py-5 space-y-6 overflow-y-auto">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx} className="space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-wider text-text-muted">
              {group.title}
            </p>
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-navy text-gold shadow-sm border border-gold/30'
                        : 'text-text-secondary hover:text-navy hover:bg-bg'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="text-base shrink-0 group-hover:scale-105 transition-transform" />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-gold/15 text-gold border border-gold/40 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}

        {/* Live Public Site Shortcut */}
        <div className="pt-2">
          <p className="px-3 text-[10px] font-black uppercase tracking-wider text-text-muted mb-1">
            PUBLIC PORTAL
          </p>
          <a
            href="https://zaminjunction.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-display text-xs font-bold text-text-secondary hover:text-navy hover:bg-bg transition-all"
          >
            <div className="flex items-center gap-3">
              <RiHome4Line className="text-base text-gold" />
              <span>Live Website</span>
            </div>
            <RiExternalLinkLine className="text-sm text-text-muted" />
          </a>
        </div>
      </div>

      {/* Cluster Health & Security Status */}
      <div className="p-3.5 border-t border-border bg-bg/50 space-y-3">
        {/* System Pulse Indicator */}
        <div className="p-2.5 rounded-xl bg-surface border border-border flex items-center justify-between text-2xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-text-secondary">MongoDB Cluster</span>
          </div>
          <span className="text-emerald-700 font-extrabold text-[10px] uppercase">Active</span>
        </div>

        {/* Admin Session Card */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-border shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold font-bold flex items-center justify-center text-xs shrink-0 border border-gold/30">
              {admin?.name ? admin.name.charAt(0) : 'A'}
            </div>
            <div className="truncate">
              <p className="font-display font-bold text-xs text-navy truncate">
                {admin?.name || 'Administrator'}
              </p>
              <p className="text-[10px] text-text-muted truncate flex items-center gap-1 font-semibold">
                <RiShieldCheckLine className="text-gold text-xs" /> {admin?.role || 'Super Admin'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out of CRM"
            className="p-1.5 text-text-muted hover:text-danger hover:bg-danger-light rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <RiLogoutBoxRLine className="text-base" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
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
