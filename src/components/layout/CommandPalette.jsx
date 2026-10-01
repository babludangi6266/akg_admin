import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiSearchLine,
  RiDashboard3Line,
  RiFileList3Line,
  RiBuilding4Line,
  RiUserStarLine,
  RiUserSettingsLine,
  RiHome4Line,
  RiPriceTag3Line,
  RiCloseLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { leadAPI } from '../../services/api';

const QUICK_ACTIONS = [
  { id: 'dash', label: 'Executive Dashboard', path: '/', icon: RiDashboard3Line, category: 'Navigation' },
  { id: 'leads', label: 'Real Estate Leads Desk', path: '/leads', icon: RiFileList3Line, category: 'Navigation' },
  { id: 'leads-buy', label: 'Buy Property Requirements', path: '/leads?tab=buy', icon: RiHome4Line, category: 'Deals & CRM' },
  { id: 'leads-sell', label: 'Sell Property Mandates', path: '/leads?tab=sell', icon: RiPriceTag3Line, category: 'Deals & CRM' },
  { id: 'leads-ptr', label: 'Channel Partner Applications', path: '/leads?tab=partner', icon: RiUserStarLine, category: 'Deals & CRM' },
  { id: 'props', label: 'Property Catalog & Inventory', path: '/properties', icon: RiBuilding4Line, category: 'Navigation' },
  { id: 'partners', label: 'Broker Directory & Partners', path: '/partners', icon: RiUserStarLine, category: 'Navigation' },
  { id: 'settings', label: 'Admin Security & API Settings', path: '/settings', icon: RiUserSettingsLine, category: 'System' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [leadsResults, setLeadsResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setLeadsResults([]);
    }
  }, [isOpen]);

  // Live search across leads when query length >= 2
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setLeadsResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await leadAPI.getLeads({ search: query.trim(), limit: 5 });
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.leads)
          ? res.data.leads
          : Array.isArray(res?.leads)
          ? res.leads
          : [];
        setLeadsResults(list);
      } catch (err) {
        console.error('Command palette search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelectAction = (path) => {
    navigate(path);
    onClose();
  };

  const filteredQuickActions = QUICK_ACTIONS.filter((act) =>
    act.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-navy/60 backdrop-blur-sm"
        />

        {/* Command Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-2xl bg-surface rounded-2xl border border-border shadow-elevated overflow-hidden z-10 flex flex-col max-h-[80vh]"
        >
          {/* Top Search Input */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border bg-bg/50">
            <RiSearchLine className="text-xl text-text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command, search client name, phone, or location..."
              className="w-full bg-transparent text-sm font-semibold text-navy placeholder:text-text-muted focus:outline-hidden"
            />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-text-muted hover:text-navy hover:bg-bg transition-colors"
            >
              <RiCloseLine className="text-xl" />
            </button>
          </div>

          {/* Results List */}
          <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
            {/* Live Leads Search Results */}
            {leadsResults.length > 0 && (
              <div>
                <p className="px-3 pb-1 text-2xs font-extrabold uppercase text-gold tracking-wider">
                  Matching Clients & Inquiries
                </p>
                <div className="space-y-1">
                  {leadsResults.map((lead) => {
                    const name = lead.contact?.name || lead.name || 'Client';
                    const phone = lead.contact?.mobile || lead.phone || '';
                    const ref = lead.referenceId || lead._id;
                    const cat = (lead.category || 'lead').toUpperCase();

                    return (
                      <button
                        key={lead._id}
                        type="button"
                        onClick={() => handleSelectAction(`/leads?search=${encodeURIComponent(ref)}`)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-gold/10 text-left transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy font-bold flex items-center justify-center text-xs">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-navy group-hover:text-gold transition-colors">
                              {name} <span className="text-text-muted font-normal">({phone})</span>
                            </p>
                            <p className="text-2xs text-text-secondary">
                              Ref: {ref} • Category: {cat}
                            </p>
                          </div>
                        </div>
                        <RiArrowRightLine className="text-text-muted group-hover:text-gold group-hover:translate-x-1 transition-all" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick Actions / Navigation */}
            <div>
              <p className="px-3 pb-1 text-2xs font-extrabold uppercase text-text-muted tracking-wider">
                System Commands & Shortcuts
              </p>
              <div className="space-y-1">
                {filteredQuickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleSelectAction(action.path)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-bg transition-colors cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 group-hover:bg-navy group-hover:text-gold flex items-center justify-center text-base transition-colors">
                          <Icon />
                        </div>
                        <span className="text-xs font-bold text-navy group-hover:text-gold transition-colors">
                          {action.label}
                        </span>
                      </div>
                      <span className="text-3xs font-extrabold px-2 py-0.5 rounded-md bg-bg text-text-muted group-hover:text-navy border border-border">
                        {action.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-bg border-t border-border flex items-center justify-between text-2xs text-text-muted font-medium">
            <span>Use <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-3xs font-mono font-bold text-navy">↑</kbd> <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-3xs font-mono font-bold text-navy">↓</kbd> to navigate</span>
            <span>Press <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded text-3xs font-mono font-bold text-navy">ESC</kbd> to exit</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
