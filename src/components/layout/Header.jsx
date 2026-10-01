import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RiMenu2Line,
  RiNotification3Line,
  RiBuilding4Line,
  RiSearchLine,
  RiAddLine,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiCheckDoubleLine,
  RiRefreshLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { leadAPI } from '../../services/api';
import CommandPalette from './CommandPalette';

const PAGE_META = {
  '/': { title: 'Executive Overview', section: 'CORE CRM' },
  '/leads': { title: 'Leads & Requirements Desk', section: 'PIPELINE' },
  '/properties': { title: 'Property Catalog & Inventory', section: 'INVENTORY ERP' },
  '/partners': { title: 'Channel Partner Network', section: 'BROKER CRM' },
  '/settings': { title: 'Security & System Settings', section: 'OPERATIONS' },
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [recentLeads, setRecentLeads] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);

  const fetchLiveNotifications = async () => {
    try {
      const res = await leadAPI.getLeads({ limit: 5 });
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.leads)
        ? res.data.leads
        : Array.isArray(res?.leads)
        ? res.leads
        : [];
      setRecentLeads(list);
    } catch (err) {
      console.log('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const meta = PAGE_META[location.pathname] || { title: 'Management Console', section: 'CRM' };

  return (
    <>
      <header className="sticky top-0 z-20 bg-surface/95 backdrop-blur-md border-b border-border px-5 py-3.5 flex items-center justify-between select-none">
        {/* Left: Mobile trigger & Breadcrumbs */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={onMenuClick}
            aria-label="Open sidebar"
            className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
          >
            <RiMenu2Line className="text-xl" />
          </button>

          <div>
            <div className="flex items-center gap-1.5 text-3xs font-extrabold uppercase tracking-widest text-text-muted">
              <span>{meta.section}</span>
              <span>/</span>
              <span className="text-gold font-black">CONTROL DESK</span>
            </div>
            <h2 className="font-display font-extrabold text-lg sm:text-xl text-navy leading-tight">
              {meta.title}
            </h2>
          </div>
        </div>

        {/* Center / Right: Global Search, Live Status, Notifications */}
        <div className="flex items-center gap-3">
          {/* Universal Search Bar Trigger */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-bg hover:bg-bg-alt border border-border text-xs text-text-muted transition-all cursor-pointer w-64 md:w-80 justify-between shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <RiSearchLine className="text-sm group-hover:text-gold transition-colors" />
              <span className="font-medium truncate">Quick search leads, refs, commands...</span>
            </div>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono font-bold text-navy shadow-2xs">
              ⌘K
            </kbd>
          </button>

          {/* Real-time Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">ERP Synced</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setHasUnread(false);
              }}
              aria-label="Notifications"
              className="p-2 rounded-xl border border-border bg-bg hover:bg-surface text-text-secondary hover:text-navy transition-all cursor-pointer relative shadow-2xs"
            >
              <RiNotification3Line className="text-lg" />
              {hasUnread && recentLeads.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-surface animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-elevated p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-bold text-sm text-navy">Live Inbound Inquiries</h4>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <span className="text-2xs font-extrabold text-gold uppercase bg-gold/10 px-2 py-0.5 rounded-md border border-gold/30">
                    Real-Time Feed
                  </span>
                </div>

                <div className="py-2.5 space-y-2 text-xs max-h-72 overflow-y-auto">
                  {recentLeads.length === 0 ? (
                    <p className="text-center text-text-muted py-6 font-medium">
                      No recent inquiries received.
                    </p>
                  ) : (
                    recentLeads.map((lead) => {
                      const name = lead.contact?.name || lead.name || 'Client';
                      const mobile = lead.contact?.mobile || lead.phone || '';
                      const cat = (lead.category || 'buy').toUpperCase();
                      const ref = lead.referenceId || lead._id;
                      const loc = lead.location || lead.locality || lead.address || 'Indore';

                      return (
                        <div
                          key={lead._id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate(`/leads?search=${encodeURIComponent(ref)}`);
                          }}
                          className="p-2.5 rounded-xl bg-bg hover:bg-gold/10 border border-border hover:border-gold/30 transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-navy truncate max-w-[170px]">{name}</span>
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-navy text-gold border border-gold/30">
                              {cat}
                            </span>
                          </div>
                          <p className="text-text-secondary text-2xs mt-0.5 font-medium">
                            +91 {mobile} • {loc}
                          </p>
                          <span className="text-[10px] text-text-muted mt-0.5 block font-mono">
                            Ref: {ref}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/leads');
                    }}
                    className="text-xs text-gold hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View All Leads & Inquiries <RiArrowRightLine />
                  </button>
                  <button
                    onClick={fetchLiveNotifications}
                    title="Refresh"
                    className="p-1 rounded text-text-muted hover:text-navy cursor-pointer"
                  >
                    <RiRefreshLine className="text-sm" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Button */}
          <button
            type="button"
            onClick={() => navigate('/properties')}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <RiAddLine className="text-sm" />
            <span>Add Property</span>
          </button>
        </div>
      </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
};

export default Header;
