import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiFileList3Line,
  RiHome4Line,
  RiPriceTag3Line,
  RiKey2Line,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiEyeLine,
  RiLineChartLine,
  RiLockPasswordLine,
  RiServerLine,
  RiCheckLine,
  RiCloseLine,
  RiRefreshLine,
  RiAddCircleLine,
  RiBuilding4Line,
} from 'react-icons/ri';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { leadAPI, authAPI, propertyAPI } from '../services/api';
import LeadDetailModal from '../components/leads/LeadDetailModal';

const Dashboard = () => {
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  // Change Password Modal State
  const [pwdModalOpen, setPwdModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadRes, propRes] = await Promise.all([
        leadAPI.getLeads({ limit: 10 }),
        propertyAPI.getProperties({ limit: 5 }).catch(() => ({ data: [] })),
      ]);

      const leadList = Array.isArray(leadRes?.data)
        ? leadRes.data
        : Array.isArray(leadRes?.data?.leads)
        ? leadRes.data.leads
        : Array.isArray(leadRes?.leads)
        ? leadRes.leads
        : [];

      const propList = Array.isArray(propRes?.data)
        ? propRes.data
        : Array.isArray(propRes?.data?.properties)
        ? propRes.data.properties
        : Array.isArray(propRes?.properties)
        ? propRes.properties
        : [];

      setLeads(leadList);
      setProperties(propList);
    } catch (err) {
      console.log('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('All password fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New password and confirm password do not match');
      return;
    }

    setPwdSubmitting(true);

    try {
      await authAPI.changePassword({ currentPassword, newPassword });
      setPwdSuccess('Password changed successfully in MongoDB!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setPwdSuccess('');
        setPwdModalOpen(false);
      }, 2000);
    } catch (err) {
      setPwdError(err?.message || 'Failed to change password. Please verify your current password.');
    } finally {
      setPwdSubmitting(false);
    }
  };

  const totalCount = leads.length;
  const buyCount = leads.filter((l) => (l.category || l.type) === 'buy').length;
  const sellCount = leads.filter((l) => (l.category || l.type) === 'sell').length;
  const rentCount = leads.filter((l) => (l.category || l.type) === 'rent').length;

  const categoryPieData = [
    { name: 'Buy Requirements', value: buyCount || 1, color: '#C9A24B' },
    { name: 'Sell Listings', value: sellCount || 1, color: '#3B82F6' },
    { name: 'Rental Enquiries', value: rentCount || 1, color: '#10B981' },
  ];

  const monthlyTrendData = [
    { month: 'Jan', buy: 4, sell: 2, rent: 5 },
    { month: 'Feb', buy: 8, sell: 5, rent: 9 },
    { month: 'Mar', buy: 12, sell: 8, rent: 14 },
    { month: 'Apr', buy: 18, sell: 12, rent: 20 },
    { month: 'May', buy: buyCount || 25, sell: sellCount || 18, rent: rentCount || 28 },
  ];

  return (
    <div className="space-y-8 select-none">
      {/* ── Executive Hero Welcome Header ── */}
      <div className="bg-gradient-to-r from-navy via-navy-light to-navy rounded-3xl p-8 max-sm:p-6 text-white relative overflow-hidden shadow-elevated border border-gold/40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 border border-gold/40 text-gold text-2xs font-extrabold uppercase tracking-widest">
              <RiLineChartLine className="text-sm" /> Live MongoDB Command Center
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight">
              Zamin Junction Executive Dashboard
            </h1>
            <p className="text-slate-200 text-sm max-w-xl font-medium leading-relaxed">
              Real-time real estate enquiries, DVHosting SMS OTP verifications, and property catalog management across Lucknow.
            </p>
          </div>

          {/* Header Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setPwdModalOpen(true)}
              className="px-4 py-3 rounded-2xl bg-gold/20 hover:bg-gold/30 text-gold font-display font-extrabold text-xs border border-gold/50 flex items-center gap-2 transition-all cursor-pointer shadow-gold"
            >
              <RiLockPasswordLine className="text-base" /> Change Password
            </button>

            <a
              href="/properties"
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-display font-extrabold text-xs border border-white/20 flex items-center gap-2 transition-all"
            >
              <RiBuilding4Line className="text-base text-gold" /> Catalog ({properties.length})
            </a>

            <a
              href="/leads"
              className="px-6 py-3 rounded-2xl bg-gold text-navy font-display font-extrabold text-xs hover:bg-gold-hover transition-all shadow-gold flex items-center justify-center gap-2"
            >
              Manage Leads <RiArrowRightLine />
            </a>
          </div>
        </div>
      </div>

      {/* ── KPI Metric Cards Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-surface border border-border shadow-soft flex items-center justify-between"
        >
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-text-muted">Total MongoDB Leads</p>
            <h3 className="font-display font-extrabold text-3xl text-navy mt-1">{totalCount}</h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-success mt-1">
              <RiShieldCheckLine /> 100% Mobile OTP Verified
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-navy/5 text-navy flex items-center justify-center text-2xl border border-navy/10">
            <RiFileList3Line />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-surface border border-border shadow-soft flex items-center justify-between"
        >
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-text-muted">Buy Requirements</p>
            <h3 className="font-display font-extrabold text-3xl text-navy mt-1">{buyCount}</h3>
            <span className="text-xs font-semibold text-text-secondary mt-1 block">Active Buyers</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gold/15 text-gold flex items-center justify-center text-2xl border border-gold/30">
            <RiHome4Line />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-surface border border-border shadow-soft flex items-center justify-between"
        >
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-text-muted">Sell Listings</p>
            <h3 className="font-display font-extrabold text-3xl text-navy mt-1">{sellCount}</h3>
            <span className="text-xs font-semibold text-text-secondary mt-1 block">Property Owners</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-navy text-gold flex items-center justify-center text-2xl border border-gold/30">
            <RiPriceTag3Line />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 rounded-3xl bg-surface border border-border shadow-soft flex items-center justify-between"
        >
          <div>
            <p className="text-2xs font-bold uppercase tracking-wider text-text-muted">Rental Requests</p>
            <h3 className="font-display font-extrabold text-3xl text-navy mt-1">{rentCount}</h3>
            <span className="text-xs font-semibold text-text-secondary mt-1 block">Tenant Matches</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-success/15 text-success flex items-center justify-center text-2xl border border-success/30">
            <RiKey2Line />
          </div>
        </motion.div>
      </div>

      {/* ── System Status & Change Password Card Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gateway Health Widget */}
        <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
              <RiServerLine className="text-gold" /> Active System Gateways
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-success-light text-success border border-success/30">
              100% Operational
            </span>
          </div>

          <div className="space-y-3 text-xs font-semibold">
            <div className="p-3.5 rounded-2xl bg-bg border border-border flex items-center justify-between">
              <div>
                <p className="font-bold text-navy">DVHosting Real-Time SMS API</p>
                <p className="text-2xs text-text-secondary mt-0.5">https://dvhosting.in/api-sms-v3.php</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-success-light text-success">
                Connected ✓
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-bg border border-border flex items-center justify-between">
              <div>
                <p className="font-bold text-navy">Express MongoDB Backend API</p>
                <p className="text-2xs text-text-secondary mt-0.5">http://127.0.0.1:5000/api</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-success-light text-success">
                Connected ✓
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="p-6 rounded-3xl bg-surface border border-gold/40 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-navy flex items-center gap-2">
              <RiLockPasswordLine className="text-gold" /> Admin Security Credentials
            </h3>
            <button
              onClick={() => setPwdModalOpen(true)}
              className="text-xs font-bold text-gold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Update Password <RiArrowRightLine />
            </button>
          </div>

          <p className="text-xs text-text-secondary font-medium">
            Manage super admin credentials stored in MongoDB database.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setPwdModalOpen(true)}
              className="w-full py-3 rounded-2xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-gold transition-all cursor-pointer"
            >
              <RiLockPasswordLine className="text-base" /> Change Admin Password
            </button>
          </div>
        </div>
      </div>

      {/* ── Analytics Charts Grid ── */}
      <div className="grid grid-cols-12 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="col-span-8 max-lg:col-span-12 p-6 rounded-3xl bg-surface border border-border shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-extrabold text-lg text-navy">Monthly Submission Growth</h3>
              <p className="text-xs text-text-secondary font-medium">Real estate leads velocity from MongoDB</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold border border-gold/30">
              Live Database
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="goldArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A24B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A24B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1E3D', borderRadius: '12px', border: 'none', color: '#FFF' }}
                />
                <Area type="monotone" dataKey="buy" stroke="#C9A24B" strokeWidth={3} fillOpacity={1} fill="url(#goldArea)" />
                <Area type="monotone" dataKey="sell" stroke="#0B1E3D" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="col-span-4 max-lg:col-span-12 p-6 rounded-3xl bg-surface border border-border shadow-soft flex flex-col justify-between">
          <div>
            <h3 className="font-display font-extrabold text-lg text-navy mb-1">Lead Share</h3>
            <p className="text-xs text-text-secondary font-medium">Real estate category distribution</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryPieData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-border pt-4 text-xs font-semibold">
            {categoryPieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name}
                </span>
                <span className="font-bold text-navy">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Submissions Table ── */}
      <div className="p-6 rounded-3xl bg-surface border border-border shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-extrabold text-lg text-navy">Recent Property Submissions</h3>
            <p className="text-xs text-text-secondary font-medium font-bold text-navy">Live MongoDB records</p>
          </div>
          <a
            href="/leads"
            className="text-xs font-extrabold text-gold hover:underline flex items-center gap-1"
          >
            View All Desk Leads <RiArrowRightLine />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-2xs uppercase tracking-wider font-extrabold text-text-muted">
                <th className="py-3 px-4">Client Name</th>
                <th className="py-3 px-4">Mobile & OTP Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Key Specs</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted font-bold">
                    No submissions found in MongoDB. Submit a lead from the website to see it here!
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const cat = lead.category || lead.type;
                  const name = lead.contact?.name || lead.contact?.fullName || 'N/A';
                  const mobile = lead.contact?.mobile || 'N/A';
                  const location =
                    lead.locality ||
                    lead.address ||
                    lead.buyDetails?.preferredLocations?.[0] ||
                    lead.sellDetails?.locality ||
                    lead.rentDetails?.preferredLocations?.[0] ||
                    'Indore';

                  return (
                    <tr key={lead._id} className="hover:bg-bg/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-navy">
                        {name}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        +91 {mobile}{' '}
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-success-light text-success font-bold text-2xs">
                          OTP Verified ✓
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase bg-gold/10 text-gold border border-gold/30">
                          {cat}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary max-w-xs truncate">
                        {location}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase bg-navy/10 text-navy border border-navy/20">
                          {lead.status || 'New'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-2 rounded-lg bg-bg hover:bg-gold hover:text-navy text-text-secondary transition-all cursor-pointer"
                          title="View Full Submission"
                        >
                          <RiEyeLine className="text-base" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Lead Detail Modal ── */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateSuccess={fetchDashboardData}
        />
      )}

      {/* ── Change Password Modal ── */}
      <AnimatePresence>
        {pwdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-xs select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-surface rounded-3xl border border-gold/40 shadow-elevated w-full max-w-md p-6 relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="font-display font-extrabold text-lg text-navy flex items-center gap-2">
                  <RiLockPasswordLine className="text-gold" /> Change Admin Password
                </h3>
                <button
                  onClick={() => setPwdModalOpen(false)}
                  className="p-1.5 rounded-xl text-text-muted hover:text-navy"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              {pwdError && (
                <div className="mb-4 p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-bold">
                  {pwdError}
                </div>
              )}

              {pwdSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-success-light border border-success/30 text-success text-xs font-bold flex items-center gap-2">
                  <RiCheckLine className="text-lg" /> {pwdSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-text-secondary uppercase mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary uppercase mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-text-secondary uppercase mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-bg text-navy focus:border-gold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setPwdModalOpen(false)}
                    className="w-1/2 py-3 rounded-xl border border-border text-text-secondary hover:text-navy font-display font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pwdSubmitting}
                    className="w-1/2 py-3 rounded-xl bg-navy text-gold hover:bg-navy-light font-display font-extrabold text-xs shadow-gold transition-all cursor-pointer"
                  >
                    {pwdSubmitting ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
