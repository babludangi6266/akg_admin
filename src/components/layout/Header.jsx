import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  RiMenu2Line,
  RiNotification3Line,
  RiBuilding4Line,
  RiCheckDoubleLine,
} from 'react-icons/ri';
import { useAuth } from '../../context/AuthContext';
import { leadAPI } from '../../services/api';

const pageTitles = {
  '/': 'Executive Dashboard',
  '/leads': 'Real Estate Leads Desk',
  '/properties': 'Property Catalog Management',
  '/settings': 'Admin System Settings',
};

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [recentLeads, setRecentLeads] = useState([]);
  const [hasUnread, setHasUnread] = useState(true);

  const fetchLiveNotifications = async () => {
    try {
      const res = await leadAPI.getLeads({ limit: 4 });
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
    const interval = setInterval(fetchLiveNotifications, 15000); // Poll live leads every 15s
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
    setHasUnread(false);
  };

  const title = pageTitles[location.pathname] || 'Admin Portal';

  return (
    <header className="sticky top-0 z-20 bg-surface/90 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between select-none">
      <div className="flex items-center gap-4">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-text-secondary hover:text-navy hover:bg-bg transition-colors"
        >
          <RiMenu2Line className="text-2xl" />
        </button>

        {/* Page Title & Breadcrumb */}
        <div>
          <h2 className="font-display font-extrabold text-xl text-navy leading-tight">
            {title}
          </h2>
          <p className="text-xs text-text-secondary font-medium hidden sm:block">
            Zamin Junction Properties & Services Management
          </p>
        </div>
      </div>

      {/* Right Actions Header */}
      <div className="flex items-center gap-3">
        {/* Real estate badge indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-bold">
          <RiBuilding4Line /> Real Estate Primary Desk
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={handleNotificationClick}
            className="p-2.5 rounded-xl border border-border bg-bg hover:bg-surface text-text-secondary hover:text-navy transition-all duration-200 cursor-pointer relative"
          >
            <RiNotification3Line className="text-xl" />
            {hasUnread && recentLeads.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-surface animate-pulse" />
            )}
          </button>

          {/* Live MongoDB Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-surface border border-border rounded-2xl shadow-elevated p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h4 className="font-display font-bold text-sm text-navy">Live Notifications</h4>
                <span className="text-2xs font-bold text-gold uppercase bg-gold/10 px-2 py-0.5 rounded-md">
                  {recentLeads.length} Real Leads
                </span>
              </div>

              <div className="py-3 space-y-2 text-xs">
                {recentLeads.length === 0 ? (
                  <p className="text-center text-text-muted py-4 font-semibold">No recent lead notifications</p>
                ) : (
                  recentLeads.map((lead) => {
                    const name = lead.contact?.name || lead.contact?.fullName || 'Client';
                    const cat = (lead.category || lead.type || 'property').toUpperCase();
                    const loc =
                      lead.buyDetails?.preferredLocations?.[0] ||
                      lead.sellDetails?.locality ||
                      lead.rentDetails?.preferredLocations?.[0] ||
                      'Lucknow';

                    return (
                      <div
                        key={lead._id}
                        onClick={() => {
                          setNotificationsOpen(false);
                          navigate('/leads');
                        }}
                        className="p-3 rounded-xl bg-bg hover:bg-gold/10 border border-border hover:border-gold/30 transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-navy">{name}</p>
                          <span className="text-3xs font-extrabold px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                            {cat}
                          </span>
                        </div>
                        <p className="text-text-secondary text-2xs mt-0.5 font-medium">
                          Mobile OTP Verified • {loc}
                        </p>
                        <span className="text-3xs text-text-muted mt-1 block font-semibold">
                          Submitted on {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-2 border-t border-border text-center">
                <button
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate('/leads');
                  }}
                  className="text-xs font-extrabold text-navy hover:text-gold transition-colors flex items-center justify-center gap-1 mx-auto"
                >
                  <RiCheckDoubleLine className="text-base" /> View All Desk Submissions
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-border">
          <div className="w-10 h-10 rounded-full bg-navy text-gold font-display font-bold flex items-center justify-center text-base border-2 border-gold/40 shadow-xs">
            {admin?.name ? admin.name.charAt(0) : 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
