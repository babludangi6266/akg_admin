import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiSearchLine,
  RiFilter3Line,
  RiShieldCheckLine,
  RiDownload2Line,
  RiRefreshLine,
  RiHome4Line,
  RiPriceTag3Line,
  RiDeleteBin6Line,
  RiWhatsappLine,
  RiPhoneLine,
  RiMapPinLine,
  RiCalendarLine,
  RiUserStarLine,
  RiUserLine,
  RiCheckDoubleLine,
  RiFileCopyLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiFileList3Line,
  RiExchangeDollarLine,
  RiSparklingLine,
  RiTimeLine,
  RiHeartLine,
} from 'react-icons/ri';
import { leadAPI, areaAPI } from '../services/api';
import LeadDetailModal from '../components/leads/LeadDetailModal';

const DEFAULT_AREAS = [
  'Vijay Nagar',
  'Super Corridor',
  'Nipania',
  'Bypass Road',
  'AB Road',
  'Mahalaxmi Nagar',
  'Bicholi Mardana',
  'Rau / Pithampur Road',
  'Palasia',
  'Silicon City',
  'Kanadia Road',
  'Ujjain Road Corridor',
  'Musakhedi',
];

const STATUS_CONFIG = {
  new: { label: 'New Request', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  contacted: { label: 'Contacted', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  in_progress: { label: 'Site Visit Scheduled', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  closed_won: { label: 'Deal Completed', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed_lost: { label: 'Not Interested', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  rejected: { label: 'Cancelled', bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
};

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [areas, setAreas] = useState(DEFAULT_AREAS);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'buy' | 'sell' | 'partner' | 'contact'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [localityFilter, setLocalityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedRef, setCopiedRef] = useState(null);
  const [statusChangingId, setStatusChangingId] = useState(null);

  // Fetch Areas from Admin API
  const fetchAreas = async () => {
    try {
      const res = await areaAPI.getAllAdmin().catch(() => areaAPI.getActive());
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];
      if (list.length > 0) {
        const names = list
          .map((a) => (typeof a === 'string' ? a : a.name))
          .filter(Boolean);
        const unique = Array.from(new Set([...names, ...DEFAULT_AREAS]));
        setAreas(unique);
      }
    } catch (err) {
      console.warn('Could not load areas, using defaults:', err);
    }
  };

  // Fetch Inquiries / Requests
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = { limit: 200 };
      if (activeTab !== 'all') params.category = activeTab;
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await leadAPI.getLeads(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.leads)
        ? res.data.leads
        : Array.isArray(res?.leads)
        ? res.leads
        : [];

      setLeads(list);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [activeTab, statusFilter]);

  // Quick Status Transition
  const handleQuickStatusChange = async (id, newStatus, e) => {
    if (e) e.stopPropagation();
    setStatusChangingId(id);
    try {
      if (id && id.length === 24) {
        await leadAPI.updateLeadStatus(id, { status: newStatus });
      }
      setLeads((prev) =>
        prev.map((l) => (l._id === id ? { ...l, status: newStatus } : l))
      );
      if (selectedLead?._id === id) {
        setSelectedLead((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setStatusChangingId(null);
    }
  };

  // Delete Request
  const handleDeleteLead = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to remove the request from "${name || 'Customer'}"?`)) return;

    try {
      if (id && id.length === 24) {
        await leadAPI.deleteLead(id);
      }
      setLeads((prev) => prev.filter((item) => item._id !== id));
      if (selectedLead?._id === id) setSelectedLead(null);
    } catch (err) {
      console.error('Failed to remove request:', err);
    }
  };

  // Copy Reference ID
  const handleCopyRef = (refId, e) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(refId);
    setCopiedRef(refId);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  // WhatsApp quick helper
  const getWhatsAppLink = (lead) => {
    const mobile = lead.contact?.mobile || lead.phone || lead.mobile || '';
    if (!mobile) return '#';
    const cleanNumber = mobile.replace(/[^0-9]/g, '');
    const numWithCountry = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const name = lead.contact?.name || lead.name || 'Client';
    const ref = lead.referenceId || 'ZJ-REQ';
    const isPartner = lead.category === 'partner' || Boolean(lead.partnerType);

    const text = encodeURIComponent(
      isPartner
        ? `Hello ${name}, greetings from Zamin Junction regarding your Property Partner registration [Ref: ${ref}]. How may we help grow your real estate business with us?`
        : `Hello ${name}, greetings from Zamin Junction regarding your property inquiry [Ref: ${ref}]. When would be a good time for a quick call today to share verified options?`
    );
    return `https://wa.me/${numWithCountry}?text=${text}`;
  };

  // Format Budget Display
  const formatBudgetDisplay = (b) => {
    if (!b) return 'Flexible';
    if (typeof b === 'number') {
      if (b >= 10000000) return `₹ ${(b / 10000000).toFixed(2)} Cr`;
      if (b >= 100000) return `₹ ${(b / 100000).toFixed(2)} Lakh`;
      return `₹ ${b.toLocaleString('en-IN')}`;
    }
    return String(b);
  };

  // CSV Exporter
  const exportCSV = () => {
    const headers = 'Inquiry ID,Category,Customer Name,Mobile,Interested Property,Budget,Location,Status,Date\n';
    const rows = filteredLeads
      .map((l) => {
        const ref = l.referenceId || `ZJ-${l._id?.slice(-6)?.toUpperCase()}`;
        const cat = l.category || (l.partnerType ? 'partner' : 'buy');
        const name = (l.contact?.name || l.name || l.fullName || 'Customer').replace(/"/g, '""');
        const mobile = l.contact?.mobile || l.phone || l.mobile || '';
        const type = l.propertyType || l.buyDetails?.propertyType || l.sellDetails?.propertyType || '';
        const budget = (l.budget || l.amount || '').toString().replace(/"/g, '""');
        const loc = (l.location || l.locality || l.address || '').replace(/"/g, '""');
        const status = l.status || 'new';
        const date = new Date(l.createdAt || Date.now()).toLocaleDateString('en-IN');
        return `"${ref}","${cat}","${name}","${mobile}","${type}","${budget}","${loc}","${status}","${date}"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZaminJunction_Customer_Inquiries_${Date.now()}.csv`;
    a.click();
  };

  // Metrics
  const totalCount = leads.length;
  const buyCount = leads.filter((l) => l.category === 'buy' || (!l.category && !l.partnerType)).length;
  const sellCount = leads.filter((l) => l.category === 'sell').length;
  const partnerCount = leads.filter((l) => l.category === 'partner' || Boolean(l.partnerType)).length;
  const contactCount = leads.filter((l) => l.category === 'contact').length;
  const completedCount = leads.filter((l) => l.status === 'closed_won').length;

  // Filtered & Sorted Leads
  const filteredLeads = useMemo(() => {
    const list = leads.filter((lead) => {
      // Category filter
      if (activeTab === 'buy') {
        const isBuy = lead.category === 'buy' || (!lead.category && !lead.partnerType);
        if (!isBuy) return false;
      } else if (activeTab === 'sell') {
        if (lead.category !== 'sell') return false;
      } else if (activeTab === 'partner') {
        const isPartner = lead.category === 'partner' || Boolean(lead.partnerType);
        if (!isPartner) return false;
      } else if (activeTab === 'contact') {
        if (lead.category !== 'contact') return false;
      }

      // Locality filter
      if (localityFilter !== 'all') {
        const loc = (lead.location || lead.locality || lead.address || '').toLowerCase();
        if (!loc.includes(localityFilter.toLowerCase())) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (lead.contact?.name || lead.name || lead.fullName || '').toLowerCase();
        const mobile = (lead.contact?.mobile || lead.phone || lead.mobile || '').toLowerCase();
        const ref = (lead.referenceId || '').toLowerCase();
        const loc = (lead.location || lead.locality || lead.address || '').toLowerCase();
        const type = (lead.propertyType || lead.partnerType || '').toLowerCase();
        if (!name.includes(q) && !mobile.includes(q) && !ref.includes(q) && !loc.includes(q) && !type.includes(q)) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    } else if (sortBy === 'name') {
      list.sort((a, b) => {
        const nameA = a.contact?.name || a.name || '';
        const nameB = b.contact?.name || b.name || '';
        return nameA.localeCompare(nameB);
      });
    }

    return list;
  }, [leads, activeTab, localityFilter, searchQuery, sortBy]);

  return (
    <div className="space-y-6 select-none max-w-[1700px] mx-auto pb-12">

      {/* ══════════ EXECUTIVE HEADER ══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-surface border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display font-black text-2xl text-navy tracking-tight">
              Customer Inquiries & Requests
            </h1>
            <span className="px-3 py-1 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              {totalCount} Total Inquiries
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-1">
            Review and connect with home buyers, property sellers, and partner registrations in Indore.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchLeads}
            title="Refresh Inquiries"
            className="p-2.5 rounded-xl border border-border bg-bg hover:bg-navy hover:text-gold text-text-secondary transition-all cursor-pointer shadow-2xs"
          >
            <RiRefreshLine className={`text-base ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-xl bg-navy text-gold font-display font-extrabold text-xs flex items-center gap-2 hover:bg-navy-light transition-all shadow-gold cursor-pointer border border-gold/30"
          >
            <RiDownload2Line className="text-base" />
            <span>Download Excel Sheet</span>
          </button>
        </div>
      </div>

      {/* ══════════ HIGH-IMPACT KPI METRIC CARDS ══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-navy text-white border-navy shadow-soft ring-2 ring-gold/40'
              : 'bg-surface text-navy border-border hover:border-gold/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase opacity-75">All Requests</span>
            <RiFileList3Line className="text-gold text-lg" />
          </div>
          <p className="font-display font-black text-2xl mt-1">{totalCount}</p>
          <p className="text-[11px] opacity-70 mt-0.5 truncate">Total inquiries received</p>
        </div>

        <div
          onClick={() => setActiveTab('buy')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'buy'
              ? 'bg-navy text-gold border-navy shadow-soft ring-2 ring-gold/40'
              : 'bg-surface text-navy border-border hover:border-gold/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase text-gold">Buying Property</span>
            <RiHome4Line className="text-gold text-lg" />
          </div>
          <p className="font-display font-black text-2xl mt-1 text-gold">{buyCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5 truncate">Looking to buy plots/villas</p>
        </div>

        <div
          onClick={() => setActiveTab('sell')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'sell'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-soft'
              : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase opacity-75">Selling Property</span>
            <RiPriceTag3Line className="text-lg" />
          </div>
          <p className="font-display font-black text-2xl mt-1">{sellCount}</p>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Owners wanting to sell</p>
        </div>

        <div
          onClick={() => setActiveTab('partner')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'partner'
              ? 'bg-purple-700 text-white border-purple-700 shadow-soft'
              : 'bg-purple-50/60 text-purple-900 border-purple-200 hover:bg-purple-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase opacity-75">Property Partners</span>
            <RiUserStarLine className="text-lg" />
          </div>
          <p className="font-display font-black text-2xl mt-1">{partnerCount}</p>
          <p className="text-[11px] opacity-75 mt-0.5 truncate">Brokers & Builder agents</p>
        </div>

        <div
          onClick={() => setStatusFilter(statusFilter === 'closed_won' ? 'all' : 'closed_won')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'closed_won'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft'
              : 'bg-surface text-navy border-border hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-2xs font-extrabold uppercase text-emerald-600">Deals Finalized</span>
            <RiCheckDoubleLine className="text-emerald-600 text-lg" />
          </div>
          <p className="font-display font-black text-2xl mt-1 text-emerald-700">{completedCount}</p>
          <p className="text-[11px] text-text-muted mt-0.5 truncate">Successfully closed</p>
        </div>
      </div>

      {/* ══════════ SEARCH & STREAMLINED FILTER BAR ══════════ */}
      <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-border shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base pointer-events-none" />
            <input
              type="text"
              placeholder="Search by customer name, mobile, reference, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Locality Filter */}
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              <option value="all">📍 All Locations</option>
              {areas.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              <option value="all">All Stages</option>
              <option value="new">New Request</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">Site Visit Scheduled</option>
              <option value="closed_won">Deal Completed</option>
              <option value="closed_lost">Not Interested</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              <option value="newest">🕒 Newest First</option>
              <option value="oldest">⌛ Oldest First</option>
              <option value="name">🔤 Customer Name</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/60">
          {[
            { id: 'all', label: `All Requests (${totalCount})` },
            { id: 'buy', label: `Buying Property (${buyCount})` },
            { id: 'sell', label: `Selling Property (${sellCount})` },
            { id: 'partner', label: `Property Partners (${partnerCount})` },
            { id: 'contact', label: `General Help (${contactCount})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === cat.id
                  ? 'bg-navy text-gold shadow-xs'
                  : 'text-text-muted hover:text-navy hover:bg-bg'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ══════════ RESTRUCTURED LUXURY TABLE (REQUIRED CONTENT ONLY) ══════════ */}
      <div className="rounded-3xl bg-surface border border-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-bg/40">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-navy">
              Customer Inquiries
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-navy/10 text-navy">
              {filteredLeads.length} showing
            </span>
          </div>
          <span className="text-2xs text-text-muted font-medium">
            Click any row or &quot;View Details&quot; to inspect full customer dossier
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-border bg-bg/60 text-2xs uppercase tracking-wider font-extrabold text-text-secondary">
                <th className="py-3.5 px-5">Inquiry ID & Date</th>
                <th className="py-3.5 px-5">Customer Name & Contact</th>
                <th className="py-3.5 px-5">Interested Property & Area</th>
                <th className="py-3.5 px-5">Budget / Price</th>
                <th className="py-3.5 px-5">Current Stage</th>
                <th className="py-3.5 px-5 text-right">Connect Directly</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-muted">
                    <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-gold" />
                    Loading customer inquiries...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-secondary">
                    <RiFileList3Line className="text-3xl mx-auto mb-2 text-text-muted opacity-50" />
                    <p className="font-semibold text-navy">No inquiries found matching your filters</p>
                    <p className="text-2xs text-text-muted mt-1">
                      Try choosing &quot;All Locations&quot; or clearing the search box.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const refId = lead.referenceId || `ZJ-${lead._id?.slice(-6)?.toUpperCase()}`;
                  const name = lead.contact?.name || lead.name || lead.fullName || 'Customer';
                  const mobile = lead.contact?.mobile || lead.phone || lead.mobile || 'N/A';
                  const isPartner = lead.category === 'partner' || Boolean(lead.partnerType);
                  const isSell = lead.category === 'sell';
                  const categoryTag = isPartner ? 'Partner' : isSell ? 'Sell Property' : 'Buy Property';
                  const propType = lead.propertyType || lead.buyDetails?.propertyType || (isPartner ? lead.partnerType || 'Partner' : 'Property');
                  const location = lead.location || lead.locality || lead.address || lead.buyDetails?.preferredLocations?.[0] || 'Indore';
                  const budget = lead.budget || lead.amount || lead.buyDetails?.budgetMax || '';
                  const status = lead.status || 'new';
                  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;

                  return (
                    <tr
                      key={lead._id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-gold/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Inquiry ID & Date */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-navy group-hover:text-gold transition-colors text-[11px]">
                            {refId}
                          </span>
                          <button
                            onClick={(e) => handleCopyRef(refId, e)}
                            title="Copy ID"
                            className="p-1 rounded hover:bg-gold/15 text-text-muted hover:text-gold transition-colors"
                          >
                            {copiedRef === refId ? (
                              <RiCheckLine className="text-xs text-emerald-600" />
                            ) : (
                              <RiFileCopyLine className="text-xs" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-gold/10 text-gold border border-gold/30">
                            {categoryTag}
                          </span>
                          <span className="text-[10px] text-text-muted font-medium">
                            {new Date(lead.createdAt || Date.now()).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Customer Profile */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy text-[12px] group-hover:translate-x-0.5 transition-transform">
                            {name}
                          </span>
                          {lead.mobileVerified && (
                            <span title="Phone Verified" className="text-emerald-600 text-xs">
                              <RiShieldCheckLine />
                            </span>
                          )}
                        </div>
                        <a
                          href={`tel:${mobile}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] text-text-muted font-medium hover:text-gold transition-colors inline-block mt-0.5"
                        >
                          +91 {mobile}
                        </a>
                      </td>

                      {/* Interested Property & Area */}
                      <td className="py-4 px-5 text-navy">
                        <div className="font-bold text-[11px] capitalize truncate max-w-[200px]">
                          {propType}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-text-secondary mt-0.5">
                          <RiMapPinLine className="text-gold text-xs shrink-0" />
                          <span className="truncate max-w-[180px]">{location}</span>
                        </div>
                      </td>

                      {/* Budget / Price */}
                      <td className="py-4 px-5">
                        <span className="font-display font-black text-navy text-[11px]">
                          {budget ? formatBudgetDisplay(budget) : isPartner ? 'Registered Partner' : 'Flexible'}
                        </span>
                      </td>

                      {/* Interactive Stage Selector */}
                      <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={status}
                          disabled={statusChangingId === lead._id}
                          onChange={(e) => handleQuickStatusChange(lead._id, e.target.value, e)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border cursor-pointer transition-all ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border} focus:outline-none`}
                        >
                          <option value="new">New Request</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">Site Visit</option>
                          <option value="closed_won">Deal Completed</option>
                          <option value="closed_lost">Not Interested</option>
                        </select>
                      </td>

                      {/* Connect Directly Actions */}
                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getWhatsAppLink(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <RiWhatsappLine className="text-sm" />
                          </a>

                          <a
                            href={`tel:${mobile}`}
                            title="Call Customer"
                            className="p-2 rounded-xl bg-navy/5 text-navy hover:bg-navy hover:text-gold transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <RiPhoneLine className="text-sm" />
                          </a>

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 rounded-xl bg-navy text-gold text-[10px] font-extrabold hover:bg-navy-light cursor-pointer transition-colors shadow-2xs"
                          >
                            View Details
                          </button>

                          <button
                            onClick={(e) => handleDeleteLead(lead._id, name, e)}
                            title="Delete"
                            className="p-1.5 rounded-xl bg-bg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-border"
                          >
                            <RiDeleteBin6Line className="text-sm" />
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

      {/* ══════════ FULL-WIDTH LUXURY LEAD DETAIL MODAL ══════════ */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateSuccess={fetchLeads}
        />
      )}
    </div>
  );
};

export default Leads;
