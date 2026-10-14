import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RiBuilding4Line,
  RiAddLine,
  RiSearchLine,
  RiMapPinLine,
  RiCheckLine,
  RiCloseLine,
  RiHome4Line,
  RiEditLine,
  RiDeleteBin6Line,
  RiRefreshLine,
  RiCompass3Line,
  RiUserStarLine,
  RiWhatsappLine,
  RiPhoneLine,
  RiImageLine,
} from 'react-icons/ri';
import { propertyAPI, areaAPI } from '../services/api';
import {
  PROPERTY_TAXONOMY,
  ALL_PROPERTY_TYPES,
  getParentCategory,
  getTypeLabel,
  isPlotOrLand,
  isCommercial,
  isResidential,
  shouldShowBhk,
  shouldShowFurnishing,
  shouldShowFloor,
} from '../constants/propertyTaxonomy';

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

const PROPERTY_TYPES = [
  { value: 'apartment', label: 'Apartment / Flat' },
  { value: 'villa', label: 'Luxury Villa' },
  { value: 'plot', label: 'Gated Plot / Land' },
  { value: 'commercial', label: 'Commercial Space / Office' },
  { value: 'independent_house', label: 'Independent House / Kothi' },
];

const PREDEFINED_AMENITIES = [
  'Rooftop Infinity Pool',
  'Modern Gymnasium',
  'Clubhouse & Banquet Hall',
  'Reserved Covered Parking',
  '24/7 Multi-tier Security & CCTV',
  'High-speed Elevators',
  '100% Power Backup',
  'Landscaped Podium Garden',
  'Children Play Area',
  'EV Charging Station',
  'Fire Fighting System',
  'Gated Community',
];

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Apartment', file: 'Apartment.jpeg', url: '/images/Apartment.jpeg' },
  { label: 'House', file: 'house.jpeg', url: '/images/house.jpeg' },
  { label: 'Land', file: 'land.jpeg', url: '/images/land.jpeg' },
  { label: 'Plot', file: 'plot.jpeg', url: '/images/plot.jpeg' },
  { label: 'Villa', file: 'villa.jpeg', url: '/images/villa.jpeg' },
];

const initialFormState = {
  title: '',
  parentCategory: 'residential',
  category: 'buy',
  type: 'apartment_flat',
  price: '',
  dealBadge: 'Direct Developer Mandate',
  status: 'active',
  approvalStatus: 'approved',
  featured: false,
  showOnHome: false,
  locality: 'Vijay Nagar',
  address: '',
  city: 'Indore',
  state: 'Madhya Pradesh',
  pincode: '452010',
  bhk: '3',
  carpetArea: '',
  plotArea: '',
  furnishing: 'fully_furnished',
  facing: 'east',
  ageOfProperty: 'less_than_1_year',
  amenities: ['24/7 Multi-tier Security & CCTV', '100% Power Backup', 'Reserved Covered Parking'],
  highlights: ['Prime Indore Corridor', 'Verified Legal Title', 'RERA Approved'],
  images: [
    '/images/Apartment.jpeg',
  ],
  description: '',
};

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [areas, setAreas] = useState(DEFAULT_AREAS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [localityFilter, setLocalityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalFilter, setApprovalFilter] = useState('all');

  // Detail Modal State (New Restructured View)
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPropertyId, setEditingPropertyId] = useState(null);
  const [editingPropObj, setEditingPropObj] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isCustomLocality, setIsCustomLocality] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectProp, setRejectProp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // 1. Fetch Dynamic Areas from Admin API
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
        // Combine with defaults to ensure comprehensive list
        const unique = Array.from(new Set([...names, ...DEFAULT_AREAS]));
        setAreas(unique);
      }
    } catch (err) {
      console.warn('Could not load dynamic areas, using default list:', err);
    }
  };

  // 2. Fetch properties from MongoDB via API
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = { limit: 100 };
      if (categoryFilter !== 'all') params.category = categoryFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (approvalFilter === 'home') {
        params.showOnHome = 'true';
        params.approvalStatus = 'all';
      } else if (approvalFilter !== 'all') {
        params.approvalStatus = approvalFilter;
      } else {
        params.approvalStatus = 'all';
      }
      if (searchQuery) params.search = searchQuery;

      const res = await propertyAPI.getProperties(params);
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.properties)
        ? res.data.properties
        : Array.isArray(res?.properties)
        ? res.properties
        : [];

      setProperties(list);
    } catch (err) {
      console.error('Failed to load properties from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreas();
  }, []);

  // Preload local property presets for instant, smooth rendering
  useEffect(() => {
    SAMPLE_PHOTO_PRESETS.forEach((preset) => {
      const img = new Image();
      img.src = preset.url;
    });
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [categoryFilter, typeFilter, statusFilter, approvalFilter]);

  // Quick stats
  const totalCount = properties.length;
  const pendingCount = properties.filter((p) => p.approvalStatus === 'pending').length;
  const approvedCount = properties.filter((p) => p.approvalStatus === 'approved').length;
  const rejectedCount = properties.filter((p) => p.approvalStatus === 'rejected').length;
  const homeShowcaseCount = properties.filter((p) => p.showOnHome).length;

  // Filtered properties for table
  const displayProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Home Showcase filter
      if (approvalFilter === 'home' && !prop.showOnHome) {
        return false;
      }
      // Locality filter
      if (localityFilter !== 'all') {
        const loc = prop.location?.locality || '';
        if (loc.toLowerCase() !== localityFilter.toLowerCase()) return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (prop.title || '').toLowerCase();
        const loc = (prop.location?.locality || '').toLowerCase();
        const addr = (prop.location?.address || '').toLowerCase();
        const type = (prop.type || '').toLowerCase();
        const partner = (prop.submittedByName || prop.submittedByPartner?.name || '').toLowerCase();
        if (!title.includes(q) && !loc.includes(q) && !addr.includes(q) && !type.includes(q) && !partner.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [properties, localityFilter, searchQuery, approvalFilter]);

  // Open modal for Add
  const handleOpenAdd = () => {
    setEditingPropertyId(null);
    setEditingPropObj(null);
    const defaultLoc = areas[0] || 'Vijay Nagar';
    setFormData({
      ...initialFormState,
      locality: defaultLoc,
    });
    setIsCustomLocality(false);
    setImageUrlInput('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (prop, e) => {
    if (e) e.stopPropagation();
    setEditingPropertyId(prop._id);
    setEditingPropObj(prop);

    const propLoc = prop.location?.locality || 'Vijay Nagar';
    const isCustom = !areas.includes(propLoc);
    setIsCustomLocality(isCustom);

    const propType = prop.type || 'apartment_flat';
    const derivedParent = prop.parentCategory || getParentCategory(propType);

    setFormData({
      title: prop.title || '',
      parentCategory: derivedParent,
      category: prop.category || 'buy',
      type: propType,
      price: prop.price || '',
      dealBadge: prop.dealBadge || '',
      status: prop.status || 'active',
      approvalStatus: prop.approvalStatus || 'approved',
      rejectionReason: prop.rejectionReason || '',
      featured: prop.featured || false,
      showOnHome: Boolean(prop.showOnHome),
      locality: propLoc,
      address: prop.location?.address || '',
      city: prop.location?.city || 'Indore',
      state: prop.location?.state || 'Madhya Pradesh',
      pincode: prop.location?.pincode || '452010',
      bhk: prop.bhk || '3',
      carpetArea: prop.carpetArea || '',
      plotArea: prop.plotArea || '',
      furnishing: prop.furnishing || 'fully_furnished',
      facing: prop.facing || 'east',
      ageOfProperty: prop.ageOfProperty || 'less_than_1_year',
      amenities: prop.amenities || [],
      highlights: prop.highlights || [],
      images: Array.isArray(prop.images) && prop.images.length > 0
        ? prop.images.map((img) => (typeof img === 'string' ? img : img.url))
        : initialFormState.images,
      description: prop.description || '',
    });
    setImageUrlInput('');
    setErrorMessage('');
    setIsModalOpen(true);
  };

  // Open Property Dossier Detail Modal
  const handleOpenDetails = (prop, e) => {
    if (e) e.stopPropagation();
    setSelectedProperty(prop);
    setActiveImageIdx(0);
  };

  // Handle Form Input Change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Toggle Amenity
  const handleToggleAmenity = (amenity) => {
    setFormData((prev) => {
      const exists = prev.amenities.includes(amenity);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a !== amenity)
          : [...prev.amenities, amenity],
      };
    });
  };

  // Add Image URL
  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrlInput.trim()],
    }));
    setImageUrlInput('');
  };

  // Remove Image URL
  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // Submit Save or Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.title.trim()) {
      setErrorMessage('Property title is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setErrorMessage('A valid numeric price in ₹ is required.');
      return;
    }
    if (!formData.locality.trim()) {
      setErrorMessage('Please specify an Indore locality / operating corridor.');
      return;
    }

    setSaving(true);

    const derivedParent = formData.parentCategory || getParentCategory(formData.type);
    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      parentCategory: derivedParent,
      type: formData.type,
      category: formData.category,
      price: Number(formData.price),
      dealBadge: formData.dealBadge.trim() || undefined,
      status: formData.status,
      featured: formData.featured,
      showOnHome: Boolean(formData.showOnHome),
      bhk: isResidential(formData.type) ? (formData.bhk || undefined) : undefined,
      carpetArea: !isPlotOrLand(formData.type) && formData.carpetArea ? Number(formData.carpetArea) : undefined,
      plotArea: (isPlotOrLand(formData.type) || ['villa', 'bungalow', 'independent_house', 'row_house', 'farm_house', 'duplex_triplex'].includes(formData.type)) && formData.plotArea ? Number(formData.plotArea) : undefined,
      furnishing: !isPlotOrLand(formData.type) ? formData.furnishing : undefined,
      facing: formData.facing,
      ageOfProperty: !isPlotOrLand(formData.type) ? formData.ageOfProperty : undefined,
      amenities: formData.amenities,
      highlights: formData.highlights,
      images: formData.images.map((url) => ({ url, caption: formData.title })),
      location: {
        locality: formData.locality.trim(),
        address: formData.address.trim(),
        city: formData.city.trim() || 'Indore',
        state: formData.state.trim() || 'Madhya Pradesh',
        pincode: formData.pincode.trim() || '452010',
      },
      approvalStatus: formData.approvalStatus || 'approved',
      rejectionReason: formData.rejectionReason || '',
    };

    try {
      if (editingPropertyId) {
        await propertyAPI.updateProperty(editingPropertyId, payload);
        setSuccessMessage('Property updated successfully!');
      } else {
        await propertyAPI.createProperty(payload);
        setSuccessMessage('New property added to catalog successfully!');
      }

      setTimeout(() => setSuccessMessage(''), 3000);
      setIsModalOpen(false);
      fetchProperties();
      if (selectedProperty && selectedProperty._id === editingPropertyId) {
        setSelectedProperty(null);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to save property. Please check backend connection.');
    } finally {
      setSaving(false);
    }
  };

  // Delete Property
  const handleDeleteProperty = async (prop, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete "${prop.title}"?`)) return;

    try {
      await propertyAPI.deleteProperty(prop._id);
      setProperties((prev) => prev.filter((p) => p._id !== prop._id));
      if (selectedProperty?._id === prop._id) setSelectedProperty(null);
      setSuccessMessage('Property deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err) {
      console.error('Failed to delete property:', err);
    }
  };

  // Toggle Active/Inactive
  const handleToggleStatus = async (prop, e) => {
    if (e) e.stopPropagation();
    const newStatus = prop.status === 'active' ? 'inactive' : 'active';
    try {
      await propertyAPI.updateProperty(prop._id, { status: newStatus });
      setProperties((prev) =>
        prev.map((p) => (p._id === prop._id ? { ...p, status: newStatus } : p))
      );
      if (selectedProperty?._id === prop._id) {
        setSelectedProperty((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Toggle Homepage Showcase (Max 4 properties displayed on site)
  const handleToggleHomeShowcase = async (prop, e) => {
    if (e) e.stopPropagation();
    const isCurrentlyOnHome = Boolean(prop.showOnHome);

    if (!isCurrentlyOnHome) {
      const currentSelected = properties.filter((p) => p.showOnHome && p._id !== prop._id);
      if (currentSelected.length >= 4) {
        alert(
          'Maximum 4 properties can be selected for the Homepage showcase.\n\nPlease deselect one of the currently selected properties before adding this one.'
        );
        return;
      }
    }

    try {
      const newStatus = !isCurrentlyOnHome;
      setProperties((prev) =>
        prev.map((p) => (p._id === prop._id ? { ...p, showOnHome: newStatus } : p))
      );
      if (selectedProperty?._id === prop._id) {
        setSelectedProperty((prev) => ({ ...prev, showOnHome: newStatus }));
      }

      await propertyAPI.updateProperty(prop._id, { showOnHome: newStatus });
      setSuccessMessage(
        newStatus
          ? `"${prop.title}" added to Homepage 4 Showcase!`
          : `"${prop.title}" removed from Homepage showcase.`
      );
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Failed to toggle homepage showcase:', err);
      fetchProperties();
    }
  };

  // Super Admin Approval Decision
  const handleApproveProperty = async (prop, e) => {
    if (e) e.stopPropagation();
    try {
      await propertyAPI.approveProperty(prop._id);
      setSuccessMessage(`Property "${prop.title}" approved and live!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchProperties();
      if (selectedProperty?._id === prop._id) {
        setSelectedProperty((prev) => ({ ...prev, approvalStatus: 'approved' }));
      }
    } catch (err) {
      console.error('Failed to approve property:', err);
    }
  };

  // Open Reject Modal
  const handleOpenReject = (prop, e) => {
    if (e) e.stopPropagation();
    setRejectProp(prop);
    setRejectReason(prop.rejectionReason || '');
    setRejectModalOpen(true);
  };

  // Submit Rejection
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectProp) return;
    setRejecting(true);
    try {
      await propertyAPI.rejectProperty(rejectProp._id, rejectReason.trim());
      setSuccessMessage(`Listing rejected.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setRejectModalOpen(false);
      setRejectProp(null);
      fetchProperties();
      if (selectedProperty?._id === rejectProp._id) {
        setSelectedProperty((prev) => ({ ...prev, approvalStatus: 'rejected', rejectionReason: rejectReason }));
      }
    } catch (err) {
      console.error('Failed to reject property:', err);
    } finally {
      setRejecting(false);
    }
  };

  // Format price helper (directly from original numeric price)
  const formatPrice = (p) => {
    const num = Number(p?.price ?? p) || 0;
    const rent = Number(p?.rentAmount) || 0;
    if ((p?.category === 'rent' || rent > 0) && rent > 0) {
      return `₹ ${rent.toLocaleString('en-IN')} / mo`;
    }
    if (num <= 0) return 'Price on Request';
    if (num >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (num >= 100000) {
      return `₹ ${(num / 100000).toFixed(2).replace(/\.00$/, '')} Lakhs`;
    }
    return `₹ ${num.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6 select-none max-w-[1700px] mx-auto pb-10">

      {/* ══════════ TOP EXECUTIVE HEADER ══════════ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-border shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display font-black text-2xl text-navy tracking-tight">
              Property Portfolio & Assets
            </h1>
            <span className="px-3 py-1 rounded-full text-2xs font-extrabold uppercase bg-gold/15 text-gold border border-gold/40">
              {totalCount} Total Catalog
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium mt-0.5">
            Manage Indore residential, commercial, and investment plots with real-time approval workflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchProperties}
            title="Refresh Catalog"
            className="p-2.5 rounded-xl border border-border bg-bg hover:bg-navy hover:text-gold text-text-secondary transition-all cursor-pointer shadow-2xs"
          >
            <RiRefreshLine className={`text-base ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-xl bg-navy text-gold font-display font-extrabold text-xs flex items-center gap-2 hover:bg-navy-light transition-all shadow-gold cursor-pointer border border-gold/30"
          >
            <RiAddLine className="text-base" />
            <span>Add New Property</span>
          </button>
        </div>
      </div>

      {/* ── Notification Banner ── */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-2xs"
          >
            <RiCheckLine className="text-base" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ APPROVAL STATUS KPI CARDS ══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setApprovalFilter('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            approvalFilter === 'all'
              ? 'bg-navy text-white border-navy shadow-soft ring-2 ring-gold/40'
              : 'bg-surface text-navy border-border hover:border-gold/40'
          }`}
        >
          <p className="text-2xs font-extrabold uppercase opacity-75">All Inventory</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display font-black text-2xl">{totalCount}</span>
            <RiBuilding4Line className="text-gold text-lg" />
          </div>
        </div>

        <div
          onClick={() => setApprovalFilter('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            approvalFilter === 'approved'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-soft'
              : 'bg-emerald-50/60 text-emerald-900 border-emerald-200 hover:bg-emerald-100/60'
          }`}
        >
          <p className="text-2xs font-extrabold uppercase opacity-75">Approved & Live</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display font-black text-2xl">{approvedCount}</span>
            <RiCheckLine className="text-lg" />
          </div>
        </div>

        {/* Homepage 4 Showcase Selection Card */}
        <div
          onClick={() => setApprovalFilter(approvalFilter === 'home' ? 'all' : 'home')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            approvalFilter === 'home'
              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-600 shadow-soft ring-2 ring-gold/60'
              : 'bg-amber-50/70 text-amber-950 border-amber-200 hover:bg-amber-100/70'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xs font-extrabold uppercase tracking-wide opacity-85">Home Showcase</p>
            <RiHome4Line className="text-gold text-lg" />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display font-black text-2xl">{homeShowcaseCount} / 4</span>
            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${approvalFilter === 'home' ? 'bg-white/20 text-white' : 'bg-amber-200/60 text-amber-900'}`}>
              {homeShowcaseCount === 4 ? 'Full' : `${4 - homeShowcaseCount} Open`}
            </span>
          </div>
        </div>

        <div
          onClick={() => setApprovalFilter('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            approvalFilter === 'pending'
              ? 'bg-amber-500 text-white border-amber-500 shadow-soft'
              : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xs font-extrabold uppercase opacity-75">Pending Review</p>
            {pendingCount > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display font-black text-2xl">{pendingCount}</span>
            <span className="text-2xs font-extrabold px-1.5 py-0.5 rounded bg-white/40">Action Needed</span>
          </div>
        </div>

        <div
          onClick={() => setApprovalFilter('rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            approvalFilter === 'rejected'
              ? 'bg-rose-600 text-white border-rose-600 shadow-soft'
              : 'bg-rose-50/60 text-rose-900 border-rose-200 hover:bg-rose-100/60'
          }`}
        >
          <p className="text-2xs font-extrabold uppercase opacity-75">Rejected</p>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-display font-black text-2xl">{rejectedCount}</span>
            <RiCloseLine className="text-lg" />
          </div>
        </div>
      </div>

      {/* ══════════ SEARCH & STREAMLINED FILTER BAR ══════════ */}
      <div className="p-4 rounded-2xl bg-surface border border-border shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <RiSearchLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-base pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title, corridor, locality, partner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
            />
          </div>

          {/* Quick Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Dynamic Locality Filter */}
            <select
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              <option value="all">📍 All Localities ({areas.length})</option>
              {areas.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-bold text-navy focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="buy">Buy (Sale)</option>
              <option value="rent">Rent (Lease)</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-bg border border-border text-xs font-bold text-navy focus:outline-none cursor-pointer max-w-[200px]"
            >
              <option value="all">All Property Types ({ALL_PROPERTY_TYPES.length})</option>
              {Object.entries(PROPERTY_TAXONOMY).map(([parentKey, group]) => (
                <optgroup key={parentKey} label={group.label}>
                  {group.types.map((t) => (
                    <option key={t.id || t.value} value={t.id || t.value}>
                      {t.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ══════════ RESTRUCTURED PROPERTIES TABLE (CLEAN & REQUIRED CONTENT) ══════════ */}
      <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-bg/40">
          <div className="flex items-center gap-2">
            <span className="font-display font-extrabold text-sm text-navy">
              Live Property Inventory
            </span>
            <span className="px-2 py-0.5 rounded-full text-2xs font-extrabold bg-navy/10 text-navy">
              {displayProperties.length} listed
            </span>
          </div>
          <span className="text-2xs text-text-muted font-medium">
            Click any row or &quot;Details&quot; to inspect full property dossier
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-bg/60 text-2xs uppercase tracking-wider font-extrabold text-text-secondary">
                <th className="py-3 px-4">Asset & Title</th>
                <th className="py-3 px-4">Corridor & Locality</th>
                <th className="py-3 px-4">Valuation / Price</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-center">Home Showcase (Max 4)</th>
                <th className="py-3 px-4">Listing Source</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-muted">
                    <RiRefreshLine className="animate-spin text-2xl mx-auto mb-2 text-gold" />
                    Synchronizing properties catalog...
                  </td>
                </tr>
              ) : displayProperties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-secondary">
                    <RiBuilding4Line className="text-3xl mx-auto mb-2 text-text-muted opacity-50" />
                    <p className="font-semibold text-navy">No properties found matching filters</p>
                    <p className="text-2xs text-text-muted mt-1">
                      Try clearing search filters or add a new verified property.
                    </p>
                  </td>
                </tr>
              ) : (
                displayProperties.map((prop) => {
                  const firstImg =
                    Array.isArray(prop.images) && prop.images[0]
                      ? typeof prop.images[0] === 'string'
                        ? prop.images[0]
                        : prop.images[0].url
                      : '/images/Apartment.jpeg';

                  const isApproved = prop.approvalStatus === 'approved';
                  const isRejected = prop.approvalStatus === 'rejected';
                  const isPending = !isApproved && !isRejected;

                  return (
                    <tr
                      key={prop._id}
                      onClick={() => handleOpenDetails(prop)}
                      className="hover:bg-gold/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Asset & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-border">
                            <img
                              src={firstImg}
                              alt={prop.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {Array.isArray(prop.images) && prop.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-navy/80 text-white text-[9px] font-mono px-1 rounded-tl">
                                +{prop.images.length - 1}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-display font-bold text-navy text-sm truncate max-w-xs group-hover:text-gold transition-colors">
                              {prop.title}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-gold/15 text-gold border border-gold/30">
                                {prop.category || 'Buy'}
                              </span>
                              <span className="text-2xs text-text-muted capitalize">
                                {isResidential(prop.type) && prop.bhk && prop.bhk !== 'N/A' && !isPlotOrLand(prop.type) ? `${prop.bhk} • ` : ''}
                                {getTypeLabel(prop.type)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Locality */}
                      <td className="py-3.5 px-4 text-navy">
                        <div className="flex items-center gap-1.5 font-bold">
                          <RiMapPinLine className="text-gold shrink-0 text-sm" />
                          <span>{prop.location?.locality || 'Indore'}</span>
                        </div>
                        <p className="text-2xs text-text-muted truncate max-w-[180px] mt-0.5">
                          {prop.location?.address || 'Indore, Madhya Pradesh'}
                        </p>
                      </td>

                      {/* Valuation / Price */}
                      <td className="py-3.5 px-4">
                        <div className="font-display font-black text-navy text-sm">
                          {formatPrice(prop)}
                        </div>
                        {prop.price > 0 && (
                          <div className="text-[10px] text-text-muted font-mono font-medium">
                            ₹ {Number(prop.price).toLocaleString('en-IN')}
                          </div>
                        )}
                        {prop.carpetArea && prop.price && (
                          <p className="text-[10px] text-text-muted mt-0.5">
                            ₹ {Math.round(prop.price / prop.carpetArea).toLocaleString('en-IN')}/sq.ft
                          </p>
                        )}
                      </td>

                      {/* Approval Status */}
                      <td className="py-3.5 px-4">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <RiCheckLine /> Approved & Live
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Pending Review
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                            <RiCloseLine /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Home Showcase Selector (Max 4 on Homepage) */}
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleToggleHomeShowcase(prop, e)}
                          title={
                            prop.showOnHome
                              ? 'Currently featured on Homepage (Click to remove)'
                              : 'Feature on Homepage (Max 4 allowed)'
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-extrabold transition-all cursor-pointer ${
                            prop.showOnHome
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs border border-amber-600 ring-2 ring-gold/40'
                              : 'bg-bg text-text-muted hover:text-navy hover:bg-border/60 border border-border'
                          }`}
                        >
                          <RiHome4Line className={`text-xs ${prop.showOnHome ? 'text-white' : 'text-slate-400'}`} />
                          <span>{prop.showOnHome ? 'On Home (Active)' : '+ Add to Home'}</span>
                        </button>
                      </td>

                      {/* Listing Source */}
                      <td className="py-3.5 px-4">
                        {prop.submittedByPartner || prop.submittedByName ? (
                          <div>
                            <span className="inline-flex items-center gap-1 text-2xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              <RiUserStarLine /> {prop.submittedByName || prop.submittedByPartner?.name}
                            </span>
                            <p className="text-[10px] text-text-muted mt-0.5">
                              {prop.submittedByMobile || prop.submittedByPartner?.mobile || 'Channel Partner'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-2xs font-bold text-navy bg-navy/5 px-2 py-0.5 rounded">
                            Direct Super Admin
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Fast-track Accept/Reject if pending */}
                          {isPending && (
                            <>
                              <button
                                onClick={(e) => handleApproveProperty(prop, e)}
                                title="Approve Listing Live"
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                              >
                                <RiCheckLine className="text-sm" />
                              </button>
                              <button
                                onClick={(e) => handleOpenReject(prop, e)}
                                title="Reject Listing"
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-2xs"
                              >
                                <RiCloseLine className="text-sm" />
                              </button>
                            </>
                          )}

                          {/* View Details Button (Primary Action) */}
                          <button
                            onClick={(e) => handleOpenDetails(prop, e)}
                            className="px-2.5 py-1 rounded-lg bg-navy text-gold text-2xs font-extrabold hover:bg-navy-light transition-colors cursor-pointer shadow-2xs"
                          >
                            Details
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={(e) => handleOpenEdit(prop, e)}
                            title="Edit Listing"
                            className="p-1.5 rounded-lg bg-bg text-text-secondary hover:text-navy hover:bg-border transition-colors cursor-pointer border border-border"
                          >
                            <RiEditLine className="text-sm" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteProperty(prop, e)}
                            title="Delete"
                            className="p-1.5 rounded-lg bg-bg text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer border border-border"
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

      {/* ═══════════════════════════════════════════════════════════
          FULL-WIDTH RICH PROPERTY DOSSIER MODAL (WHEN ADMIN WANTS MORE DETAILS)
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-navy/60 backdrop-blur-md select-none overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ duration: 0.25 }}
              className="neu-surface rounded-3xl border border-white/80 shadow-[14px_14px_35px_rgba(166,180,200,0.5),-14px_-14px_35px_rgba(255,255,255,0.95)] w-full max-w-[98vw] xl:max-w-7xl 2xl:max-w-[1550px] max-h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-6 border-b border-border/40 neu-surface-soft flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 sm:w-14 h-12 sm:h-14 rounded-2xl neu-well text-gold flex items-center justify-center text-xl sm:text-2xl shrink-0">
                    <RiBuilding4Line />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display font-black text-lg sm:text-2xl text-navy truncate">
                        {selectedProperty.title}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase neu-pressed text-gold border border-gold/30">
                        {selectedProperty.category || 'Buy'}
                      </span>
                      {selectedProperty.bhk && selectedProperty.bhk !== 'N/A' && (
                        <span className="px-2 py-0.5 rounded-md text-2xs font-extrabold neu-pressed text-navy">
                          {selectedProperty.bhk} BHK
                        </span>
                      )}
                    </div>
                    <p className="text-2xs text-text-muted font-medium flex items-center gap-2 mt-0.5">
                      <RiMapPinLine className="text-gold" />
                      <span>{selectedProperty.location?.locality}, {selectedProperty.location?.city || 'Indore'}</span>
                      <span>•</span>
                      <span>Ref ID: <strong className="text-navy">{selectedProperty._id}</strong></span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(selectedProperty)}
                    className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl neu-btn-gold font-bold text-xs cursor-pointer"
                  >
                    <RiEditLine className="text-sm" />
                    <span>Edit Listing</span>
                  </button>

                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="p-2.5 rounded-xl neu-btn text-text-muted hover:text-navy cursor-pointer"
                  >
                    <RiCloseLine className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Modal Two-Column Content */}
              <div className="p-4 sm:p-6 lg:p-7 overflow-y-auto flex-1 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* ── LEFT SHOWCASE COLUMN (7 COLS) ── */}
                  <div className="lg:col-span-7 space-y-5">
                    {/* Image Gallery */}
                    <div className="rounded-2xl overflow-hidden border border-border bg-bg">
                      <div className="h-64 sm:h-80 w-full relative bg-slate-900">
                        {selectedProperty.images && selectedProperty.images.length > 0 ? (
                          <img
                            src={
                              typeof selectedProperty.images[activeImageIdx] === 'string'
                                ? selectedProperty.images[activeImageIdx]
                                : selectedProperty.images[activeImageIdx]?.url
                            }
                            alt={selectedProperty.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-text-muted">
                            <RiImageLine className="text-4xl" />
                          </div>
                        )}
                        <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-navy/80 backdrop-blur-xs text-white text-xs font-mono font-bold">
                          {activeImageIdx + 1} / {selectedProperty.images?.length || 1} Photos
                        </span>
                      </div>

                      {/* Thumbnail strip */}
                      {Array.isArray(selectedProperty.images) && selectedProperty.images.length > 1 && (
                        <div className="p-2 flex items-center gap-2 overflow-x-auto bg-surface border-t border-border">
                          {selectedProperty.images.map((img, i) => {
                            const url = typeof img === 'string' ? img : img.url;
                            return (
                              <button
                                key={i}
                                onClick={() => setActiveImageIdx(i)}
                                className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                                  activeImageIdx === i ? 'border-gold shadow-xs scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                                }`}
                              >
                                <img src={url} alt="" className="w-full h-full object-cover" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Key Specifications Matrix */}
                    <div className="p-5 rounded-2xl neu-convex border border-white/60 space-y-3.5">
                      <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                        <RiCompass3Line className="text-gold text-sm" />
                        Asset Specifications & Dimensions ({getParentCategoryLabel(selectedProperty.type)})
                      </h3>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl neu-well-sm">
                          <p className="text-[10px] font-bold text-text-muted uppercase">Property Typology</p>
                          <p className="font-display font-black text-navy text-sm mt-1">
                            {getTypeLabel(selectedProperty.type)}
                          </p>
                        </div>

                        {isPlotOrLand(selectedProperty.type) ? (
                          <>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Plot Area</p>
                              <p className="font-display font-black text-navy text-sm mt-1">
                                {selectedProperty.plotArea || selectedProperty.carpetArea ? `${selectedProperty.plotArea || selectedProperty.carpetArea} Sq.Ft` : 'N/A'}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Facing Direction</p>
                              <p className="font-display font-black text-navy text-sm mt-1 capitalize">
                                {selectedProperty.facing || 'East Facing'}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Zoning Category</p>
                              <p className="font-display font-black text-emerald-700 text-sm mt-1">
                                T&CP / Clear Title
                              </p>
                            </div>
                          </>
                        ) : isCommercial(selectedProperty.type) ? (
                          <>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Carpet Area</p>
                              <p className="font-display font-black text-navy text-sm mt-1">
                                {selectedProperty.carpetArea ? `${selectedProperty.carpetArea} Sq.Ft` : 'N/A'}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Fitout / Furnishing</p>
                              <p className="font-display font-black text-navy text-sm mt-1 capitalize">
                                {selectedProperty.furnishing ? selectedProperty.furnishing.replace(/_/g, ' ') : 'Commercial'}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Facing / Floor</p>
                              <p className="font-display font-black text-navy text-sm mt-1 capitalize">
                                {selectedProperty.facing || 'East'}
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Configuration</p>
                              <p className="font-display font-black text-navy text-sm mt-1">
                                {selectedProperty.bhk || 'Residential'}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Carpet Area</p>
                              <p className="font-display font-black text-navy text-sm mt-1">
                                {selectedProperty.carpetArea ? `${selectedProperty.carpetArea} Sq.Ft` : (selectedProperty.plotArea ? `${selectedProperty.plotArea} Sq.Ft Plot` : 'N/A')}
                              </p>
                            </div>
                            <div className="p-3.5 rounded-xl neu-well-sm">
                              <p className="text-[10px] font-bold text-text-muted uppercase">Furnishing</p>
                              <p className="font-display font-black text-navy text-sm mt-1 capitalize">
                                {selectedProperty.furnishing ? selectedProperty.furnishing.replace(/_/g, ' ') : 'Unspecified'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="p-5 rounded-2xl neu-well space-y-2">
                      <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy">
                        Overview & Architectural Description
                      </h4>
                      <p className="text-xs text-text-secondary leading-relaxed font-medium whitespace-pre-wrap">
                        {selectedProperty.description || 'No detailed description provided for this listing.'}
                      </p>
                    </div>

                    {/* Amenities */}
                    {Array.isArray(selectedProperty.amenities) && selectedProperty.amenities.length > 0 && (
                      <div className="p-5 rounded-2xl neu-convex border border-white/60 space-y-3">
                        <h4 className="font-display font-extrabold text-xs uppercase tracking-wider text-navy">
                          Features & Amenities ({selectedProperty.amenities.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProperty.amenities.map((amenity, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 rounded-xl neu-pressed text-gold border border-gold/30 text-xs font-bold flex items-center gap-1.5"
                            >
                              <RiCheckLine className="text-sm" />
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── RIGHT EXECUTIVE DECISION & SOURCE COLUMN (5 COLS) ── */}
                  <div className="lg:col-span-5 space-y-5">
                    {/* Pricing & Valuation Card */}
                    <div className="p-5 rounded-2xl neu-surface-soft border border-gold/40 shadow-[6px_6px_16px_rgba(166,180,200,0.35),-6px_-6px_16px_rgba(255,255,255,0.9)] space-y-2">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-gold">
                        Catalog Price & Valuation
                      </p>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-black text-3xl sm:text-4xl text-navy">
                          {formatPrice(selectedProperty)}
                        </span>
                      </div>
                      {selectedProperty.price > 0 && (
                        <p className="text-xs font-mono font-bold text-navy/70">
                          Original Price: ₹ {Number(selectedProperty.price).toLocaleString('en-IN')}
                        </p>
                      )}
                      {selectedProperty.carpetArea && selectedProperty.price && (
                        <p className="text-xs text-text-muted font-semibold">
                          Calculated Rate: ₹ {Math.round(selectedProperty.price / selectedProperty.carpetArea).toLocaleString('en-IN')} / sq.ft
                        </p>
                      )}
                    </div>

                    {/* Super Admin Approval Hub */}
                    <div className="p-5 rounded-2xl neu-convex border border-gold/40 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display font-black text-xs uppercase tracking-wider text-navy">
                          Super Admin Approval Decision
                        </h3>
                        <span className="text-[10px] font-bold text-text-muted">Live Sync</span>
                      </div>

                      <div className="p-3.5 rounded-xl neu-well-sm flex items-center justify-between">
                        <span className="text-xs font-bold text-navy">Current Status:</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold uppercase neu-pressed ${
                          selectedProperty.approvalStatus === 'approved'
                            ? 'text-emerald-700 border border-emerald-300'
                            : selectedProperty.approvalStatus === 'rejected'
                            ? 'text-rose-700 border border-rose-300'
                            : 'text-amber-700 border border-amber-300'
                        }`}>
                          {selectedProperty.approvalStatus || 'Pending'}
                        </span>
                      </div>

                      {selectedProperty.rejectionReason && (
                        <div className="p-3 rounded-xl neu-well text-rose-700 text-xs font-semibold">
                          <strong>Rejection Reason:</strong> {selectedProperty.rejectionReason}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2.5 pt-1">
                        <button
                          onClick={(e) => handleApproveProperty(selectedProperty, e)}
                          disabled={selectedProperty.approvalStatus === 'approved'}
                          className="px-4 py-2.5 rounded-xl neu-btn text-emerald-700 hover:text-emerald-800 font-bold text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RiCheckLine className="text-base text-emerald-600" /> Approve Listing
                        </button>

                        <button
                          onClick={(e) => handleOpenReject(selectedProperty, e)}
                          className="px-4 py-2.5 rounded-xl neu-btn text-rose-700 hover:text-rose-800 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RiCloseLine className="text-base text-rose-600" /> Reject with Reason
                        </button>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-navy">Show on Public Website:</span>
                        <button
                          onClick={(e) => handleToggleStatus(selectedProperty, e)}
                          className={`px-3 py-1 rounded-lg text-2xs font-bold uppercase transition-all cursor-pointer neu-pressed ${
                            selectedProperty.status === 'active'
                              ? 'text-emerald-700 border border-emerald-300'
                              : 'text-slate-600 border border-slate-300'
                          }`}
                        >
                          {selectedProperty.status === 'active' ? '● Active' : '○ Inactive'}
                        </button>
                      </div>
                    </div>

                    {/* Partner / Attribution Info */}
                    <div className="p-5 rounded-2xl neu-convex border border-white/60 space-y-3.5">
                      <h3 className="font-display font-black text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                        <RiUserStarLine className="text-gold text-sm" />
                        Submission Attribution & Contact
                      </h3>

                      {selectedProperty.submittedByPartner || selectedProperty.submittedByName ? (
                        <div className="space-y-2.5">
                          <div className="p-3.5 rounded-xl neu-well-sm space-y-1">
                            <p className="font-bold text-navy text-xs">
                              {selectedProperty.submittedByName || selectedProperty.submittedByPartner?.name}
                            </p>
                            <p className="text-[11px] text-text-muted font-medium">
                              Mobile: +91 {selectedProperty.submittedByMobile || selectedProperty.submittedByPartner?.mobile || 'N/A'}
                            </p>
                          </div>

                          <div className="flex gap-2.5">
                            <a
                              href={`https://wa.me/91${selectedProperty.submittedByMobile || selectedProperty.submittedByPartner?.mobile}?text=Regarding%20listing%20${encodeURIComponent(selectedProperty.title)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2.5 rounded-xl neu-btn text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5"
                            >
                              <RiWhatsappLine className="text-base text-emerald-600" /> WhatsApp
                            </a>
                            <a
                              href={`tel:${selectedProperty.submittedByMobile || selectedProperty.submittedByPartner?.mobile}`}
                              className="flex-1 py-2.5 rounded-xl neu-btn text-navy font-bold text-xs flex items-center justify-center gap-1.5"
                            >
                              <RiPhoneLine className="text-base text-gold" /> Call
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-xl neu-well-sm text-xs text-text-secondary">
                          Direct Super Admin Property Creation
                        </div>
                      )}
                    </div>

                    {/* Location Card */}
                    <div className="p-5 rounded-2xl neu-well space-y-2 text-xs">
                      <h4 className="font-display font-extrabold uppercase text-navy text-2xs">
                        Full Address & Landmark
                      </h4>
                      <p className="font-semibold text-navy">
                        {selectedProperty.location?.address || 'Indore Prime Corridor'}
                      </p>
                      <p className="text-2xs text-text-muted">
                        Locality: {selectedProperty.location?.locality} • Pincode: {selectedProperty.location?.pincode || '452010'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 border-t border-border/40 neu-surface-soft flex items-center justify-between shrink-0">
                <button
                  onClick={(e) => handleDeleteProperty(selectedProperty, e)}
                  className="px-4 py-2.5 rounded-xl font-display font-bold text-xs neu-btn text-rose-600 hover:text-rose-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <RiDeleteBin6Line className="text-sm" />
                  <span>Delete Property</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleOpenEdit(selectedProperty)}
                    className="px-5 py-2.5 rounded-xl font-display font-bold text-xs neu-btn text-navy cursor-pointer"
                  >
                    Edit Specifications
                  </button>

                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="px-6 py-2.5 rounded-xl font-display font-bold text-xs neu-btn-gold cursor-pointer"
                  >
                    Close Dossier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════
          ADD / EDIT PROPERTY FULL-WIDTH MODAL (DYNAMIC AREAS)
          ═══════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-navy/60 backdrop-blur-md select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25 }}
              className="neu-surface rounded-3xl border border-white/80 shadow-[14px_14px_35px_rgba(166,180,200,0.5),-14px_-14px_35px_rgba(255,255,255,0.95)] w-full max-w-[96vw] xl:max-w-6xl 2xl:max-w-7xl max-h-[95vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-border/40 flex items-center justify-between neu-surface-soft">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl neu-well text-gold flex items-center justify-center font-display font-extrabold text-xl shrink-0">
                    <RiBuilding4Line />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-xl text-navy">
                      {editingPropertyId ? 'Edit Property Listing' : 'Add New Property Listing'}
                    </h3>
                    <p className="text-2xs text-text-secondary font-medium">
                      {editingPropertyId
                        ? 'Update listing specifications, pricing, amenities, photos and operating locality.'
                        : 'Create a new verified real estate asset on Zamin Junction.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 rounded-xl neu-btn text-text-muted hover:text-navy cursor-pointer"
                >
                  <RiCloseLine className="text-2xl" />
                </button>
              </div>

              {/* Modal Form Scrollable */}
              <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-danger-light border border-danger/30 text-danger text-xs font-bold">
                    {errorMessage}
                  </div>
                )}

                {/* Section 1: Core Details */}
                <div className="space-y-4">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    1. Core Listing Specifications
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Title */}
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Property Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        placeholder="e.g. 3 BHK Luxury Penthouse at Super Corridor"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    {/* Parent Category */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Parent Category *
                      </label>
                      <select
                        name="parentCategory"
                        value={formData.parentCategory || getParentCategory(formData.type)}
                        onChange={(e) => {
                          const newParent = e.target.value;
                          const defaultType = PROPERTY_TAXONOMY[newParent]?.types[0]?.value || 'apartment_flat';
                          setFormData((prev) => ({
                            ...prev,
                            parentCategory: newParent,
                            type: defaultType,
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-bold focus:outline-none focus:border-gold"
                      >
                        {Object.entries(PROPERTY_TAXONOMY).map(([catKey, group]) => (
                          <option key={catKey} value={catKey}>
                            {group.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Property Sub-Type */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Property Sub-Type *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={(e) => {
                          const selectedType = e.target.value;
                          const derivedParent = getParentCategory(selectedType);
                          setFormData((prev) => ({
                            ...prev,
                            type: selectedType,
                            parentCategory: derivedParent,
                          }));
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-bold focus:outline-none focus:border-gold capitalize"
                      >
                        {(PROPERTY_TAXONOMY[formData.parentCategory || getParentCategory(formData.type)]?.types || ALL_PROPERTY_TYPES).map((t) => (
                          <option key={t.id || t.value} value={t.id || t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Transaction Category */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Transaction Category *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                      >
                        <option value="buy">Buy (Sale)</option>
                        <option value="rent">Rent (Lease)</option>
                      </select>
                    </div>

                    {/* Deal Badge */}
                    <div className="sm:col-span-2">
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Deal Badge / Verification Tag
                      </label>
                      <input
                        type="text"
                        name="dealBadge"
                        placeholder="e.g. Direct Developer Mandate, Verified Title, Ready to Move"
                        value={formData.dealBadge}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                      />
                    </div>

                    {/* Numeric Price */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Price (Numeric in ₹) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="e.g. 7500000"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        required
                      />
                    </div>

                    {/* Original Price Preview */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Calculated Price Preview
                      </label>
                      <div className="w-full px-3.5 py-2.5 rounded-xl bg-bg/70 border border-border text-xs text-navy font-bold flex items-center justify-between">
                        <span>
                          {formatPrice({ price: formData.price, category: formData.category })}
                        </span>
                        {formData.price > 0 && (
                          <span className="text-2xs text-text-muted font-mono font-medium">
                            ₹ {Number(formData.price).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Location (Dynamic Areas Admin Integrated) */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy flex items-center gap-1.5">
                      <RiMapPinLine className="text-gold text-sm" />
                      2. Operating Locality & Corridor (Dynamic Area Management)
                    </h4>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Syncs with /api/areas/admin
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Dynamic Locality Dropdown */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Indore Operating Locality *
                      </label>
                      <select
                        value={isCustomLocality ? 'Other' : formData.locality}
                        onChange={(e) => {
                          if (e.target.value === 'Other') {
                            setIsCustomLocality(true);
                            setFormData((prev) => ({ ...prev, locality: '' }));
                          } else {
                            setIsCustomLocality(false);
                            setFormData((prev) => ({ ...prev, locality: e.target.value }));
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-bold focus:outline-none focus:border-gold"
                      >
                        {areas.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                        <option value="Other">+ Other (Enter Custom Locality)</option>
                      </select>
                    </div>

                    {/* Custom Locality Input if Other is selected */}
                    {isCustomLocality && (
                      <div className="sm:col-span-2">
                        <label className="block text-2xs font-bold uppercase text-gold mb-1">
                          Specify Custom Operating Locality *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Musakhedi, Manglia, Super Corridor Sector 2"
                          value={formData.locality}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, locality: e.target.value }))
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-gold/5 border border-gold text-xs text-navy font-bold focus:outline-none"
                          required
                        />
                      </div>
                    )}

                    {/* Pincode */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="e.g. 452010"
                        value={formData.pincode}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                      />
                    </div>

                    {/* Full Address */}
                    <div className="sm:col-span-3">
                      <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                        Full Address / Landmark
                      </label>
                      <input
                        type="text"
                        name="address"
                        placeholder="e.g. Plot No. 42, Near Brilliant Convention Centre, Scheme 78"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Dynamic Specifications based on Property Category */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                      3. {isPlotOrLand(formData.type)
                        ? 'Plot & Land Dimensions (Plot Area & Facing)'
                        : isCommercial(formData.type)
                        ? 'Commercial Specifications & Fitout'
                        : 'Residential Typology, Dimensions & Furnishing'}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gold/15 text-navy border border-gold/30">
                      {isPlotOrLand(formData.type)
                        ? '🌱 Land/Plot: BHK & Furnishing Excluded'
                        : isCommercial(formData.type)
                        ? '🏢 Commercial Space: BHK Excluded'
                        : '🏠 Residential Living Space'}
                    </span>
                  </div>

                  {/* CASE 1: LAND & PLOTS (NO BHK, NO FURNISHING) */}
                  {isPlotOrLand(formData.type) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Plot Area */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Plot Area (Sq.Ft) *
                        </label>
                        <input
                          type="number"
                          name="plotArea"
                          placeholder="e.g. 1500"
                          value={formData.plotArea}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                          required
                        />
                      </div>

                      {/* Facing */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Plot Facing
                        </label>
                        <select
                          name="facing"
                          value={formData.facing}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold capitalize"
                        >
                          {['east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west'].map((f) => (
                            <option key={f} value={f}>
                              {f.replace('_', '-').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center text-2xs text-text-muted italic bg-bg/50 p-3 rounded-xl border border-border/50">
                        ℹ️ Plots & Land parcels do not require BHK, Furnishing Status or Floor numbers.
                      </div>
                    </div>
                  )}

                  {/* CASE 2: COMMERCIAL PROPERTIES (NO BHK) */}
                  {isCommercial(formData.type) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Carpet Area */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Carpet Area (Sq.Ft) *
                        </label>
                        <input
                          type="number"
                          name="carpetArea"
                          placeholder="e.g. 2400"
                          value={formData.carpetArea}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        />
                      </div>

                      {/* Commercial Fitout */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Fitout / Furnishing Status
                        </label>
                        <select
                          name="furnishing"
                          value={formData.furnishing}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        >
                          <option value="unfurnished">Bare Shell (Unfurnished)</option>
                          <option value="semi_furnished">Semi-Fitted / Warm Shell</option>
                          <option value="fully_furnished">Fully Furnished / Plug & Play</option>
                        </select>
                      </div>

                      {/* Facing */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Facing / Entrance
                        </label>
                        <select
                          name="facing"
                          value={formData.facing}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold capitalize"
                        >
                          {['east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west'].map((f) => (
                            <option key={f} value={f}>
                              {f.replace('_', '-').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Age / Possession */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Possession / Age
                        </label>
                        <select
                          name="ageOfProperty"
                          value={formData.ageOfProperty}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        >
                          <option value="ready_to_move">Ready to Move</option>
                          <option value="under_construction">Under Construction</option>
                          <option value="less_than_1_year">Less than 1 Year</option>
                          <option value="1_to_5_years">1 to 5 Years</option>
                          <option value="5_to_10_years">5 to 10 Years</option>
                          <option value="10_plus_years">10+ Years</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* CASE 3: RESIDENTIAL PROPERTIES (SHOW BHK, CARPET, FURNISHING, FACING, AGE) */}
                  {isResidential(formData.type) && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {/* BHK Typology */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          BHK / Typology *
                        </label>
                        <select
                          name="bhk"
                          value={formData.bhk}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        >
                          {['1', '2', '3', '4', '4+', '5', '5+', 'Studio', 'Penthouse', 'Duplex'].map((b) => (
                            <option key={b} value={b}>
                              {b.includes('BHK') || isNaN(b) ? b : `${b} BHK`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Carpet Area */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Carpet Area (Sq.Ft)
                        </label>
                        <input
                          type="number"
                          name="carpetArea"
                          placeholder="e.g. 1450"
                          value={formData.carpetArea}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        />
                      </div>

                      {/* Plot Area */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Plot Area (Sq.Ft)
                        </label>
                        <input
                          type="number"
                          name="plotArea"
                          placeholder="e.g. 1800 (villas)"
                          value={formData.plotArea}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        />
                      </div>

                      {/* Furnishing Status */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Furnishing Status
                        </label>
                        <select
                          name="furnishing"
                          value={formData.furnishing}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold capitalize"
                        >
                          <option value="unfurnished">Unfurnished</option>
                          <option value="semi_furnished">Semi Furnished</option>
                          <option value="fully_furnished">Fully Furnished</option>
                        </select>
                      </div>

                      {/* Facing */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Facing
                        </label>
                        <select
                          name="facing"
                          value={formData.facing}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold capitalize"
                        >
                          {['east', 'west', 'north', 'south', 'north_east', 'north_west', 'south_east', 'south_west'].map((f) => (
                            <option key={f} value={f}>
                              {f.replace('_', '-').toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Age of Property */}
                      <div>
                        <label className="block text-2xs font-bold uppercase text-text-muted mb-1">
                          Age / Possession
                        </label>
                        <select
                          name="ageOfProperty"
                          value={formData.ageOfProperty}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                        >
                          <option value="ready_to_move">Ready to Move</option>
                          <option value="under_construction">Under Construction</option>
                          <option value="less_than_1_year">Less than 1 Year</option>
                          <option value="1_to_5_years">1 to 5 Years</option>
                          <option value="5_to_10_years">5 to 10 Years</option>
                          <option value="10_plus_years">10+ Years</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Amenities */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    4. Amenities & Highlights
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {PREDEFINED_AMENITIES.map((amenity) => {
                      const selected = formData.amenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => handleToggleAmenity(amenity)}
                          className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between ${
                            selected
                              ? 'bg-navy text-gold border-gold/40 shadow-xs'
                              : 'bg-bg text-text-secondary border-border hover:border-gold/30'
                          }`}
                        >
                          <span className="truncate">{amenity}</span>
                          {selected && <RiCheckLine className="text-gold shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Section 5: Image URLs */}
                <div className="space-y-3 pt-4 border-t border-border">
                  <h4 className="font-display font-bold text-xs uppercase tracking-wider text-navy">
                    5. Photography & Asset Media
                  </h4>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste high-res image URL (Cloudinary, Unsplash, etc.)..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                    />
                    <button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="px-4 py-2.5 rounded-xl bg-navy text-gold font-bold text-xs hover:bg-navy-light cursor-pointer shadow-xs shrink-0"
                    >
                      Add Photo
                    </button>
                  </div>

                  {/* Sample Presets */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-text-muted flex items-center gap-1.5">
                        <span>Sample Presets:</span>
                        <span className="text-[10px] font-normal text-text-muted">(Local High-Res Photos)</span>
                      </span>
                      <span className="text-[10px] text-text-muted">Click to add/remove</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {SAMPLE_PHOTO_PRESETS.map((preset, idx) => {
                        const isAdded = formData.images.includes(preset.url);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setFormData((prev) => ({
                                  ...prev,
                                  images: prev.images.filter((img) => img !== preset.url),
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  images: [...prev.images, preset.url],
                                }));
                              }
                            }}
                            className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-2xs font-bold transition-all cursor-pointer ${
                              isAdded
                                ? 'bg-gold/15 text-navy border-gold shadow-2xs ring-1 ring-gold/30'
                                : 'bg-surface hover:bg-bg text-text-secondary border-border hover:border-border-strong'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.label}
                              loading="eager"
                              decoding="async"
                              className="w-5 h-5 rounded-md object-cover border border-border shrink-0"
                            />
                            <span>{preset.label}</span>
                            <span className={isAdded ? 'text-gold font-extrabold' : 'text-text-muted'}>
                              {isAdded ? '✓' : '+'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formData.images.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-2">
                      {formData.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                          <img
                            src={imgUrl}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                          >
                            <RiCloseLine />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 6: Description */}
                <div className="space-y-2 pt-4 border-t border-border">
                  <label className="block text-2xs font-bold uppercase text-text-muted">
                    6. Architectural Description & Narrative
                  </label>
                  <textarea
                    rows="3"
                    name="description"
                    placeholder="Enter comprehensive property highlights, location advantages, legal search status..."
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-bg border border-border text-xs text-navy font-semibold focus:outline-none focus:border-gold"
                  />
                </div>

                {/* Homepage Showcase Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/60 transition-colors">
                    <input
                      type="checkbox"
                      name="showOnHome"
                      checked={Boolean(formData.showOnHome)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        if (isChecked) {
                          const currentSelected = properties.filter((p) => p.showOnHome && p._id !== editingPropertyId);
                          if (currentSelected.length >= 4) {
                            alert(
                              'Maximum 4 properties can be selected for the Homepage showcase.\n\nPlease deselect one of the currently selected properties before selecting this one.'
                            );
                            return;
                          }
                        }
                        setFormData((prev) => ({ ...prev, showOnHome: isChecked }));
                      }}
                      className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-gold cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-navy flex items-center gap-1.5">
                        <RiHome4Line className="text-amber-600 text-sm" />
                        Feature in Homepage Showcase (Verified Real Estate in Pan India - Max 4)
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Selected property will appear directly in the 4 featured cards on the main website homepage.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Modal Footer Actions */}
                <div className="pt-5 border-t border-border/40 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl font-bold text-xs neu-btn text-navy cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl font-display font-extrabold text-xs neu-btn-gold cursor-pointer disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : editingPropertyId ? 'Save Changes' : 'Publish Property'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════ REJECT FEEDBACK MODAL ══════════ */}
      <AnimatePresence>
        {rejectModalOpen && rejectProp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="neu-surface rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-white/80 shadow-[14px_14px_35px_rgba(166,180,200,0.5),-14px_-14px_35px_rgba(255,255,255,0.95)] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl neu-well text-rose-600 flex items-center justify-center text-xl font-bold shrink-0">
                    <RiCloseLine />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-navy">Reject Property Submission</h3>
                    <p className="text-2xs text-text-muted">Partner will receive this feedback explanation</p>
                  </div>
                </div>
                <button
                  onClick={() => setRejectModalOpen(false)}
                  className="p-2 rounded-xl neu-btn text-text-muted hover:text-navy cursor-pointer"
                >
                  <RiCloseLine className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleConfirmReject} className="space-y-4">
                <div>
                  <label className="block text-2xs font-extrabold uppercase text-text-muted mb-1.5">
                    Rejection Feedback Reason *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Incomplete title documents, blurred photographs, or price deviates significantly from registry circle rate."
                    className="w-full p-3.5 rounded-xl neu-well text-xs text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 border-none placeholder:text-text-muted/60"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold neu-btn text-navy cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rejecting || !rejectReason.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-bold neu-btn text-rose-600 hover:text-white hover:bg-rose-600 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {rejecting ? 'Rejecting...' : 'Confirm Rejection'}
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

export default Properties;
