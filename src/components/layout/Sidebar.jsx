import { useState, useEffect } from 'react';
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
  RiMapPinLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiMenuFoldLine,
  RiMenuUnfoldLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { leadAPI } from '../../services/api';

const NAVIGATION_SECTIONS = [
  {
    id: 'crm',
    title: 'ACQUISITION & CRM',
    description: 'Lead pipeline, deals & channel network',
    items: [
      {
        path: '/',
        label: 'Executive Overview',
        icon: RiDashboard3Line,
        badge: null,
        description: 'High-level KPI metrics & real-time analytics',
      },
      {
        path: '/leads',
        label: 'Inquiries & Leads',
        icon: RiFileList3Line,
        badge: 'Live',
        isLeadItem: true,
        description: 'Indore buyer mandates & contact requests',
      },
      {
        path: '/partners',
        label: 'Channel Partners',
        icon: RiUserStarLine,
        badge: null,
        description: 'Registered broker network & verification',
      },
    ],
  },
  {
    id: 'inventory',
    title: 'PORTFOLIO & ASSETS',
    description: 'Inventory management & territory mapping',
    items: [
      {
        path: '/properties',
        label: 'Property Catalog',
        icon: RiBuilding4Line,
        badge: null,
        description: 'Plots, luxury villas, towers & commercial units',
      },
      {
        path: '/areas',
        label: 'Operating Localities',
        icon: RiMapPinLine,
        badge: null,
        description: 'Corridor geofences, pin codes & master areas',
      },
    ],
  },
  {
    id: 'governance',
    title: 'SYSTEM & GOVERNANCE',
    description: 'Administration & public touchpoints',
    items: [
      {
        path: '/settings',
        label: 'Security & Settings',
        icon: RiUserSettingsLine,
        badge: 'Admin',
        roleRequired: 'admin',
        description: 'RBAC controls, audit logs & system preferences',
      },
    ],
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { logout, admin } = useAuth();

  // Desktop Compact (Icon-Only) Mode Toggle - Persisted in localStorage
  const [isCompact, setIsCompact] = useState(() => {
    try {
      return localStorage.getItem('zj_admin_sidebar_compact') === 'true';
    } catch {
      return false;
    }
  });

  // Collapsible Accordion Navigation Groups - Persisted in localStorage
  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const saved = localStorage.getItem('zj_admin_sidebar_collapsed_groups');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Dynamic live lead count indicator
  const [liveLeadCount, setLiveLeadCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLeadStats = async () => {
      try {
        const res = await leadAPI.getLeads({ limit: 1 });
        const count = res?.total || res?.data?.total || res?.count;
        if (isMounted && typeof count === 'number') {
          setLiveLeadCount(count);
        }
      } catch {
        // Silently retain fallback badge
      }
    };

    fetchLeadStats();
    const timer = setInterval(fetchLeadStats, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const toggleCompact = () => {
    setIsCompact((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zj_admin_sidebar_compact', String(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const toggleSection = (sectionId) => {
    setCollapsedSections((prev) => {
      const updated = { ...prev, [sectionId]: !prev[sectionId] };
      try {
        localStorage.setItem('zj_admin_sidebar_collapsed_groups', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Content for the Sidebar (shared between desktop fixed aside and mobile drawer)
  const renderSidebarContent = (inDrawer = false) => {
    const compactMode = !inDrawer && isCompact;

    return (
      <div className="flex flex-col h-full neu-surface text-slate-800 select-none overflow-hidden border-r border-white/80 shadow-[6px_0_20px_rgba(166,180,200,0.25)]">
        {/* ── 1. Top Neumorphic Brand Plate ── */}
        <div className="relative p-3.5 sm:p-4 border-b border-border/40 neu-surface-soft shrink-0 shadow-[0_4px_14px_rgba(166,180,200,0.18)]">
          {/* Subtle top rim highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {compactMode ? (
            /* ── Compact View: Stacked Medallion & Prominent Expand Button ── */
            <div className="flex flex-col items-center gap-2.5 w-full py-0.5">
              {/* Luxury Gold Medallion */}
              <div className="relative group shrink-0">
                <div className="w-11 h-11 rounded-2xl neu-btn-gold flex items-center justify-center font-display font-black text-xl text-navy shadow-md transition-transform duration-200 group-hover:scale-105 border border-white/60">
                  <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Z</span>
                </div>
                {/* Online Diode */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse shadow-xs" />
              </div>

              {/* Prominent Expand Button */}
              <button
                type="button"
                onClick={toggleCompact}
                title="Expand Sidebar (Full View)"
                className="w-10 h-10 rounded-xl neu-btn text-navy hover:text-gold flex items-center justify-center transition-all cursor-pointer shadow-xs group"
              >
                <RiMenuUnfoldLine className="text-xl group-hover:scale-115 transition-transform" />
              </button>
            </div>
          ) : (
            /* ── Expanded View: Premium Brand Header + Collapse Button ── */
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* 3D Gold Medallion */}
                <div className="relative group shrink-0">
                  <div className="w-11 h-11 rounded-2xl neu-btn-gold flex items-center justify-center font-display font-black text-xl text-navy shadow-md transition-transform duration-200 group-hover:scale-105 border border-white/60">
                    <span className="drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)]">Z</span>
                  </div>
                  {/* Online Diode */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white animate-pulse shadow-xs" />
                </div>

                {/* Premium Eye-Catching Typography */}
                <div className="truncate min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h1 className="font-display font-black text-[15px] tracking-tight leading-tight truncate flex items-center gap-1.5">
                      <span className="text-navy drop-shadow-xs">ZAMIN</span>
                      <span className="bg-gradient-to-r from-[#C9A24B] via-[#E8C766] to-[#B88E33] bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(201,162,75,0.35)] font-black">
                        JUNCTION
                      </span>
                    </h1>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[8.5px] font-black uppercase tracking-[0.16em] text-text-muted">
                      ENTERPRISE CONTROL DESK
                    </span>
                    <span className="px-1 py-0.2 rounded neu-pressed text-[7.5px] font-black text-gold tracking-widest border border-gold/30">
                      ERP
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Collapse Toggle or Mobile Close Button */}
              {inDrawer ? (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close sidebar drawer"
                  className="p-2.5 rounded-xl neu-btn text-text-muted hover:text-navy cursor-pointer shrink-0 ml-1.5"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={toggleCompact}
                  title="Collapse Sidebar (Compact Mode)"
                  className="p-2.5 rounded-xl neu-btn text-navy hover:text-gold transition-all cursor-pointer group shrink-0 ml-1.5 shadow-xs"
                >
                  <RiMenuFoldLine className="text-lg group-hover:scale-115 transition-transform" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 2. Navigation Accordion Groups ── */}
        <div className="flex-1 px-2.5 py-4 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {NAVIGATION_SECTIONS.map((section) => {
            const isSectionCollapsed = !!collapsedSections[section.id];

            return (
              <div key={section.id} className="space-y-1">
                {/* Group Header (Expandable / Collapsible) */}
                {!compactMode ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-left rounded-lg text-text-muted hover:text-navy transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-text-muted group-hover:text-navy transition-colors">
                        {section.title}
                      </span>
                    </div>
                    <div className="p-0.5 rounded text-text-muted group-hover:text-navy transition-colors">
                      {isSectionCollapsed ? (
                        <RiArrowRightSLine className="text-xs" />
                      ) : (
                        <RiArrowDownSLine className="text-xs" />
                      )}
                    </div>
                  </button>
                ) : (
                  /* Compact Divider Stud */
                  <div className="py-1 px-2 flex justify-center">
                    <div className="w-6 h-0.5 neu-pressed rounded-full" />
                  </div>
                )}

                {/* Nav Items (Collapsible on Section toggle) */}
                <AnimatePresence initial={false}>
                  {(!isSectionCollapsed || compactMode) && (
                    <motion.div
                      initial={compactMode ? false : { height: 0, opacity: 0 }}
                      animate={compactMode ? false : { height: 'auto', opacity: 1 }}
                      exit={compactMode ? false : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.18, ease: 'easeInOut' }}
                      className="space-y-1 overflow-hidden"
                    >
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const badgeText = item.isLeadItem && liveLeadCount
                          ? `${liveLeadCount}`
                          : item.badge;

                        return (
                          <div key={item.path} className="relative group">
                            <NavLink
                              to={item.path}
                              onClick={inDrawer ? onClose : undefined}
                              className={({ isActive }) =>
                                `relative block p-[2px] rounded-2xl transition-all duration-200 overflow-hidden ${
                                  compactMode ? 'w-12 h-12 mx-auto' : 'w-full'
                                } ${
                                  isActive
                                    ? 'shadow-[0_0_16px_rgba(201,162,75,0.45),0_0_8px_rgba(139,92,246,0.35)]'
                                    : 'hover:shadow-[0_0_8px_rgba(166,180,200,0.3)]'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  {/* ── Colorful Rounding Light Ring on all sides when Active ── */}
                                  {isActive && (
                                    <div className="absolute inset-[-130%] anim-border-spin bg-[conic-gradient(from_0deg,#F59E0B,#EF4444,#EC4899,#8B5CF6,#3B82F6,#10B981,#F59E0B)] opacity-100" />
                                  )}

                                  {/* ── Inner Tactile Button Card ── */}
                                  <div
                                    className={`relative z-10 w-full h-full flex items-center ${
                                      compactMode
                                        ? 'justify-center rounded-[14px]'
                                        : 'justify-between px-3.5 py-2.5 rounded-[14px]'
                                    } font-display text-xs font-bold transition-all duration-150 ${
                                      isActive
                                        ? 'neu-nav-item-active'
                                        : 'neu-nav-item-idle'
                                    }`}
                                  >
                                    {/* Left Glow Indicator Needle (Active State) */}
                                    {isActive && (
                                      <span
                                        className={`absolute left-0 top-2 bottom-2 ${
                                          compactMode ? 'w-1 -left-0.5 rounded-full' : 'w-1 rounded-r-md'
                                        } bg-gradient-to-b from-[#F3D279] via-[#C9A24B] to-[#946E26] shadow-[0_0_8px_rgba(201,162,75,0.8)]`}
                                      />
                                    )}

                                    {/* Icon & Label */}
                                    <div
                                      className={`flex items-center ${
                                        compactMode ? 'justify-center' : 'gap-3 min-w-0'
                                      }`}
                                    >
                                      <div
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                                          isActive
                                            ? 'text-gold'
                                            : 'text-slate-500 group-hover:text-navy group-hover:scale-105'
                                        }`}
                                      >
                                        <Icon className="text-base shrink-0" />
                                      </div>

                                      {!compactMode && (
                                        <span
                                          className={`truncate ${
                                            isActive
                                              ? 'text-navy font-black'
                                              : 'text-slate-700 group-hover:text-navy'
                                          }`}
                                        >
                                          {item.label}
                                        </span>
                                      )}
                                    </div>

                                    {/* Right Badge (Full mode) */}
                                    {!compactMode && badgeText && (
                                      <span
                                        className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 neu-pressed ${
                                          item.isLeadItem
                                            ? 'text-rose-700 border border-rose-300'
                                            : 'text-gold border border-gold/40'
                                        }`}
                                      >
                                        {item.isLeadItem && (
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                        )}
                                        {badgeText}
                                      </span>
                                    )}

                                    {/* Compact Mode Pip Indicator */}
                                    {compactMode && badgeText && (
                                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border border-white animate-pulse" />
                                    )}
                                  </div>
                                </>
                              )}
                            </NavLink>

                            {/* ── Neumorphic Floating Tooltip in Compact Mode ── */}
                            {compactMode && (
                              <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-180 z-50">
                                <div className="neu-surface p-3.5 rounded-xl min-w-[210px] shadow-[10px_10px_28px_rgba(166,180,200,0.5),-10px_-10px_28px_rgba(255,255,255,0.95)] border border-white/80 text-left">
                                  {/* Pointer Caret */}
                                  <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 neu-surface border-l border-b border-border/40" />

                                  <div className="relative">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                      <span className="text-[9px] font-black uppercase tracking-wider text-gold">
                                        {section.title}
                                      </span>
                                      {badgeText && (
                                        <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold neu-pressed text-rose-700 border border-rose-300">
                                          {badgeText}
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="font-display font-bold text-xs text-navy">
                                      {item.label}
                                    </h4>
                                    <p className="text-[10px] text-text-muted mt-1 leading-snug">
                                      {item.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* ── 3. Public Consumer Marketplace Link ── */}
          <div className="pt-2">
            {!compactMode ? (
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-text-muted mb-1">
                PUBLIC GATEWAY
              </p>
            ) : (
              <div className="py-1 px-2 flex justify-center">
                <div className="w-6 h-0.5 neu-pressed rounded-full" />
              </div>
            )}

            <div className="relative group/gate">
              <a
                href="https://zaminjunction.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={`relative block p-[2px] rounded-2xl transition-all duration-200 overflow-hidden ${
                  compactMode ? 'w-12 h-12 mx-auto' : 'w-full'
                } hover:shadow-[0_0_14px_rgba(201,162,75,0.35)]`}
              >
                {/* Rotating Colorful Light on Hover */}
                <div className="absolute inset-[-130%] anim-border-spin bg-[conic-gradient(from_0deg,#F59E0B,#EC4899,#8B5CF6,#3B82F6,#10B981,#F59E0B)] opacity-0 group-hover/gate:opacity-100 transition-opacity duration-300" />

                <div
                  className={`relative z-10 w-full h-full flex items-center ${
                    compactMode
                      ? 'justify-center rounded-[14px]'
                      : 'justify-between px-3.5 py-2.5 rounded-[14px]'
                  } font-display text-xs font-bold neu-nav-item-idle`}
                >
                  <div className={`flex items-center ${compactMode ? 'justify-center' : 'gap-3 min-w-0'}`}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-gold group-hover:scale-105 transition-transform">
                      <RiHome4Line className="text-base shrink-0" />
                    </div>
                    {!compactMode && (
                      <span className="text-slate-700 group-hover:text-navy truncate">
                        Live Consumer Portal
                      </span>
                    )}
                  </div>
                  {!compactMode && (
                    <RiExternalLinkLine className="text-sm text-text-muted group-hover:text-gold transition-colors" />
                  )}
                </div>
              </a>

              {/* Tooltip in Compact Mode */}
              {compactMode && (
                <div className="hidden lg:block absolute left-full ml-3 top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-180 z-50">
                  <div className="neu-surface p-3.5 rounded-xl min-w-[200px] shadow-[10px_10px_28px_rgba(166,180,200,0.5),-10px_-10px_28px_rgba(255,255,255,0.95)] border border-white/80 text-left">
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rotate-45 neu-surface border-l border-b border-border/40" />
                    <span className="text-[9px] font-black uppercase tracking-wider text-gold block mb-0.5">
                      EXTERNAL PORTAL
                    </span>
                    <h4 className="font-display font-bold text-xs text-navy">
                      Live Consumer Website
                    </h4>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Visit production zaminjunction.com
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── 4. Tactile Diagnostics & User Console Footer ── */}
        <div className="p-3 border-t border-border/40 neu-surface-soft space-y-2.5 shrink-0">
          {/* Cluster Status Diagnostic Slot */}
          {!compactMode && (
            <div className="p-2 rounded-xl neu-well-sm flex items-center justify-between text-[10px] font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-text-muted font-mono text-[9px] uppercase tracking-wider">
                  MongoDB Cluster
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-black text-[9px] uppercase tracking-wider">
                  Synced
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
            </div>
          )}

          {/* User Session Console Card */}
          <div
            className={`flex items-center ${
              compactMode ? 'justify-center p-1.5' : 'justify-between p-2.5'
            } rounded-xl neu-convex border border-white/60`}
          >
            {/* User Details */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 rounded-lg neu-well text-gold font-bold flex items-center justify-center text-xs">
                  {admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              </div>

              {!compactMode && (
                <div className="truncate min-w-0">
                  <p className="font-display font-bold text-xs text-navy truncate">
                    {admin?.name || 'Administrator'}
                  </p>
                  <p className="text-[9px] text-gold truncate flex items-center gap-1 font-extrabold uppercase tracking-wider">
                    <RiShieldCheckLine className="text-xs" />
                    <span>{admin?.role || 'Super Admin'}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Tactile Logout Switch */}
            <button
              onClick={logout}
              title="Sign out of Admin Console"
              className={`p-2 neu-btn text-text-muted hover:text-rose-600 rounded-lg transition-all cursor-pointer shrink-0 ${
                compactMode ? 'mt-1' : ''
              }`}
            >
              <RiLogoutBoxRLine className="text-sm" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Desktop Sticky Sidebar (Smooth Width Transition) ── */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 z-30 transition-[width] duration-300 ease-in-out ${
          isCompact ? 'w-[84px]' : 'w-72'
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* ── Mobile & Tablet Drawer with Spring Physics ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-navy/60 backdrop-blur-md z-40"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] z-50 shadow-[14px_0_35px_rgba(166,180,200,0.45)]"
            >
              {renderSidebarContent(true)}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;

