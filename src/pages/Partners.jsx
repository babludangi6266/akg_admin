import { useState, useEffect } from 'react';
import {
  RiUserStarLine,
  RiSearchLine,
  RiMapPinLine,
  RiPhoneLine,
  RiMailLine,
  RiBuilding4Line,
  RiShieldCheckLine,
  RiRefreshLine,
  RiTimeLine,
  RiCheckLine,
  RiBriefcaseLine,
} from 'react-icons/ri';
import { partnerAPI } from '../services/api';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await partnerAPI.getAll(params);
      const list = res?.data?.partners || [];
      setPartners(list);
    } catch (err) {
      console.error('Failed to load partners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, [statusFilter]);

  const totalPartners = partners.length;
  const totalSubmissions = partners.reduce((acc, p) => acc + (p.stats?.total || 0), 0);
  const totalPending = partners.reduce((acc, p) => acc + (p.stats?.pending || 0), 0);
  const totalApproved = partners.reduce((acc, p) => acc + (p.stats?.approved || 0), 0);

  // Filter in client for instant search
  const filteredPartners = partners.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.mobile?.includes(q) ||
      p.operatingArea?.toLowerCase().includes(q) ||
      p.companyName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl text-navy">
              Channel Partners & Broker Network
            </h1>
            <span className="px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              Directory
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            Registered property consultants, channel partners, and brokers operating across Central India corridors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchPartners}
            title="Refresh Partners"
            className="p-3 rounded-xl border border-border bg-surface text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
          >
            <RiRefreshLine className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold">
            <RiUserStarLine />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Registered Partners</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalPartners}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-amber-300 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">
            <RiTimeLine className={totalPending > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className="text-2xs text-amber-700 font-extrabold uppercase tracking-wider">Pending Approvals</p>
            <h4 className="font-display font-extrabold text-lg text-amber-700">{totalPending}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-success-light text-success flex items-center justify-center text-xl font-bold">
            <RiCheckLine />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Approved Live Properties</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalApproved}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center text-xl font-bold">
            <RiBuilding4Line />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Total Submissions</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalSubmissions}</h4>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-lg" />
          <input
            type="text"
            placeholder="Search by partner name, mobile, email, area, or firm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-hidden focus:border-gold/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/60 text-2xs font-extrabold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4">Partner Details</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Primary Corridor</th>
                <th className="py-3.5 px-4">RERA & Experience</th>
                <th className="py-3.5 px-4 text-center">Submissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-gold" />
                    Loading registered channel partners...
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    <RiUserStarLine className="text-3xl mx-auto mb-2 text-text-muted opacity-50" />
                    <p className="font-semibold text-navy">No channel partners found</p>
                    <p className="text-2xs text-text-muted mt-1">
                      Brokers who register on the public website (/partner-registration) will appear here.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => (
                  <tr key={p._id} className="hover:bg-bg/40 transition-colors">
                    {/* Partner Name & Firm */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold font-display font-black text-sm flex items-center justify-center border border-gold/30 shrink-0">
                          {p.name?.charAt(0) || 'P'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-display font-bold text-navy text-sm block truncate">
                            {p.name}
                          </span>
                          {p.companyName ? (
                            <span className="text-2xs text-text-muted truncate flex items-center gap-1">
                              <RiBriefcaseLine className="text-xs" /> {p.companyName}
                            </span>
                          ) : (
                            <span className="text-2xs text-text-muted">Independent Advisor</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={`tel:${p.mobile}`}
                          className="font-semibold text-navy hover:text-gold flex items-center gap-1.5 transition-colors"
                        >
                          <RiPhoneLine className="text-gold text-xs" /> {p.mobile}
                        </a>
                        <a
                          href={`mailto:${p.email}`}
                          className="text-2xs text-text-muted hover:text-navy flex items-center gap-1.5 transition-colors truncate max-w-[180px]"
                        >
                          <RiMailLine className="text-xs" /> {p.email}
                        </a>
                      </div>
                    </td>

                    {/* Corridor & Address */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-navy flex items-center gap-1">
                        <RiMapPinLine className="text-gold" /> {p.operatingArea}
                      </span>
                      <p className="text-2xs text-text-muted truncate max-w-xs mt-0.5">
                        {p.address}
                      </p>
                    </td>

                    {/* RERA & Experience */}
                    <td className="py-3.5 px-4">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-bg text-navy border border-border block w-fit">
                        {p.reraNumber ? `RERA: ${p.reraNumber}` : 'Standard Partner'}
                      </span>
                      <span className="text-2xs text-text-muted mt-1 block">
                        Exp: {p.experienceYears || '1-3 years'}
                      </span>
                    </td>

                    {/* Submissions Breakdown */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-bg px-2.5 py-1 rounded-xl border border-border">
                        <span className="font-bold text-navy" title="Total Submitted">
                          {p.stats?.total || 0}
                        </span>
                        {p.stats?.pending > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-2xs font-black"
                            title="Pending Approval"
                          >
                            {p.stats.pending} ⏳
                          </span>
                        )}
                        {p.stats?.approved > 0 && (
                          <span
                            className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-2xs font-black"
                            title="Approved Live"
                          >
                            {p.stats.approved} ✓
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase border ${
                          p.status === 'active'
                            ? 'bg-success-light text-success border-success/30'
                            : 'bg-danger-light text-danger border-danger/30'
                        }`}
                      >
                        {p.status || 'active'}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-right text-text-muted font-medium text-2xs">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Partners;
