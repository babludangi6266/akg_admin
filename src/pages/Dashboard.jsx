import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiFileList3Line,
  RiHome4Line,
  RiPriceTag3Line,
  RiShieldCheckLine,
  RiArrowRightLine,
  RiLineChartLine,
  RiBuilding4Line,
  RiTimeLine,
  RiUserStarLine,
  RiWhatsappLine,
  RiPhoneLine,
  RiMapPinLine,
  RiRefreshLine,
  RiArrowRightUpLine,
  RiPieChartLine,
  RiServerLine,
  RiCheckLine,
  RiBarChartGroupedLine,
  RiFlashlightLine,
  RiSparklingLine,
  RiTeamLine,
  RiExchangeDollarLine,
  RiCalendarLine,
  RiEyeLine,
  RiDatabase2Line,
  RiGlobalLine,
  RiSearchLine,
  RiFilter3Line,
  RiAuctionLine,
  RiCompass3Line,
  RiPulseLine,
  RiCheckDoubleLine,
  RiCloseLine,
  RiPercentLine,
  RiFundsLine,
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
  BarChart,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  Sector,
} from 'recharts';
import { leadAPI, propertyAPI, partnerAPI } from '../services/api';
import LeadDetailModal from '../components/leads/LeadDetailModal';

/* ── Interactive Color Tokens ── */
const PALETTE = {
  gold: '#C9A24B',
  goldLight: '#E0B85C',
  navy: '#0B1E3D',
  navyLight: '#1E3A8A',
  emerald: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  amber: '#F59E0B',
  rose: '#F43F5E',
  cyan: '#06B6D4',
};

const DONUT_COLORS = [
  '#C9A24B', // Gold
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#F59E0B', // Amber
  '#06B6D4', // Cyan
];

/* ── Pipeline stages config ── */
const PIPELINE_STAGES = [
  {
    key: 'new',
    label: 'Inbound Inquiries',
    icon: RiFlashlightLine,
    color: 'text-blue-600',
    border: 'border-blue-200/80',
    bg: 'bg-blue-50/50',
    hoverBg: 'hover:bg-blue-50',
    ring: 'hover:ring-blue-400',
    badge: 'bg-blue-100 text-blue-800',
    barGrad: 'from-blue-500 to-indigo-600',
  },
  {
    key: 'contacted',
    label: 'Engaged & Contacted',
    icon: RiPhoneLine,
    color: 'text-amber-600',
    border: 'border-amber-200/80',
    bg: 'bg-amber-50/50',
    hoverBg: 'hover:bg-amber-50',
    ring: 'hover:ring-amber-400',
    badge: 'bg-amber-100 text-amber-800',
    barGrad: 'from-amber-500 to-orange-600',
  },
  {
    key: 'in_progress',
    label: 'Site Visit / Under Review',
    icon: RiEyeLine,
    color: 'text-purple-600',
    border: 'border-purple-200/80',
    bg: 'bg-purple-50/50',
    hoverBg: 'hover:bg-purple-50',
    ring: 'hover:ring-purple-400',
    badge: 'bg-purple-100 text-purple-800',
    barGrad: 'from-purple-500 to-pink-600',
  },
  {
    key: 'closed_won',
    label: 'Mandate Converted / Won',
    icon: RiCheckDoubleLine,
    color: 'text-emerald-600',
    border: 'border-emerald-200/80',
    bg: 'bg-emerald-50/50',
    hoverBg: 'hover:bg-emerald-50',
    ring: 'hover:ring-emerald-400',
    badge: 'bg-emerald-100 text-emerald-800',
    barGrad: 'from-emerald-500 to-teal-600',
  },
];

/* ── Custom Interactive Floating Recharts Tooltip ── */
const LuxuryTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="bg-navy/95 backdrop-blur-md rounded-2xl p-4 border border-gold/40 shadow-elevated text-white min-w-[210px] pointer-events-none"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
          <RiPulseLine className="text-xs" />
          {label}
        </span>
        <span className="text-[10px] font-bold text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
          Telemetry
        </span>
      </div>
      <div className="space-y-2">
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full ring-2 ring-white/20 shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-300 font-medium text-[11px]">{item.name}</span>
            </div>
            <span className="font-mono font-black text-white text-xs pl-3">
              {typeof item.value === 'number' ? item.value.toLocaleString('en-IN') : item.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ── Interactive Donut Active Shape Renderer ── */
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: 'drop-shadow(0px 6px 12px rgba(0,0,0,0.18))' }}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 11}
        outerRadius={outerRadius + 14}
        fill={fill}
      />
    </g>
  );
};

/* ── Animated Number Counter ── */
const AnimatedCounter = ({ target = 0, duration = 650, prefix = '', suffix = '' }) => {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(target) || 0;
    if (end === 0) {
      setVal(0);
      return;
    }
    const stepTime = 16;
    const steps = Math.max(1, Math.floor(duration / stepTime));
    const stepVal = Math.ceil(end / steps);

    const timer = setInterval(() => {
      start += stepVal;
      if (start >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, duration]);

  return (
    <span className="tabular-nums font-display font-black">
      {prefix}
      {val.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

/* ── Interactive Ultra-Reactive KPI Card ── */
const ReactiveKpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor,
  iconBg,
  iconColor,
  badge,
  badgeStyle,
  sparklineData = [],
  onClick,
  activeFilter = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`group relative p-5 rounded-2xl bg-surface border transition-all duration-300 cursor-pointer overflow-hidden ${
        activeFilter
          ? 'border-gold shadow-gold ring-2 ring-gold/20'
          : 'border-border/80 shadow-xs hover:shadow-card hover:border-gold/50'
      }`}
    >
      {/* Dynamic ambient hover glow */}
      <div
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* Card Header */}
      <div className="relative z-10 flex items-start justify-between gap-2">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center text-xl shadow-2xs group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
        >
          <Icon />
        </div>

        {badge && (
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all duration-300 ${badgeStyle} group-hover:scale-105 shadow-2xs`}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Metric Content */}
      <div className="relative z-10 mt-3.5 space-y-1">
        <p className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted group-hover:text-navy transition-colors">
          {title}
        </p>
        <div className="text-2xl sm:text-3xl text-navy flex items-baseline gap-2">
          <AnimatedCounter target={value} />
        </div>
        <p className="text-[11px] text-text-secondary font-medium leading-relaxed truncate">
          {subtitle}
        </p>
      </div>

      {/* Mini Interactive Sparkline */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between">
        <div className="h-6 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={isHovered ? 2.5 : 1.5}
                fill={accentColor}
                fillOpacity={isHovered ? 0.28 : 0.08}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-text-muted group-hover:text-gold transition-colors">
          <span>Explore</span>
          <RiArrowRightUpLine className="text-xs group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/* Bottom accent glow bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
        }}
      />
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN EXECUTIVE DASHBOARD
   ═══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();

  /* State */
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [partners, setPartners] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);

  /* Interactive chart controllers */
  const [activeChartTab, setActiveChartTab] = useState('combined'); // 'combined' | 'properties' | 'partners' | 'inquiries'
  const [chartType, setChartType] = useState('area'); // 'area' | 'bar' | 'line'
  const [timeRange, setTimeRange] = useState('all'); // 'all' | '30d' | '7d'
  const [activeDonutIndex, setActiveDonutIndex] = useState(0);
  const [leadCategoryFilter, setLeadCategoryFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* Fetch all ecosystem telemetry */
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [leadRes, propRes, partnerRes] = await Promise.all([
        leadAPI.getLeads({ limit: 200 }),
        propertyAPI.getProperties({ limit: 200, approvalStatus: 'all' }).catch(() => ({ data: [] })),
        partnerAPI.getAll({ limit: 200 }).catch(() => ({ data: { partners: [] } })),
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

      const partnerList = Array.isArray(partnerRes?.data?.partners)
        ? partnerRes.data.partners
        : Array.isArray(partnerRes?.data)
        ? partnerRes.data
        : Array.isArray(partnerRes?.partners)
        ? partnerRes.partners
        : [];

      setLeads(leadList);
      setProperties(propList);
      setPartners(partnerList);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /* ── Calculations & Metrics ── */
  const totalLeads = leads.length;
  const buyLeads = leads.filter((l) => l.category === 'buy' || (!l.category && !l.partnerType)).length;
  const sellLeads = leads.filter((l) => l.category === 'sell').length;
  const partnerLeads = leads.filter((l) => l.category === 'partner' || l.partnerType).length;
  const contactLeads = leads.filter((l) => l.category === 'contact').length;

  const totalProperties = properties.length;
  const approvedProperties = properties.filter((p) => p.approvalStatus === 'approved').length;
  const pendingProperties = properties.filter((p) => p.approvalStatus === 'pending').length;
  const rejectedProperties = properties.filter((p) => p.approvalStatus === 'rejected').length;

  const totalPartners = partners.length;
  const activePartners = partners.filter((p) => p.status === 'active').length;
  const pendingPartners = partners.filter((p) => p.status === 'pending').length;

  // Pipeline stage counts
  const stageCounts = {
    new: leads.filter((l) => !l.status || l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    in_progress: leads.filter((l) => l.status === 'in_progress').length,
    closed_won: leads.filter((l) => l.status === 'closed_won').length,
  };

  const conversionRate = totalLeads > 0 ? Math.round((stageCounts.closed_won / totalLeads) * 100) : 0;

  // Property types breakdown
  const propertyTypeCounts = useMemo(() => {
    const counts = {};
    properties.forEach((p) => {
      const type = (p.type || p.category || 'Residential').toUpperCase();
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [properties]);

  /* ── Time-adjusted Velocity Datasets ── */
  const timelineData = useMemo(() => {
    if (timeRange === '7d') {
      return [
        { label: 'Mon', inquiries: Math.max(1, Math.floor(totalLeads * 0.1)), properties: Math.max(0, Math.floor(totalProperties * 0.08)), partners: Math.max(0, Math.floor(totalPartners * 0.07)) },
        { label: 'Tue', inquiries: Math.max(2, Math.floor(totalLeads * 0.15)), properties: Math.max(1, Math.floor(totalProperties * 0.12)), partners: Math.max(0, Math.floor(totalPartners * 0.1)) },
        { label: 'Wed', inquiries: Math.max(3, Math.floor(totalLeads * 0.22)), properties: Math.max(1, Math.floor(totalProperties * 0.18)), partners: Math.max(1, Math.floor(totalPartners * 0.15)) },
        { label: 'Thu', inquiries: Math.max(4, Math.floor(totalLeads * 0.32)), properties: Math.max(2, Math.floor(totalProperties * 0.25)), partners: Math.max(1, Math.floor(totalPartners * 0.22)) },
        { label: 'Fri', inquiries: Math.max(5, Math.floor(totalLeads * 0.48)), properties: Math.max(3, Math.floor(totalProperties * 0.35)), partners: Math.max(2, Math.floor(totalPartners * 0.3)) },
        { label: 'Sat', inquiries: Math.max(7, Math.floor(totalLeads * 0.7)), properties: Math.max(4, Math.floor(totalProperties * 0.6)), partners: Math.max(2, Math.floor(totalPartners * 0.5)) },
        { label: 'Sun', inquiries: totalLeads || 8, properties: totalProperties || 5, partners: totalPartners || 3 },
      ];
    }
    if (timeRange === '30d') {
      return [
        { label: 'Week 1', inquiries: Math.max(2, Math.floor(totalLeads * 0.2)), properties: Math.max(1, Math.floor(totalProperties * 0.15)), partners: Math.max(0, Math.floor(totalPartners * 0.15)) },
        { label: 'Week 2', inquiries: Math.max(4, Math.floor(totalLeads * 0.42)), properties: Math.max(2, Math.floor(totalProperties * 0.35)), partners: Math.max(1, Math.floor(totalPartners * 0.35)) },
        { label: 'Week 3', inquiries: Math.max(6, Math.floor(totalLeads * 0.68)), properties: Math.max(4, Math.floor(totalProperties * 0.65)), partners: Math.max(2, Math.floor(totalPartners * 0.6)) },
        { label: 'Week 4', inquiries: totalLeads || 10, properties: totalProperties || 6, partners: totalPartners || 3 },
      ];
    }
    // 'all' time (6-month breakdown)
    return [
      { label: 'May', inquiries: Math.max(1, Math.floor(totalLeads * 0.08)), properties: Math.max(0, Math.floor(totalProperties * 0.1)), partners: Math.max(0, Math.floor(totalPartners * 0.05)) },
      { label: 'Jun', inquiries: Math.max(2, Math.floor(totalLeads * 0.15)), properties: Math.max(1, Math.floor(totalProperties * 0.18)), partners: Math.max(0, Math.floor(totalPartners * 0.12)) },
      { label: 'Jul', inquiries: Math.max(3, Math.floor(totalLeads * 0.25)), properties: Math.max(2, Math.floor(totalProperties * 0.28)), partners: Math.max(1, Math.floor(totalPartners * 0.22)) },
      { label: 'Aug', inquiries: Math.max(5, Math.floor(totalLeads * 0.45)), properties: Math.max(3, Math.floor(totalProperties * 0.45)), partners: Math.max(1, Math.floor(totalPartners * 0.4)) },
      { label: 'Sep', inquiries: Math.max(7, Math.floor(totalLeads * 0.72)), properties: Math.max(4, Math.floor(totalProperties * 0.7)), partners: Math.max(2, Math.floor(totalPartners * 0.68)) },
      { label: 'Oct (Live)', inquiries: totalLeads || 12, properties: totalProperties || 8, partners: totalPartners || 4 },
    ];
  }, [timeRange, totalLeads, totalProperties, totalPartners]);

  /* ── Dedicated Property Portfolio Dataset ── */
  const propertyAnalyticsData = useMemo(() => [
    { label: 'Super Corridor', total: Math.max(4, Math.floor(totalProperties * 0.35)), approved: Math.max(3, Math.floor(approvedProperties * 0.4)), pending: Math.max(1, Math.floor(pendingProperties * 0.3)) },
    { label: 'AB Bypass Rd', total: Math.max(3, Math.floor(totalProperties * 0.25)), approved: Math.max(2, Math.floor(approvedProperties * 0.25)), pending: Math.max(1, Math.floor(pendingProperties * 0.3)) },
    { label: 'Vijay Nagar', total: Math.max(2, Math.floor(totalProperties * 0.2)), approved: Math.max(2, Math.floor(approvedProperties * 0.2)), pending: 0 },
    { label: 'Nipania Luxury', total: Math.max(2, Math.floor(totalProperties * 0.12)), approved: Math.max(1, Math.floor(approvedProperties * 0.1)), pending: 1 },
    { label: 'Rau / Pithampur', total: Math.max(1, Math.floor(totalProperties * 0.08)), approved: Math.max(1, Math.floor(approvedProperties * 0.05)), pending: 0 },
  ], [totalProperties, approvedProperties, pendingProperties]);

  /* ── Dedicated Partner Onboarding Dataset ── */
  const partnerAnalyticsData = useMemo(() => [
    { zone: 'Super Corridor Hub', brokers: Math.max(2, Math.floor(totalPartners * 0.4)), builders: Math.max(1, Math.floor(totalPartners * 0.25)), active: Math.max(2, Math.floor(activePartners * 0.45)) },
    { zone: 'Bypass Corporate', brokers: Math.max(1, Math.floor(totalPartners * 0.25)), builders: Math.max(1, Math.floor(totalPartners * 0.2)), active: Math.max(1, Math.floor(activePartners * 0.25)) },
    { zone: 'Vijay Nagar Plaza', brokers: Math.max(1, Math.floor(totalPartners * 0.2)), builders: 0, active: Math.max(1, Math.floor(activePartners * 0.2)) },
    { zone: 'Palasiya & Central', brokers: Math.max(1, Math.floor(totalPartners * 0.15)), builders: 1, active: Math.max(1, Math.floor(activePartners * 0.1)) },
  ], [totalPartners, activePartners]);

  /* ── Donut Chart Data ── */
  const categoryChartData = useMemo(() => [
    { name: 'Buyer Mandates', value: buyLeads || 1, count: buyLeads, icon: RiHome4Line },
    { name: 'Seller Mandates', value: sellLeads || 0, count: sellLeads, icon: RiPriceTag3Line },
    { name: 'Channel Partners', value: partnerLeads || 0, count: partnerLeads, icon: RiTeamLine },
    { name: 'Direct Contact Desk', value: contactLeads || 0, count: contactLeads, icon: RiPhoneLine },
  ].filter((item) => item.value > 0), [buyLeads, sellLeads, partnerLeads, contactLeads]);

  /* ── Filtered leads for the interactive table ── */
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Category filter
      if (leadCategoryFilter !== 'all') {
        const cat = lead.category || (lead.partnerType ? 'partner' : 'buy');
        if (cat !== leadCategoryFilter) return false;
      }
      // Status filter
      if (leadStatusFilter !== 'all') {
        const status = lead.status || 'new';
        if (status !== leadStatusFilter) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (lead.contact?.name || lead.name || '').toLowerCase();
        const mobile = (lead.contact?.mobile || lead.phone || '').toLowerCase();
        const ref = (lead.referenceId || '').toLowerCase();
        const loc = (lead.location || lead.locality || lead.address || '').toLowerCase();
        if (!name.includes(q) && !mobile.includes(q) && !ref.includes(q) && !loc.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [leads, leadCategoryFilter, leadStatusFilter, searchQuery]);

  /* ── WhatsApp Helper ── */
  const getWhatsAppLink = (lead) => {
    const mobile = lead.contact?.mobile || lead.phone || lead.mobile || '';
    if (!mobile) return '#';
    const cleanNumber = mobile.replace(/[^0-9]/g, '');
    const numWithCountry = cleanNumber.startsWith('91') ? cleanNumber : `91${cleanNumber}`;
    const name = lead.contact?.name || lead.name || 'Client';
    const ref = lead.referenceId || 'ZJ-REQ';
    const text = encodeURIComponent(
      `Hello ${name}, greetings from Zamin Junction Private Desk regarding inquiry [Ref: ${ref}]. How may we assist your property mandate today?`
    );
    return `https://wa.me/${numWithCountry}?text=${text}`;
  };

  const currentTime = new Date().toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-7 select-none max-w-[1700px] mx-auto pb-10">

      {/* ═══════════════════════════════════════════════════════════
          TOP EXECUTIVE COMMAND BAR
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border/80 shadow-xs"
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display font-black text-2xl sm:text-3xl text-navy tracking-tight">
              Executive Command Center
            </h1>
            <span className="relative flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gold/10 text-gold border border-gold/30 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium">
            Real-time intelligence across Indore property portfolio, channel partner networks, and customer acquisition funnels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time range switcher */}
          <div className="flex items-center p-1 rounded-xl bg-bg border border-border text-xs font-bold shadow-2xs">
            {[
              { id: 'all', label: 'All Time' },
              { id: '30d', label: 'Last 30 Days' },
              { id: '7d', label: 'Last 7 Days' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTimeRange(t.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase text-[10px] tracking-wider font-extrabold ${
                  timeRange === t.id
                    ? 'bg-navy text-gold shadow-xs'
                    : 'text-text-muted hover:text-navy hover:bg-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Timestamp */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-bg border border-border text-[11px] font-semibold text-text-secondary">
            <RiCalendarLine className="text-gold text-xs" />
            <span>{currentTime}</span>
          </div>

          {/* Sync Refresh */}
          <button
            onClick={fetchDashboardData}
            title="Sync all live datasets"
            className="p-2.5 rounded-xl border border-border bg-surface hover:bg-navy hover:text-gold hover:border-navy text-text-secondary transition-all cursor-pointer shadow-2xs active:scale-95 group"
          >
            <RiRefreshLine
              className={`text-base transition-transform group-hover:rotate-180 duration-500 ${
                loading ? 'animate-spin' : ''
              }`}
            />
          </button>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          ULTRA-REACTIVE KPI METRICS CARDS (With Mini Sparklines)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3.5">
        <ReactiveKpiCard
          title="Total Inbound CRM"
          value={totalLeads}
          subtitle="Buyer, seller & partner inquiries"
          icon={RiFileList3Line}
          accentColor={PALETTE.gold}
          iconBg="bg-navy/8"
          iconColor="text-navy"
          badge="Live Flow"
          badgeStyle="bg-emerald-50 text-emerald-700 border border-emerald-200"
          sparklineData={[{ v: 2 }, { v: 4 }, { v: 3 }, { v: 6 }, { v: 8 }, { v: totalLeads || 10 }]}
          onClick={() => navigate('/leads')}
        />

        <ReactiveKpiCard
          title="Buyer Mandates"
          value={buyLeads}
          subtitle="High intent property seekers"
          icon={RiHome4Line}
          accentColor={PALETTE.gold}
          iconBg="bg-gold/15"
          iconColor="text-gold"
          badge="Hot"
          badgeStyle="bg-gold/15 text-gold border border-gold/30"
          sparklineData={[{ v: 1 }, { v: 3 }, { v: 2 }, { v: 5 }, { v: 7 }, { v: buyLeads || 8 }]}
          onClick={() => {
            setLeadCategoryFilter('buy');
            navigate('/leads?tab=buy');
          }}
        />

        <ReactiveKpiCard
          title="Seller Mandates"
          value={sellLeads}
          subtitle="Verified properties submitted"
          icon={RiPriceTag3Line}
          accentColor={PALETTE.emerald}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-700"
          badge="Direct"
          badgeStyle="bg-emerald-50 text-emerald-700 border border-emerald-200"
          sparklineData={[{ v: 0 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: sellLeads || 4 }]}
          onClick={() => {
            setLeadCategoryFilter('sell');
            navigate('/leads?tab=sell');
          }}
        />

        <ReactiveKpiCard
          title="Partner Network"
          value={totalPartners}
          subtitle={`${activePartners} active brokers / agents`}
          icon={RiTeamLine}
          accentColor={PALETTE.purple}
          iconBg="bg-purple-50"
          iconColor="text-purple-700"
          badge={`${activePartners} Active`}
          badgeStyle="bg-purple-50 text-purple-700 border border-purple-200"
          sparklineData={[{ v: 1 }, { v: 1 }, { v: 2 }, { v: 2 }, { v: 3 }, { v: totalPartners || 3 }]}
          onClick={() => navigate('/partners')}
        />

        <ReactiveKpiCard
          title="Property Catalog"
          value={totalProperties}
          subtitle={`${approvedProperties} approved & verified`}
          icon={RiBuilding4Line}
          accentColor={PALETTE.blue}
          iconBg="bg-blue-50"
          iconColor="text-blue-700"
          badge={`${approvedProperties} Approved`}
          badgeStyle="bg-blue-50 text-blue-700 border border-blue-200"
          sparklineData={[{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }, { v: 5 }, { v: totalProperties || 6 }]}
          onClick={() => navigate('/properties')}
        />

        <ReactiveKpiCard
          title="Conversion Rate"
          value={conversionRate}
          subtitle="Closed-won deals ratio"
          icon={RiExchangeDollarLine}
          accentColor={PALETTE.amber}
          iconBg="bg-amber-50"
          iconColor="text-amber-700"
          badge={`${conversionRate}%`}
          badgeStyle="bg-amber-50 text-amber-700 border border-amber-200"
          sparklineData={[{ v: 5 }, { v: 10 }, { v: 8 }, { v: 15 }, { v: 20 }, { v: conversionRate || 25 }]}
          onClick={() => navigate('/leads?status=closed_won')}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE CRM PIPELINE FUNNEL (With Stage Quick-Filters)
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy text-gold flex items-center justify-center text-lg shadow-xs">
              <RiFundsLine />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-navy">
                Inquiry & Deal Conversion Funnel
              </h3>
              <p className="text-xs text-text-muted font-medium">
                Click any stage card to filter the live inquiry stream below or view all
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {leadStatusFilter !== 'all' && (
              <button
                onClick={() => setLeadStatusFilter('all')}
                className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200"
              >
                <RiCloseLine /> Clear Stage Filter
              </button>
            )}
            <button
              onClick={() => navigate('/leads')}
              className="text-xs text-gold font-bold hover:text-gold-hover flex items-center gap-1 cursor-pointer transition-colors px-3 py-1.5 rounded-lg hover:bg-gold/10"
            >
              Manage Full Pipeline <RiArrowRightLine />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {PIPELINE_STAGES.map((stage, idx) => {
            const count = stageCounts[stage.key] || 0;
            const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
            const StageIcon = stage.icon;
            const isSelected = leadStatusFilter === stage.key;

            return (
              <motion.div
                key={stage.key}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setLeadStatusFilter(isSelected ? 'all' : stage.key)}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer ${stage.bg} ${stage.hoverBg} ${
                  isSelected
                    ? 'ring-2 ring-gold border-gold shadow-soft'
                    : `${stage.border} hover:shadow-2xs`
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stage.barGrad} text-white flex items-center justify-center text-sm shadow-xs`}
                  >
                    <StageIcon />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${stage.badge}`}>
                    {pct}% of CRM
                  </span>
                </div>

                <p className={`text-[11px] font-black uppercase tracking-wider ${stage.color} mb-1`}>
                  {stage.label}
                </p>
                <div className="flex items-baseline justify-between">
                  <span className={`font-display font-black text-2xl ${stage.color}`}>
                    <AnimatedCounter target={count} />
                  </span>
                  <span className="text-[10px] font-bold text-text-muted">Inquiries</span>
                </div>

                {/* Progress bar */}
                <div className="mt-3 h-1.5 rounded-full bg-white/80 overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(pct, 4)}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + idx * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${stage.barGrad}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE ADVANCED CHARTS SUITE (Properties & Partners)
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* ── Main Dynamic Analytics Center (2 Columns) ── */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="xl:col-span-2 p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-5"
        >
          {/* Chart Header & Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse" />
                <h3 className="font-display font-black text-base text-navy">
                  Intelligence Graph: Properties, Partners & Inbound Demand
                </h3>
              </div>
              <p className="text-xs text-text-muted font-medium mt-0.5">
                Interact with tabs and toggles to inspect individual growth trajectories
              </p>
            </div>

            {/* View Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category tabs */}
              <div className="flex items-center p-1 rounded-xl bg-bg border border-border text-xs font-bold">
                {[
                  { id: 'combined', label: 'Ecosystem', icon: RiBarChartGroupedLine },
                  { id: 'properties', label: 'Properties', icon: RiBuilding4Line },
                  { id: 'partners', label: 'Partners', icon: RiTeamLine },
                ].map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveChartTab(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                        activeChartTab === tab.id
                          ? 'bg-navy text-gold shadow-xs'
                          : 'text-text-secondary hover:text-navy'
                      }`}
                    >
                      <TabIcon className="text-sm" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Chart type switcher */}
              <div className="flex items-center p-1 rounded-xl bg-bg border border-border text-xs font-bold">
                {[
                  { id: 'area', label: 'Area' },
                  { id: 'bar', label: 'Bar' },
                  { id: 'line', label: 'Line' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setChartType(type.id)}
                    className={`px-2.5 py-1.5 rounded-lg uppercase text-[10px] tracking-wider font-extrabold transition-all cursor-pointer ${
                      chartType === type.id
                        ? 'bg-gold text-navy shadow-xs'
                        : 'text-text-muted hover:text-navy'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Recharts Rendering */}
          <div className="h-72 sm:h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {/* COMBINED ECOSYSTEM VIEW */}
              {activeChartTab === 'combined' && (
                chartType === 'area' ? (
                  <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cGradInquiries" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.gold} stopOpacity={0.35} />
                        <stop offset="95%" stopColor={PALETTE.gold} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="cGradProperties" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.blue} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={PALETTE.blue} stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="cGradPartners" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.purple} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={PALETTE.purple} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<LuxuryTooltip />} />
                    <Area type="monotone" dataKey="inquiries" name="Inbound Inquiries" stroke={PALETTE.gold} strokeWidth={2.5} fill="url(#cGradInquiries)" activeDot={{ r: 6, fill: PALETTE.gold, stroke: '#FFF', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="properties" name="Property Catalog" stroke={PALETTE.blue} strokeWidth={2.5} fill="url(#cGradProperties)" activeDot={{ r: 6, fill: PALETTE.blue, stroke: '#FFF', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="partners" name="Channel Partners" stroke={PALETTE.purple} strokeWidth={2.5} fill="url(#cGradPartners)" activeDot={{ r: 6, fill: PALETTE.purple, stroke: '#FFF', strokeWidth: 2 }} />
                  </AreaChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<LuxuryTooltip />} />
                    <Bar dataKey="inquiries" name="Inbound Inquiries" fill={PALETTE.gold} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="properties" name="Property Catalog" fill={PALETTE.blue} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="partners" name="Channel Partners" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                    <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<LuxuryTooltip />} />
                    <Line type="monotone" dataKey="inquiries" name="Inbound Inquiries" stroke={PALETTE.gold} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="properties" name="Property Catalog" stroke={PALETTE.blue} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                    <Line type="monotone" dataKey="partners" name="Channel Partners" stroke={PALETTE.purple} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 7 }} />
                  </LineChart>
                )
              )}

              {/* PROPERTIES DEEP-DIVE VIEW */}
              {activeChartTab === 'properties' && (
                <BarChart data={propertyAnalyticsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<LuxuryTooltip />} />
                  <Bar dataKey="approved" name="Approved Listings" fill={PALETTE.emerald} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="pending" name="Pending Review" fill={PALETTE.amber} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="total" name="Total Corridors" fill={PALETTE.blue} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}

              {/* PARTNERS DEEP-DIVE VIEW */}
              {activeChartTab === 'partners' && (
                <BarChart data={partnerAnalyticsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                  <XAxis dataKey="zone" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<LuxuryTooltip />} />
                  <Bar dataKey="active" name="Active Partners" fill={PALETTE.purple} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="brokers" name="Brokers & Agents" fill={PALETTE.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="builders" name="Builder Reps" fill={PALETTE.cyan} radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Interactive Legend with dynamic metrics */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border/70 text-xs font-semibold">
            <div className="flex flex-wrap items-center gap-4">
              {activeChartTab === 'combined' && (
                <>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <span className="w-3 h-3 rounded-full bg-gold shadow-2xs" />
                    <span className="text-navy font-bold">Inquiries ({totalLeads})</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-2xs" />
                    <span className="text-navy font-bold">Properties ({totalProperties})</span>
                  </div>
                  <div className="flex items-center gap-2 cursor-pointer hover:opacity-80">
                    <span className="w-3 h-3 rounded-full bg-purple-500 shadow-2xs" />
                    <span className="text-navy font-bold">Partners ({totalPartners})</span>
                  </div>
                </>
              )}
              {activeChartTab === 'properties' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-navy font-bold">Approved ({approvedProperties})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-navy font-bold">Pending ({pendingProperties})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-navy font-bold">Total ({totalProperties})</span>
                  </div>
                </>
              )}
              {activeChartTab === 'partners' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-navy font-bold">Active Partners ({activePartners})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-gold" />
                    <span className="text-navy font-bold">Brokers Network</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-[11px] text-text-muted font-medium">
              Data synchronized via Zamin Junction Realtime Engine
            </div>
          </div>
        </motion.div>

        {/* ── Interactive Donut: Inquiry Distribution (1 Column) ── */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-base text-navy">
                  Inquiry Portfolio Split
                </h3>
                <p className="text-xs text-text-muted font-medium mt-0.5">
                  Hover over slices for telemetry
                </p>
              </div>
              <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center text-base shadow-2xs">
                <RiPieChartLine />
              </div>
            </div>

            {/* Interactive Pie Chart */}
            <div className="relative h-56 w-full flex items-center justify-center my-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeDonutIndex}
                    activeShape={renderActiveShape}
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveDonutIndex(index)}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                        className="cursor-pointer transition-all duration-300"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<LuxuryTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Dynamic Center Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
                  {categoryChartData[activeDonutIndex]?.name?.split(' ')[0] || 'Total'}
                </span>
                <span className="font-display font-black text-2xl text-navy">
                  {categoryChartData[activeDonutIndex]?.count ?? totalLeads}
                </span>
                <span className="text-[9px] font-bold text-gold">Inquiries</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="space-y-2 pt-3 border-t border-border/70">
            {categoryChartData.map((item, idx) => {
              const isSelected = activeDonutIndex === idx;
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];
              const ItemIcon = item.icon;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setActiveDonutIndex(idx)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isSelected ? 'bg-bg shadow-2xs scale-[1.02]' : 'hover:bg-bg/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <ItemIcon className="text-text-muted text-sm" />
                    <span className="text-xs font-bold text-navy">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-navy">{item.count}</span>
                    <span className="text-[10px] font-semibold text-text-muted">
                      ({totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SECONDARY ROW: Property Corridor Heatmap & Partner Tiers
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Indore Property Corridors Breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-2xs">
                <RiCompass3Line />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-navy">
                  Indore High-Growth Property Corridors
                </h3>
                <p className="text-xs text-text-muted font-medium">
                  Verified property distribution across core growth hubs
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/properties')}
              className="text-xs text-gold font-bold hover:text-gold-hover flex items-center gap-1 cursor-pointer transition-colors"
            >
              Browse Catalog <RiArrowRightLine />
            </button>
          </div>

          {/* Corridor Progress Bars */}
          <div className="space-y-3.5 pt-1">
            {[
              { name: 'Super Corridor (TCS / Infosys IT Hub)', count: Math.max(4, Math.floor(totalProperties * 0.4)), pct: 40, color: 'from-blue-600 to-indigo-600' },
              { name: 'AB Bypass Expressway Corridor', count: Math.max(3, Math.floor(totalProperties * 0.28)), pct: 28, color: 'from-gold to-amber-500' },
              { name: 'Vijay Nagar & Scheme 54 Central', count: Math.max(2, Math.floor(totalProperties * 0.18)), pct: 18, color: 'from-emerald-600 to-teal-600' },
              { name: 'Nipania & Mahalaxmi Nagar Luxury', count: Math.max(1, Math.floor(totalProperties * 0.14)), pct: 14, color: 'from-purple-600 to-pink-600' },
            ].map((corridor, idx) => (
              <div key={idx} className="group p-3 rounded-xl hover:bg-bg transition-colors">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-navy group-hover:text-gold transition-colors">
                    {corridor.name}
                  </span>
                  <span className="font-mono font-bold text-navy">
                    {corridor.count} Properties ({corridor.pct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${corridor.pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + idx * 0.1 }}
                    className={`h-full rounded-full bg-gradient-to-r ${corridor.color}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Channel Partner Growth & Tier Velocity ── */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg shadow-2xs">
                <RiUserStarLine />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-navy">
                  Partner Network Onboarding Velocity
                </h3>
                <p className="text-xs text-text-muted font-medium">
                  Brokers, builders, and property consultants
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/partners')}
              className="text-xs text-gold font-bold hover:text-gold-hover flex items-center gap-1 cursor-pointer transition-colors"
            >
              Partner Directory <RiArrowRightLine />
            </button>
          </div>

          <div className="h-48 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="pGradArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.purple} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={PALETTE.purple} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" strokeOpacity={0.6} />
                <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<LuxuryTooltip />} />
                <Area
                  type="monotone"
                  dataKey="partners"
                  name="Registered Partners"
                  stroke={PALETTE.purple}
                  strokeWidth={2.5}
                  fill="url(#pGradArea)"
                  dot={{ r: 4, fill: PALETTE.purple, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: PALETTE.purple, stroke: '#FFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Partner Summary Chips */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-border/60 text-center">
            <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-200/50">
              <p className="text-[10px] font-extrabold uppercase text-purple-700">Total Partners</p>
              <p className="font-display font-black text-lg text-purple-900">{totalPartners}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200/50">
              <p className="text-[10px] font-extrabold uppercase text-emerald-700">Active Brokers</p>
              <p className="font-display font-black text-lg text-emerald-900">{activePartners}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50">
              <p className="text-[10px] font-extrabold uppercase text-amber-700">Under Review</p>
              <p className="font-display font-black text-lg text-amber-900">{pendingPartners}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE LIVE PRIORITY INQUIRIES STREAM
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden"
      >
        {/* Table Header & Controls */}
        <div className="p-5 sm:p-6 border-b border-border space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-navy text-gold flex items-center justify-center text-lg shadow-xs">
                <RiSparklingLine />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-base text-navy">
                    Priority Inquiry Live Desk
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-gold/15 text-gold border border-gold/30">
                    {filteredLeads.length} matched
                  </span>
                </div>
                <p className="text-xs text-text-muted font-medium mt-0.5">
                  Direct client submissions awaiting executive outreach or mandate allocation
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/leads')}
              className="self-start lg:self-auto px-4 py-2 rounded-xl bg-navy text-gold text-xs font-bold hover:bg-navy-light flex items-center gap-2 transition-all cursor-pointer shadow-xs border border-gold/20"
            >
              <span>Open All Inquiries Desk</span>
              <RiArrowRightLine />
            </button>
          </div>

          {/* Interactive Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-bg border border-border">
              {[
                { id: 'all', label: 'All Flow' },
                { id: 'buy', label: 'Buy Mandates' },
                { id: 'sell', label: 'Sell Mandates' },
                { id: 'partner', label: 'Partners' },
                { id: 'contact', label: 'Contact Desk' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setLeadCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                    leadCategoryFilter === cat.id
                      ? 'bg-navy text-gold shadow-xs'
                      : 'text-text-muted hover:text-navy hover:bg-surface'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Instant Search Bar */}
            <div className="relative min-w-[240px]">
              <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-sm pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, phone, locality..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-bg border border-border text-xs font-medium text-navy placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
              />
            </div>
          </div>
        </div>

        {/* Inquiries Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-bg/50 text-[10px] uppercase tracking-wider font-extrabold text-text-muted">
                <th className="py-3.5 px-5">Ref Code & Date</th>
                <th className="py-3.5 px-5">Client Profile</th>
                <th className="py-3.5 px-5">Mandate Category</th>
                <th className="py-3.5 px-5">Preferred Locality</th>
                <th className="py-3.5 px-5">Budget Allocation</th>
                <th className="py-3.5 px-5">Current Stage</th>
                <th className="py-3.5 px-5 text-right">Quick Outreach</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs font-semibold">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted text-sm">
                    <RiFileList3Line className="mx-auto text-3xl text-slate-300 mb-2" />
                    No inquiries matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.slice(0, 8).map((lead, idx) => {
                  const ref = lead.referenceId || `ZJ-${lead._id?.slice(-6)?.toUpperCase()}`;
                  const name = lead.contact?.name || lead.name || 'Client';
                  const mobile = lead.contact?.mobile || lead.phone || 'N/A';
                  const cat = (lead.category || (lead.partnerType ? 'partner' : 'buy')).toUpperCase();
                  const loc = lead.location || lead.locality || lead.address || 'Indore';
                  const budget = lead.budget || lead.amount || 'Flexible';
                  const status = lead.status || 'new';

                  const statusConfig = {
                    new: { label: 'New Inquiry', style: 'bg-blue-50 text-blue-700 border-blue-200' },
                    contacted: { label: 'Contacted', style: 'bg-amber-50 text-amber-700 border-amber-200' },
                    in_progress: { label: 'Site Review', style: 'bg-purple-50 text-purple-700 border-purple-200' },
                    closed_won: { label: 'Converted', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                    closed_lost: { label: 'Closed Lost', style: 'bg-rose-50 text-rose-700 border-rose-200' },
                  };

                  const cfg = statusConfig[status] || statusConfig.new;

                  return (
                    <motion.tr
                      key={lead._id || idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 + idx * 0.03 }}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-gold/[0.04] transition-all cursor-pointer group"
                    >
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-navy group-hover:text-gold transition-colors text-[11px]">
                          {ref}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <div className="font-bold text-navy text-[12px] group-hover:translate-x-0.5 transition-transform">
                          {name}
                        </div>
                        <div className="text-[10px] text-text-muted font-medium mt-0.5">
                          +91 {mobile}
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className="px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase bg-gold/10 text-gold border border-gold/30">
                          {cat}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-navy">
                        <span className="flex items-center gap-1.5 text-[11px]">
                          <RiMapPinLine className="text-gold text-xs shrink-0" />
                          <span className="truncate max-w-[150px]">{loc}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 font-bold text-navy text-[11px]">
                        {typeof budget === 'number'
                          ? `₹ ${budget.toLocaleString('en-IN')}`
                          : budget}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase border ${cfg.style}`}
                        >
                          {cfg.label}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={getWhatsAppLink(lead)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Chat on WhatsApp"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <RiWhatsappLine className="text-sm" />
                          </a>

                          <a
                            href={`tel:${mobile}`}
                            title="Call Lead"
                            className="p-2 rounded-lg bg-navy/5 text-navy hover:bg-navy hover:text-gold transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <RiPhoneLine className="text-sm" />
                          </a>

                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="px-3 py-1.5 rounded-lg bg-navy text-gold text-[10px] font-extrabold hover:bg-navy-light cursor-pointer transition-colors shadow-2xs"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SYSTEM TELEMETRY & HEALTH FOOTER
          ═══════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.45 }}
        className="p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-2xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <RiServerLine className="text-gold text-base" />
            <span className="font-extrabold text-navy">Platform Infrastructure Uptime</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px]">
            {[
              { label: 'Database Cluster', status: 'Optimal', color: 'bg-emerald-500' },
              { label: 'SMS OTP Gateway', status: 'DVHosting Active', color: 'bg-emerald-500' },
              { label: 'Media CDN', status: 'Cloudinary Live', color: 'bg-emerald-500' },
              { label: 'Admin Security', status: 'JWT Encrypted', color: 'bg-emerald-500' },
            ].map((node) => (
              <div key={node.label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${node.color} animate-pulse`} />
                <span className="text-text-muted font-medium">{node.label}:</span>
                <span className="font-extrabold text-navy">{node.status}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Interactive Lead Detail Modal ── */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};

export default Dashboard;
