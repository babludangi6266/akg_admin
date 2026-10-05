import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  RiWhatsappLine,
  RiDownload2Line,
  RiFileCopyLine,
  RiCloseLine,
  RiFilter3Line,
  RiExternalLinkLine,
  RiAwardLine,
  RiCalendarLine,
} from 'react-icons/ri';
import { partnerAPI } from '../services/api';

const INDORE_CORRIDORS = [
  'All Corridors',
  'Vijay Nagar',
  'Super Corridor',
  'AB Road',
  'Nipania',
  'Bypass Road',
  'Mahalaxmi Nagar',
  'Bicholi Mardana',
  'Palasia',
  'Rau',
];

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all'); // 'all' | 'verified' | 'unverified'
  const [statusFilter, setStatusFilter] = useState('all');
  const [corridorFilter, setCorridorFilter] = useState('All Corridors');
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

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

  // Copy mobile number
  const handleCopy = (mobile, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(mobile);
    setCopiedId(mobile);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (!partners.length) return;
    const headers = [
      'Name',
      'Mobile',
      'Email',
      'Company',
      'Corridor',
      'RERA Number',
      'Experience',
      'OTP Verified',
      'Status',
      'Registered Date',
    ];
    const rows = filteredPartners.map((p) => [
      `"${p.name || ''}"`,
      `"${p.mobile || ''}"`,
      `"${p.email || ''}"`,
      `"${p.companyName || ''}"`,
      `"${p.operatingArea || ''}"`,
      `"${p.reraNumber || 'N/A'}"`,
      `"${p.experienceYears || '1-3 yrs'}"`,
      p.isMobileVerified ? 'YES' : 'NO',
      p.status || 'active',
      new Date(p.createdAt).toLocaleDateString('en-IN'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zamin_Junction_Partners_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics
  const totalPartners = partners.length;
  const totalVerified = partners.filter((p) => p.isMobileVerified).length;
  const verifiedRate = totalPartners > 0 ? Math.round((totalVerified / totalPartners) * 100) : 0;
  const totalSubmissions = partners.reduce((acc, p) => acc + (p.stats?.total || 0), 0);
  const totalPending = partners.reduce((acc, p) => acc + (p.stats?.pending || 0), 0);
  const totalApproved = partners.reduce((acc, p) => acc + (p.stats?.approved || 0), 0);

  // Client filtering
  const filteredPartners = partners.filter((p) => {
    if (verificationFilter === 'verified' && !p.isMobileVerified) return false;
    if (verificationFilter === 'unverified' && p.isMobileVerified) return false;
    if (corridorFilter !== 'All Corridors') {
      const area = (p.operatingArea || '').toLowerCase();
      if (!area.includes(corridorFilter.toLowerCase())) return false;
    }
    const q = search.toLowerCase();
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.mobile || '').includes(q) ||
      (p.operatingArea || '').toLowerCase().includes(q) ||
      (p.companyName || '').toLowerCase().includes(q) ||
      (p.reraNumber || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 select-none">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-extrabold text-2xl text-navy">
              Channel Partner & Broker Network
            </h1>
            <span className="px-3 py-0.5 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              Directory CRM
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            Institutional broker roster, RERA verification status, and direct communication channels.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            disabled={!filteredPartners.length}
            aria-label="Export partner roster to CSV"
            className="px-4 py-2.5 rounded-xl border border-border bg-surface text-navy hover:bg-bg font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RiDownload2Line className="text-base text-gold" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchPartners}
            title="Refresh Partners"
            aria-label="Refresh partner directory"
            className="p-2.5 rounded-xl border border-border bg-surface text-text-secondary hover:text-navy hover:bg-bg transition-colors cursor-pointer"
          >
            <RiRefreshLine className={`text-lg ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-bold">
            <RiUserStarLine />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Registered Partners</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalPartners}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-emerald-300 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-bold">
            <RiShieldCheckLine />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-2xs text-emerald-700 font-extrabold uppercase tracking-wider">OTP Verified</p>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100/80 px-1 rounded">
                {verifiedRate}%
              </span>
            </div>
            <h4 className="font-display font-extrabold text-lg text-emerald-700">{totalVerified}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-amber-300 flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-bold">
            <RiTimeLine className={totalPending > 0 ? 'animate-pulse' : ''} />
          </div>
          <div>
            <p className="text-2xs text-amber-700 font-extrabold uppercase tracking-wider">Pending Listings</p>
            <h4 className="font-display font-extrabold text-lg text-amber-700">{totalPending}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-success-light text-success flex items-center justify-center text-xl font-bold">
            <RiCheckLine />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Approved Live</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalApproved}</h4>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface border border-border flex items-center gap-3 shadow-2xs col-span-2 sm:col-span-1">
          <div className="w-10 h-10 rounded-xl bg-navy/5 text-navy flex items-center justify-center text-xl font-bold">
            <RiBuilding4Line />
          </div>
          <div>
            <p className="text-2xs text-text-muted font-bold uppercase tracking-wider">Total Submissions</p>
            <h4 className="font-display font-extrabold text-lg text-navy">{totalSubmissions}</h4>
          </div>
        </div>
      </div>

      {/* Filter Tabs Deck */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-2.5 rounded-2xl border border-border shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setVerificationFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              verificationFilter === 'all'
                ? 'bg-navy text-gold shadow-xs'
                : 'text-text-secondary hover:text-navy hover:bg-bg'
            }`}
          >
            All Partners ({totalPartners})
          </button>

          <button
            onClick={() => setVerificationFilter('verified')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              verificationFilter === 'verified'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-200'
            }`}
          >
            <RiShieldCheckLine className="text-sm" />
            <span>OTP Verified ({totalVerified})</span>
          </button>

          <button
            onClick={() => setVerificationFilter('unverified')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              verificationFilter === 'unverified'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <span>Unverified ({totalPartners - totalVerified})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Corridor Dropdown */}
          <select
            value={corridorFilter}
            onChange={(e) => setCorridorFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-bg border border-border text-xs font-semibold text-navy focus:outline-hidden cursor-pointer"
          >
            {INDORE_CORRIDORS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="p-3.5 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4 shadow-2xs">
        <div className="relative flex-1">
          <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base" />
          <input
            type="text"
            placeholder="Search partners by name, mobile, email, firm, or RERA license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-hidden focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all"
          />
        </div>
        <span className="text-2xs font-semibold text-text-muted hidden sm:inline whitespace-nowrap">
          Showing {filteredPartners.length} of {totalPartners} partners
        </span>
      </div>

      {/* Partners Table */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg/60 text-2xs font-extrabold uppercase tracking-wider text-text-secondary">
                <th className="py-3.5 px-4">Partner & Organization</th>
                <th className="py-3.5 px-4">Direct Contact</th>
                <th className="py-3.5 px-4">Territory Corridor</th>
                <th className="py-3.5 px-4">RERA & Credential</th>
                <th className="py-3.5 px-4 text-center">Submissions</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Instant Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-gold" />
                    Loading partner directory from MongoDB...
                  </td>
                </tr>
              ) : filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    <RiUserStarLine className="text-3xl mx-auto mb-2 text-text-muted opacity-50" />
                    <p className="font-semibold text-navy">No channel partners match the criteria</p>
                    <p className="text-2xs text-text-muted mt-1">
                      Try clearing filters or search queries.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPartners.map((p) => {
                  const cleanPhone = (p.mobile || '').replace(/\D/g, '');
                  const waNumber = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `Hello ${p.name || 'Partner'}, greetings from Zamin Junction Super Admin Desk. We are reviewing your listings.`
                  )}`;

                  return (
                    <tr
                      key={p._id}
                      onClick={() => setSelectedPartner(p)}
                      className="hover:bg-bg/40 transition-colors cursor-pointer group"
                    >
                      {/* Name & Firm */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold font-display font-black text-sm flex items-center justify-center border border-gold/30 shrink-0">
                            {p.name?.charAt(0) || 'P'}
                          </div>
                          <div className="min-w-0">
                            <span className="font-display font-bold text-navy text-sm block truncate group-hover:text-gold transition-colors">
                              {p.name}
                            </span>
                            {p.companyName ? (
                              <span className="text-2xs text-text-muted truncate flex items-center gap-1 mt-0.5">
                                <RiBriefcaseLine className="text-xs" /> {p.companyName}
                              </span>
                            ) : (
                              <span className="text-2xs text-text-muted">Independent Advisor</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Contact & Copy */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <a
                              href={`tel:${p.mobile}`}
                              className="font-bold text-navy hover:text-gold flex items-center gap-1 text-xs"
                            >
                              <RiPhoneLine className="text-gold text-xs" /> {p.mobile}
                            </a>
                            <button
                              onClick={(e) => handleCopy(p.mobile, e)}
                              title="Copy mobile number"
                              className="p-1 rounded text-text-muted hover:text-navy cursor-pointer transition-colors"
                            >
                              {copiedId === p.mobile ? (
                                <RiCheckLine className="text-emerald-600 text-xs" />
                              ) : (
                                <RiFileCopyLine className="text-xs" />
                              )}
                            </button>
                            {p.isMobileVerified ? (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-300 shadow-2xs">
                                <RiShieldCheckLine className="text-xs text-emerald-600" /> OTP Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-semibold border border-slate-200">
                                Unverified
                              </span>
                            )}
                          </div>
                          {p.email && (
                            <a
                              href={`mailto:${p.email}`}
                              className="text-2xs text-text-muted hover:text-navy flex items-center gap-1 truncate max-w-[170px]"
                            >
                              <RiMailLine className="text-xs shrink-0" /> {p.email}
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Corridor */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-navy flex items-center gap-1">
                          <RiMapPinLine className="text-gold shrink-0 text-xs" />{' '}
                          {p.operatingArea || 'Indore General'}
                        </span>
                        {p.address && (
                          <p className="text-2xs text-text-muted truncate max-w-xs mt-0.5">
                            {p.address}
                          </p>
                        )}
                      </td>

                      {/* RERA */}
                      <td className="py-3.5 px-4">
                        <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-bg text-navy border border-border inline-block">
                          {p.reraNumber ? `RERA: ${p.reraNumber}` : 'Standard Partner'}
                        </span>
                        <span className="text-2xs text-text-muted mt-1 block">
                          Exp: {p.experienceYears || '1-3 years'}
                        </span>
                      </td>

                      {/* Submissions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-bg px-2.5 py-1 rounded-xl border border-border">
                          <span className="font-bold text-navy" title="Total Submitted">
                            {p.stats?.total || 0}
                          </span>
                          {p.stats?.pending > 0 && (
                            <span
                              className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-2xs font-black"
                              title="Pending Review"
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
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase border ${
                            p.status === 'active'
                              ? 'bg-success-light text-success border-success/30'
                              : 'bg-danger-light text-danger border-danger/30'
                          }`}
                        >
                          {p.status || 'active'}
                        </span>
                      </td>

                      {/* Instant Outreach Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {p.mobile && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Direct WhatsApp Chat"
                              className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-colors"
                            >
                              <RiWhatsappLine className="text-sm" />
                            </a>
                          )}
                          {p.mobile && (
                            <a
                              href={`tel:${p.mobile}`}
                              title="Call Partner"
                              className="p-2 rounded-xl bg-bg text-navy hover:bg-navy hover:text-gold border border-border transition-colors"
                            >
                              <RiPhoneLine className="text-sm" />
                            </a>
                          )}
                          <button
                            onClick={() => setSelectedPartner(p)}
                            title="View Full Profile"
                            className="p-2 rounded-xl bg-bg text-navy hover:bg-gold/10 hover:text-gold border border-border transition-colors cursor-pointer"
                          >
                            <RiExternalLinkLine className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Detail Drawer Modal */}
      <AnimatePresence>
        {selectedPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-navy/70 backdrop-blur-sm select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              className="w-full max-w-3xl lg:max-w-4xl bg-surface rounded-3xl border border-border shadow-elevated overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-navy via-navy-light to-navy text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gold/20 text-gold font-display font-black text-lg flex items-center justify-center border border-gold/40">
                    {selectedPartner.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-lg text-white">
                      {selectedPartner.name}
                    </h3>
                    <p className="text-xs text-gold/80 flex items-center gap-1.5 mt-0.5">
                      <RiBriefcaseLine /> {selectedPartner.companyName || 'Independent Real Estate Partner'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <RiCloseLine className="text-xl" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedPartner.isMobileVerified ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-2xs font-extrabold border border-emerald-300 flex items-center gap-1">
                      <RiShieldCheckLine /> Mobile Verified via OTP
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-2xs font-semibold border border-slate-300">
                      Unverified Mobile
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full bg-navy/5 text-navy text-2xs font-extrabold uppercase border border-border">
                    Status: {selectedPartner.status || 'Active'}
                  </span>
                  {selectedPartner.reraNumber && (
                    <span className="px-3 py-1 rounded-full bg-gold/15 text-gold text-2xs font-extrabold border border-gold/40 flex items-center gap-1">
                      <RiAwardLine /> RERA: {selectedPartner.reraNumber}
                    </span>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3.5 bg-bg p-4 rounded-2xl border border-border">
                  <div>
                    <label className="text-2xs font-extrabold uppercase text-text-muted">Primary Phone</label>
                    <p className="font-bold text-navy text-sm mt-0.5 flex items-center gap-1.5">
                      <RiPhoneLine className="text-gold text-xs" /> {selectedPartner.mobile}
                    </p>
                  </div>
                  <div>
                    <label className="text-2xs font-extrabold uppercase text-text-muted">Email Address</label>
                    <p className="font-bold text-navy text-sm mt-0.5 truncate flex items-center gap-1.5">
                      <RiMailLine className="text-gold text-xs shrink-0" /> {selectedPartner.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-2xs font-extrabold uppercase text-text-muted">Operating Corridor</label>
                    <p className="font-bold text-navy mt-0.5 flex items-center gap-1.5">
                      <RiMapPinLine className="text-gold text-xs shrink-0" /> {selectedPartner.operatingArea || 'Indore General'}
                    </p>
                  </div>
                  <div>
                    <label className="text-2xs font-extrabold uppercase text-text-muted">Industry Experience</label>
                    <p className="font-bold text-navy mt-0.5">
                      {selectedPartner.experienceYears || '1-3 years'}
                    </p>
                  </div>
                </div>

                {/* Address */}
                {selectedPartner.address && (
                  <div>
                    <label className="text-2xs font-extrabold uppercase text-text-muted block mb-1">
                      Office / Registered Address
                    </label>
                    <p className="p-3 bg-bg rounded-xl border border-border text-navy font-medium">
                      {selectedPartner.address}
                    </p>
                  </div>
                )}

                {/* Submission Statistics */}
                <div>
                  <label className="text-2xs font-extrabold uppercase text-text-muted block mb-2">
                    Property Submission Performance
                  </label>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-bg border border-border">
                      <p className="text-2xs text-text-muted uppercase font-bold">Total</p>
                      <p className="font-display font-black text-lg text-navy">
                        {selectedPartner.stats?.total || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                      <p className="text-2xs uppercase font-bold">Pending Review</p>
                      <p className="font-display font-black text-lg">
                        {selectedPartner.stats?.pending || 0}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <p className="text-2xs uppercase font-bold">Approved Live</p>
                      <p className="font-display font-black text-lg">
                        {selectedPartner.stats?.approved || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-2xs text-text-muted flex items-center gap-1.5 pt-2 border-t border-border">
                  <RiCalendarLine /> Registered on{' '}
                  {new Date(selectedPartner.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-bg border-t border-border flex items-center justify-between">
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="px-4 py-2 rounded-xl text-text-secondary hover:text-navy text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedPartner.mobile && (
                    <a
                      href={`https://wa.me/${
                        selectedPartner.mobile.replace(/\D/g, '').length === 10
                          ? `91${selectedPartner.mobile.replace(/\D/g, '')}`
                          : selectedPartner.mobile.replace(/\D/g, '')
                      }`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <RiWhatsappLine /> WhatsApp Desk
                    </a>
                  )}
                  {selectedPartner.mobile && (
                    <a
                      href={`tel:${selectedPartner.mobile}`}
                      className="px-4 py-2 rounded-xl bg-navy hover:bg-navy-light text-gold font-bold text-xs flex items-center gap-1.5 shadow-gold transition-colors"
                    >
                      <RiPhoneLine /> Call Now
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Partners;
