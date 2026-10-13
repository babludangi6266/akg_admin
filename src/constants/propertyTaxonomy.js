/**
 * Complete Real Estate Property Taxonomy for Zamin Junction (Admin Panel)
 * Hierarchical Parent Categories & Specific Sub-Types
 */

export const PROPERTY_TAXONOMY = {
  residential: {
    id: 'residential',
    label: 'Residential Properties',
    shortLabel: 'Residential',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    description: 'Residential properties meant for living purposes',
    types: [
      {
        id: 'apartment_flat',
        label: 'Apartment / Flat',
        description: 'Self-contained unit inside a multi-story building (1-4 BHK, Studio, Penthouse)',
      },
      {
        id: 'bungalow',
        label: 'Bungalow',
        description: 'Independent, detached house, typically 1-2 stories with private yard',
      },
      {
        id: 'villa',
        label: 'Villa',
        description: 'Premium, luxurious independent house inside a gated society',
      },
      {
        id: 'independent_house',
        label: 'Independent House',
        description: 'Standalone residential building constructed on a private plot of land',
      },
      {
        id: 'builder_floor',
        label: 'Builder Floor',
        description: 'Independent residential unit covering an entire low-rise building floor',
      },
      {
        id: 'row_house',
        label: 'Row House',
        description: 'Series of houses connected side-by-side with uniform architecture',
      },
      {
        id: 'farm_house',
        label: 'Farm House',
        description: 'Residential retreat located in an agricultural or rural setting',
      },
      {
        id: 'duplex_triplex',
        label: 'Duplex / Triplex',
        description: 'Multi-floor home or building with interconnected living levels',
      },
    ],
  },
  commercial: {
    id: 'commercial',
    label: 'Commercial Properties',
    shortLabel: 'Commercial',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    description: 'Commercial properties intended for business activities, retail, or income-generation',
    types: [
      {
        id: 'commercial_office',
        label: 'Commercial Office',
        description: 'Standard office spaces for corporate, tech, or professional firms',
      },
      {
        id: 'coworking_space',
        label: 'Co-Working Space',
        description: 'Shared, flexible office setups leased by desks, cabins, or team suites',
      },
      {
        id: 'retail_shop',
        label: 'Retail Shop',
        description: 'Ground-floor or mall-facing spaces designed for retail stores',
      },
      {
        id: 'showroom',
        label: 'Showroom',
        description: 'Large, premium retail space with prominent display frontage',
      },
      {
        id: 'commercial_space_hall',
        label: 'Commercial Space / Hall',
        description: 'Open-plan spaces for banks, banquet halls, gyms, clinics, or institutes',
      },
      {
        id: 'warehouse_godown',
        label: 'Warehouse / Godown',
        description: 'Large storage facilities for logistics, e-commerce, or inventory',
      },
      {
        id: 'industrial_shed_factory',
        label: 'Industrial Shed / Factory',
        description: 'Specialized industrial structures for manufacturing or heavy machinery',
      },
      {
        id: 'hotel_guest_house',
        label: 'Hotel / Guest House',
        description: 'Operational hospitality properties for sale, lease, or commercial JV',
      },
    ],
  },
  land_plot: {
    id: 'land_plot',
    label: 'Land and Plots',
    shortLabel: 'Land & Plots',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    description: 'Vacant land parcels awaiting custom construction and development',
    types: [
      {
        id: 'residential_plot',
        label: 'Residential Plot',
        description: 'Vacant land zoned specifically for building private houses, villas, or flats',
      },
      {
        id: 'commercial_plot',
        label: 'Commercial Plot',
        description: 'Land parcels legally approved for commercial complexes, offices, or malls',
      },
      {
        id: 'industrial_plot',
        label: 'Industrial Plot',
        description: 'Land in designated industrial corridors for factories or warehouses',
      },
      {
        id: 'agricultural_land',
        label: 'Agricultural Land',
        description: 'Rural or farming land intended for crop cultivation, orchards, or estate',
      },
    ],
  },
};

// Flattened list of all property types
export const ALL_PROPERTY_TYPES = [
  ...PROPERTY_TAXONOMY.residential.types.map((t) => ({ ...t, parentCategory: 'residential' })),
  ...PROPERTY_TAXONOMY.commercial.types.map((t) => ({ ...t, parentCategory: 'commercial' })),
  ...PROPERTY_TAXONOMY.land_plot.types.map((t) => ({ ...t, parentCategory: 'land_plot' })),
];

// Helper: Determine parent category from type (supports legacy types)
export const getParentCategory = (type) => {
  if (!type) return 'residential';
  const t = String(type).toLowerCase().trim();

  // Land / Plots
  if (
    t.includes('plot') ||
    t.includes('land') ||
    t === 'residential_plot' ||
    t === 'commercial_plot' ||
    t === 'industrial_plot' ||
    t === 'agricultural_land'
  ) {
    return 'land_plot';
  }

  // Commercial
  if (
    t === 'commercial' ||
    t === 'commercial_office' ||
    t === 'coworking_space' ||
    t === 'retail_shop' ||
    t === 'showroom' ||
    t === 'commercial_space_hall' ||
    t === 'warehouse_godown' ||
    t === 'industrial_shed_factory' ||
    t === 'hotel_guest_house' ||
    t.includes('office') ||
    t.includes('shop') ||
    t.includes('warehouse') ||
    t.includes('showroom')
  ) {
    return 'commercial';
  }

  // Default to residential
  return 'residential';
};

// Helper: Formatted label for any type
export const getTypeLabel = (type) => {
  if (!type) return 'Real Estate Asset';
  const found = ALL_PROPERTY_TYPES.find((item) => item.id === type);
  if (found) return found.label;

  // Legacy mappings
  const legacyMap = {
    apartment: 'Apartment / Flat',
    villa: 'Luxury Villa',
    plot: 'Residential Plot',
    commercial: 'Commercial Space',
    independent_house: 'Independent House',
    flat: 'Apartment / Flat',
    land: 'Land / Plot',
  };

  if (legacyMap[type]) return legacyMap[type];

  // Fallback: capitalize snake_case
  return String(type)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

// Helper: Parent category label
export const getParentCategoryLabel = (categoryOrType) => {
  const cat = getParentCategory(categoryOrType);
  return PROPERTY_TAXONOMY[cat]?.label || 'Real Estate';
};

// Helper: Check if property is plot or land
export const isPlotOrLand = (type) => {
  return getParentCategory(type) === 'land_plot';
};

// Helper: Check if property is commercial
export const isCommercial = (type) => {
  return getParentCategory(type) === 'commercial';
};

// Helper: Check if property is residential
export const isResidential = (type) => {
  return getParentCategory(type) === 'residential';
};

// Field visibility guards
export const shouldShowBhk = (type) => {
  return isResidential(type);
};

export const shouldShowFurnishing = (type) => {
  // Plots never have furnishing
  return !isPlotOrLand(type);
};

export const shouldShowFloor = (type) => {
  if (isPlotOrLand(type)) return false;
  const t = String(type).toLowerCase();
  if (['bungalow', 'villa', 'farm_house'].includes(t)) return false;
  return true;
};
