/**
 * Data Module - Loads and provides access to county and statewide statistics
 * 
 * This module handles:
 * - Loading county data from JSON
 * - Computing statewide statistics (averages, min, max)
 * - Providing helper functions to access data by FIPS code or name
 * - Computing ranks for all metrics
 */

// Data storage
let countiesData = [];
let countiesMap = new Map(); // For quick lookup by name
let countiesByFips = new Map(); // For quick lookup by FIPS
let statewideStats = null;
let metricsConfig = null;

/**
 * Paired Metrics Configuration
 * Some metrics need to be displayed together (e.g., growth vs benchmark)
 * When viewing any metric in a group, show all metrics in that group
 */
export const PAIRED_METRICS = {
  // Property Tax Growth Group (Table 12)
  propertyTaxGrowth2014_2024: {
    groupName: 'Property Tax Growth vs. Population and Inflation (2014-2024)',
    primary: 'propertyTaxGrowth2014_2024',
    benchmark: 'popInflationGrowth2014_2024',
    metrics: ['propertyTaxGrowth2014_2024', 'popInflationGrowth2014_2024'],
    labels: {
      propertyTaxGrowth2014_2024: 'Tax Growth',
      popInflationGrowth2014_2024: 'Population & Inflation'
    }
  },
  // County Expenditure Growth Group (Table 30)
  countyExpenditureGrowth2013_2024: {
    groupName: 'County Expenditure Growth vs. Population and Inflation',
    primary: 'countyExpenditureGrowth2013_2024',
    benchmark: 'popInflationGrowth2013_2024',
    metrics: ['countyExpenditureGrowth2013_2024', 'popInflationGrowth2013_2024'],
    labels: {
      countyExpenditureGrowth2013_2024: 'Tax Growth',
      popInflationGrowth2013_2024: 'Pop. & Inflation'
    }
  },
  popInflationGrowth2013_2024: {
    groupName: 'County Expenditure Growth vs. Population and Inflation',
    primary: 'countyExpenditureGrowth2013_2024',
    benchmark: 'popInflationGrowth2013_2024',
    metrics: ['countyExpenditureGrowth2013_2024', 'popInflationGrowth2013_2024'],
    labels: {
      countyExpenditureGrowth2013_2024: 'Tax Growth',
      popInflationGrowth2013_2024: 'Pop. & Inflation'
    }
  }
};

/**
 * Get paired metrics info for a metric (if any)
 */
export function getPairedMetricsInfo(metricKey) {
  return PAIRED_METRICS[metricKey] || null;
}

/**
 * City Property Tax Growth Data (2014-2024)
 * Growth in Property Taxes for the 50 Largest Florida Cities
 * Maps city name to { county, rank, growth }
 */
export const CITY_PROPERTY_TAX_GROWTH = {
  'Apopka': { county: 'Orange', rank: 1, growth: 372.0 },
  'Saint Cloud': { county: 'Osceola', rank: 2, growth: 294.9 },
  'North Port': { county: 'Sarasota', rank: 3, growth: 293.5 },
  'Port Saint Lucie': { county: 'Saint Lucie', rank: 4, growth: 257.0 },
  'Homestead': { county: 'Miami-Dade', rank: 5, growth: 191.4 },
  'Lakeland': { county: 'Polk', rank: 6, growth: 179.1 },
  'Gainesville': { county: 'Alachua', rank: 7, growth: 178.5 },
  'Hialeah': { county: 'Miami-Dade', rank: 8, growth: 175.4 },
  'Tampa': { county: 'Hillsborough', rank: 9, growth: 171.7 },
  'Deltona': { county: 'Volusia', rank: 10, growth: 170.4 },
  'Sanford': { county: 'Seminole', rank: 11, growth: 164.6 },
  'Orlando': { county: 'Orange', rank: 12, growth: 164.2 },
  'Kissimmee': { county: 'Osceola', rank: 13, growth: 161.5 },
  'Palm Bay': { county: 'Brevard', rank: 14, growth: 158.2 },
  'West Palm Beach': { county: 'Palm Beach', rank: 15, growth: 156.3 },
  'Clearwater': { county: 'Pinellas', rank: 16, growth: 155.8 },
  'Miami Gardens': { county: 'Miami-Dade', rank: 17, growth: 155.7 },
  'Palm Coast': { county: 'Flagler', rank: 18, growth: 152.9 },
  'Port Orange': { county: 'Volusia', rank: 19, growth: 150.6 },
  'Miami': { county: 'Miami-Dade', rank: 20, growth: 150.3 },
  'North Miami': { county: 'Miami-Dade', rank: 21, growth: 149.6 },
  'Saint Petersburg': { county: 'Pinellas', rank: 22, growth: 147.2 },
  'Lauderhill': { county: 'Broward', rank: 23, growth: 146.3 },
  'Largo': { county: 'Pinellas', rank: 24, growth: 145.9 },
  'Coral Springs': { county: 'Broward', rank: 25, growth: 145.4 },
  'Pompano Beach': { county: 'Broward', rank: 26, growth: 141.7 },
  'Weston': { county: 'Broward', rank: 27, growth: 141.4 },
  'Daytona Beach': { county: 'Volusia', rank: 28, growth: 136.4 },
  'Boynton Beach': { county: 'Palm Beach', rank: 29, growth: 130.6 },
  'Tamarac': { county: 'Broward', rank: 30, growth: 129.7 },
  'Ocala': { county: 'Marion', rank: 31, growth: 127.0 },
  'Hollywood': { county: 'Broward', rank: 32, growth: 126.0 },
  'Davie': { county: 'Broward', rank: 33, growth: 125.2 },
  'Fort Lauderdale': { county: 'Broward', rank: 34, growth: 125.0 },
  'Tallahassee': { county: 'Leon', rank: 35, growth: 122.5 },
  'Boca Raton': { county: 'Palm Beach', rank: 36, growth: 120.4 },
  'Miramar': { county: 'Broward', rank: 37, growth: 114.6 },
  'Miami Beach': { county: 'Miami-Dade', rank: 38, growth: 111.4 },
  'Fort Myers': { county: 'Lee', rank: 39, growth: 110.3 },
  'Melbourne': { county: 'Brevard', rank: 40, growth: 108.2 },
  'Delray Beach': { county: 'Palm Beach', rank: 41, growth: 106.0 },
  'Deerfield Beach': { county: 'Broward', rank: 42, growth: 103.5 },
  'Jupiter': { county: 'Palm Beach', rank: 43, growth: 102.6 },
  'Palm Beach Gardens': { county: 'Palm Beach', rank: 44, growth: 102.1 },
  'Sunrise': { county: 'Broward', rank: 45, growth: 100.1 },
  'Wellington': { county: 'Palm Beach', rank: 46, growth: 99.5 },
  'Pembroke Pines': { county: 'Broward', rank: 47, growth: 98.0 },
  'Cape Coral': { county: 'Lee', rank: 48, growth: 94.9 },
  'Doral': { county: 'Miami-Dade', rank: 49, growth: 89.4 },
  'Plantation': { county: 'Broward', rank: 49, growth: 89.4 }
};

// Statewide city average for comparison
export const CITY_STATEWIDE_GROWTH = 135.3;

/**
 * Municipal Expenditure Growth Data (FY 2012-13 to FY 2023-24)
 * Expenditure Growth vs. Population and Inflation for the 70 Largest Florida Cities
 * Ranked by expenditure growth (highest = rank 1)
 */
export const MUNICIPAL_EXPENDITURE_GROWTH = {
  'Doral': { county: 'Miami-Dade', rank: 1, expenditureGrowth: 272.1, popInflationGrowth: 117.2 },
  'North Port': { county: 'Sarasota', rank: 2, expenditureGrowth: 199.1, popInflationGrowth: 92.3 },
  'Bonita Springs': { county: 'Lee', rank: 3, expenditureGrowth: 167.8, popInflationGrowth: 59.6 },
  'Palm Beach Gardens': { county: 'Palm Beach', rank: 4, expenditureGrowth: 114.8, popInflationGrowth: 63.7 },
  'Clermont': { county: 'Lake', rank: 5, expenditureGrowth: 107.9, popInflationGrowth: 106.7 },
  'Winter Garden': { county: 'Orange', rank: 6, expenditureGrowth: 105.0, popInflationGrowth: 79.8 },
  'Cape Coral': { county: 'Lee', rank: 7, expenditureGrowth: 100.0, popInflationGrowth: 74.2 },
  'Palm Coast': { county: 'Flagler', rank: 8, expenditureGrowth: 94.4, popInflationGrowth: 73.7 },
  'Lauderhill': { county: 'Broward', rank: 9, expenditureGrowth: 89.1, popInflationGrowth: 46.6 },
  'Palm Bay': { county: 'Brevard', rank: 10, expenditureGrowth: 88.5, popInflationGrowth: 67.7 },
  'Greenacres': { county: 'Palm Beach', rank: 11, expenditureGrowth: 85.9, popInflationGrowth: 56.7 },
  'Jupiter': { county: 'Palm Beach', rank: 12, expenditureGrowth: 85.7, popInflationGrowth: 42.6 },
  'West Palm Beach': { county: 'Palm Beach', rank: 13, expenditureGrowth: 82.8, popInflationGrowth: 56.0 },
  'Pompano Beach': { county: 'Broward', rank: 14, expenditureGrowth: 81.9, popInflationGrowth: 45.0 },
  'Apopka': { county: 'Orange', rank: 15, expenditureGrowth: 81.0, popInflationGrowth: 73.8 },
  'Tampa': { county: 'Hillsborough', rank: 16, expenditureGrowth: 79.2, popInflationGrowth: 54.2 },
  'Port Saint Lucie': { county: 'Saint Lucie', rank: 17, expenditureGrowth: 78.2, popInflationGrowth: 87.8 },
  'Oakland Park': { county: 'Broward', rank: 18, expenditureGrowth: 77.9, popInflationGrowth: 40.2 },
  'Daytona Beach': { county: 'Volusia', rank: 19, expenditureGrowth: 76.2, popInflationGrowth: 71.8 },
  'Fort Myers': { county: 'Lee', rank: 20, expenditureGrowth: 74.3, popInflationGrowth: 91.6 },
  'North Lauderdale': { county: 'Broward', rank: 21, expenditureGrowth: 73.3, popInflationGrowth: 39.8 },
  'Kissimmee': { county: 'Osceola', rank: 22, expenditureGrowth: 73.0, popInflationGrowth: 70.9 },
  'Winter Haven': { county: 'Polk', rank: 23, expenditureGrowth: 72.3, popInflationGrowth: 102.2 },
  'Orlando': { county: 'Orange', rank: 24, expenditureGrowth: 71.6, popInflationGrowth: 71.8 },
  'Miramar': { county: 'Broward', rank: 25, expenditureGrowth: 69.2, popInflationGrowth: 44.0 },
  'Miami Beach': { county: 'Miami-Dade', rank: 26, expenditureGrowth: 68.9, popInflationGrowth: 20.8 },
  'Largo': { county: 'Pinellas', rank: 27, expenditureGrowth: 68.8, popInflationGrowth: 41.5 },
  'Delray Beach': { county: 'Palm Beach', rank: 28, expenditureGrowth: 68.2, popInflationGrowth: 43.1 },
  'Saint Cloud': { county: 'Osceola', rank: 29, expenditureGrowth: 68.1, popInflationGrowth: 109.8 },
  'Boca Raton': { county: 'Palm Beach', rank: 30, expenditureGrowth: 67.6, popInflationGrowth: 53.7 },
  'Ocoee': { county: 'Orange', rank: 31, expenditureGrowth: 63.9, popInflationGrowth: 73.9 },
  'Boynton Beach': { county: 'Palm Beach', rank: 32, expenditureGrowth: 62.1, popInflationGrowth: 54.2 },
  'Port Orange': { county: 'Volusia', rank: 33, expenditureGrowth: 61.1, popInflationGrowth: 49.9 },
  'Clearwater': { county: 'Pinellas', rank: 34, expenditureGrowth: 60.8, popInflationGrowth: 43.4 },
  'Pembroke Pines': { county: 'Broward', rank: 35, expenditureGrowth: 60.5, popInflationGrowth: 44.8 },
  'Sarasota': { county: 'Sarasota', rank: 36, expenditureGrowth: 60.4, popInflationGrowth: 42.3 },
  'Miami': { county: 'Miami-Dade', rank: 37, expenditureGrowth: 59.8, popInflationGrowth: 45.5 },
  'Hollywood': { county: 'Broward', rank: 37, expenditureGrowth: 59.8, popInflationGrowth: 41.6 },
  'Deltona': { county: 'Volusia', rank: 39, expenditureGrowth: 59.3, popInflationGrowth: 49.8 },
  'North Miami': { county: 'Miami-Dade', rank: 40, expenditureGrowth: 56.5, popInflationGrowth: 31.4 },
  'Wellington': { county: 'Palm Beach', rank: 41, expenditureGrowth: 53.8, popInflationGrowth: 39.9 },
  'Melbourne': { county: 'Brevard', rank: 42, expenditureGrowth: 53.7, popInflationGrowth: 49.0 },
  'Hialeah': { county: 'Miami-Dade', rank: 43, expenditureGrowth: 53.2, popInflationGrowth: 31.2 },
  'Saint Petersburg': { county: 'Pinellas', rank: 44, expenditureGrowth: 52.1, popInflationGrowth: 40.0 },
  'Coconut Creek': { county: 'Broward', rank: 45, expenditureGrowth: 51.6, popInflationGrowth: 41.6 },
  'Titusville': { county: 'Brevard', rank: 46, expenditureGrowth: 50.3, popInflationGrowth: 50.5 },
  'Bradenton': { county: 'Manatee', rank: 47, expenditureGrowth: 49.6, popInflationGrowth: 49.2 },
  'Davie': { county: 'Broward', rank: 48, expenditureGrowth: 48.8, popInflationGrowth: 50.4 },
  'Sunrise': { county: 'Broward', rank: 49, expenditureGrowth: 44.9, popInflationGrowth: 48.8 },
  'Sanford': { county: 'Seminole', rank: 50, expenditureGrowth: 44.7, popInflationGrowth: 57.6 },
  'Ocala': { county: 'Marion', rank: 51, expenditureGrowth: 43.2, popInflationGrowth: 52.2 },
  'Fort Pierce': { county: 'Saint Lucie', rank: 52, expenditureGrowth: 43.1, popInflationGrowth: 56.1 },
  'Weston': { county: 'Broward', rank: 53, expenditureGrowth: 43.0, popInflationGrowth: 36.7 },
  'Homestead': { county: 'Miami-Dade', rank: 54, expenditureGrowth: 42.9, popInflationGrowth: 71.0 },
  'Gainesville': { county: 'Alachua', rank: 55, expenditureGrowth: 40.4, popInflationGrowth: 56.4 },
  'Coral Gables': { county: 'Miami-Dade', rank: 56, expenditureGrowth: 39.3, popInflationGrowth: 40.1 },
  'Pensacola': { county: 'Escambia', rank: 57, expenditureGrowth: 38.5, popInflationGrowth: 38.9 },
  'Deerfield Beach': { county: 'Broward', rank: 58, expenditureGrowth: 35.8, popInflationGrowth: 51.9 },
  'Jacksonville': { county: 'Duval', rank: 59, expenditureGrowth: 35.6, popInflationGrowth: 58.7 },
  'Altamonte Springs': { county: 'Seminole', rank: 60, expenditureGrowth: 34.9, popInflationGrowth: 46.8 },
  'Tamarac': { county: 'Broward', rank: 61, expenditureGrowth: 34.6, popInflationGrowth: 57.3 },
  'Pinellas Park': { county: 'Pinellas', rank: 62, expenditureGrowth: 34.4, popInflationGrowth: 46.4 },
  'Lakeland': { county: 'Polk', rank: 63, expenditureGrowth: 33.5, popInflationGrowth: 62.5 },
  'Cutler Bay': { county: 'Miami-Dade', rank: 64, expenditureGrowth: 32.5, popInflationGrowth: 42.3 },
  'Tallahassee': { county: 'Leon', rank: 65, expenditureGrowth: 30.1, popInflationGrowth: 44.5 },
  'Plantation': { county: 'Broward', rank: 66, expenditureGrowth: 29.5, popInflationGrowth: 46.6 },
  'Margate': { county: 'Broward', rank: 67, expenditureGrowth: 26.0, popInflationGrowth: 39.9 },
  'Miami Gardens': { county: 'Miami-Dade', rank: 68, expenditureGrowth: 21.8, popInflationGrowth: 41.2 },
  'Coral Springs': { county: 'Broward', rank: 69, expenditureGrowth: 17.1, popInflationGrowth: 44.4 },
  'Fort Lauderdale': { county: 'Broward', rank: 70, expenditureGrowth: 4.0, popInflationGrowth: 46.3 }
};

/**
 * Counties that contain at least one of the 70 largest cities
 * Used for filtering the county dropdown and map coloring
 */
export const MUNICIPAL_EXPENDITURE_COUNTIES = new Set(
  Object.values(MUNICIPAL_EXPENDITURE_GROWTH).map(c => c.county)
);

/**
 * Get municipal expenditure growth cities in a county
 * @param {string} countyName - The county name
 * @returns {Array} Array of city objects sorted by rank
 */
export function getMunicipalGrowthCitiesInCounty(countyName) {
  const cities = [];
  for (const [city, data] of Object.entries(MUNICIPAL_EXPENDITURE_GROWTH)) {
    if (data.county.toLowerCase() === countyName.toLowerCase()) {
      cities.push({ city, ...data });
    }
  }
  return cities.sort((a, b) => a.rank - b.rank);
}

/**
 * Get ALL municipal expenditure growth cities sorted by rank (for statewide view)
 * @returns {Array} All 70 cities sorted by rank
 */
export function getAllMunicipalGrowthCities() {
  return Object.entries(MUNICIPAL_EXPENDITURE_GROWTH)
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => a.rank - b.rank);
}

/**
 * Check if a metric is the municipal expenditure growth metric
 */
export function isMunicipalExpenditureMetric(metricKey) {
  return metricKey === 'municipalExpenditureGrowth';
}

/**
 * Get cities in a county that are in the top 50 largest cities
 * @param {string} countyName - The county name
 * @returns {Array} Array of { city, rank, growth } sorted by rank
 */
export function getCitiesInCounty(countyName) {
  const cities = [];
  for (const [city, data] of Object.entries(CITY_PROPERTY_TAX_GROWTH)) {
    if (data.county.toLowerCase() === countyName.toLowerCase()) {
      cities.push({ city, rank: data.rank, growth: data.growth });
    }
  }
  return cities.sort((a, b) => a.rank - b.rank);
}

/**
 * Metric configuration - defines all available metrics and their display properties
 * This is extensible for 60+ tables worth of data
 */
export const METRICS_CONFIG = {
  // Population
  population: {
    name: 'Total County Population (April 1, 2025)',
    shortName: 'Population',
    category: 'populationMisc',
    format: 'number',
    description: 'Total county population estimates as of April 1, 2025.',
    higherIsBetter: null,
    year: 2025,
    source: 'Table 1'
  },
  percentUnincorporated: {
    name: 'Percentage of Population Living in Unincorporated Areas',
    shortName: 'Percentage of Population Living in Unincorporated Areas',
    category: 'populationMisc',
    format: 'percent',
    description: 'Percentage of county population living in unincorporated areas as of April 1, 2025.',
    higherIsBetter: null,
    year: 2025,
    source: 'Table 2'
  },
  populationDensity: {
    name: 'Population Density by County',
    shortName: 'Population Density by County',
    category: 'populationMisc',
    format: 'number',
    description: 'Population per square mile (2025).',
    higherIsBetter: null,
    year: 2025,
    source: 'Table 3'
  },
  perCapitaPersonalIncome: {
    name: 'Per Capita County Personal Income',
    shortName: 'Per Capita County Personal Income',
    category: 'populationMisc',
    format: 'currency',
    description: 'Per capita personal income by county (2023).',
    higherIsBetter: true,
    year: 2023,
    source: 'Table 4'
  },
  unemploymentRate: {
    name: 'Unemployment Rate by County',
    shortName: 'Unemployment Rate by County',
    category: 'populationMisc',
    format: 'percent',
    description: 'Unemployment rate by county (August 2025). Not seasonally adjusted.',
    higherIsBetter: false,
    year: 2025,
    source: 'Table 5'
  },

  // Property Tax Levies (Per Capita)
  perCapitaTotalPropertyTaxLevies: {
    name: 'Per Capita Total Property Tax Levies',
    shortName: 'Per Capita Total Property Tax Levies',
    category: 'propertyTax',
    format: 'currency',
    description: 'Includes all taxing jurisdictions in each county (counties, cities, school districts and special districts) and uses total county population.',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 6'
  },
  perCapitaCountyPropertyTaxLevies: {
    name: 'Per Capita County Government Property Tax Levies',
    shortName: 'Per Capita County Government Property Tax Levies',
    category: 'propertyTax',
    format: 'currency',
    description: 'Includes county government operating levies, county government debt service levies, dependent special districts and municipal service taxing units (MSTUs).',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 7'
  },
  perCapitaMunicipalPropertyTaxLevies: {
    name: 'Per Capita Municipal Government Property Tax Levies',
    shortName: 'Per Capita Municipal Government Property Tax Levies',
    category: 'propertyTax',
    format: 'currency',
    description: 'Per capita municipal levies were calculated by dividing all municipal levies in a county by total county population. *Levies for Jacksonville\'s consolidated government are included in the county government table. Duval\'s levies are for Atlantic Beach, Baldwin, Jacksonville Beach, and Neptune Beach.',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 8'
  },
  perCapitaSchoolPropertyTaxLevies: {
    name: 'Per Capita School District Property Tax Levies',
    shortName: 'Per Capita School District Property Tax Levies',
    category: 'propertyTax',
    format: 'currency',
    description: 'Includes both school board operating and debt service levies.',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 9'
  },
  perCapitaSpecialDistrictPropertyTaxLevies: {
    name: 'Per Capita Independent Special District Property Tax Levies',
    shortName: 'Per Capita Independent Special District Property Tax Levies',
    category: 'propertyTax',
    format: 'currency',
    description: 'Includes independent districts only. Dependent districts are included in the county government table. Calculated using total county population.',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 10'
  },
  
  // Millage Rates
  avgTotalMillageRate: {
    name: 'Average Total Property Tax Millage Rates',
    shortName: 'Average Total Property Tax Millage Rates',
    category: 'propertyTax',
    format: 'millage',
    description: 'Includes all jurisdictions. Calculated using total property tax levies and total taxable value in each county. School district portion calculated using school taxable value, the rest using county taxable value.',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 11'
  },
  
  // Save Our Homes & 2008 Amendment Impact
  perCapitaSaveOurHomesImpact: {
    name: 'Per Capita Impact of Save Our Homes in Taxes',
    shortName: 'Per Capita Impact of Save Our Homes in Taxes',
    category: 'propertyTax',
    format: 'currency',
    description: 'Represents the amount of property taxes reduced or shifted to other taxpayers by Save Our Homes. Calculated using current average millage rates applied to Save Our Homes differential (just value minus assessed value) of homestead properties.',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 13'
  },
  perCapita2008AmendmentImpact: {
    name: 'Per Capita Impact of 2008 Property Tax Constitutional Amendment in Taxes',
    shortName: 'Per Capita Impact of 2008 Property Tax Constitutional Amendment in Taxes',
    category: 'propertyTax',
    format: 'currency',
    description: 'Represents the amount of property taxes reduced or shifted to other taxpayers by Amendment 1 which increased the Homestead Exemption from $25,000 to $50,000, permits residents to take Save Our Homes benefits to a new homestead property when they move, grants a $25,000 exemption for tangible personal property paid by businesses, and limits increases in assessed value for nonhomestead properties to no more than 10%.',
    higherIsBetter: null,
    year: 2025,
    source: 'Table 14'
  },
  
  // Property Tax Growth
  propertyTaxGrowth2014_2024: {
    name: 'Property Tax Growth vs. Population and Inflation (2014-2024)',
    shortName: 'Tax Growth vs Pop & Inflation',
    category: 'propertyTax',
    format: 'percent',
    description: 'Includes all taxing jurisdictions in each county (counties, cities, school districts and special districts).',
    higherIsBetter: false,
    year: 2024,
    source: 'Table 12'
  },
  popInflationGrowth2014_2024: {
    name: 'Population + Inflation Growth (2014-2024)',
    shortName: 'Pop+Inflation 10yr',
    category: 'propertyTax',
    format: 'percent',
    description: '10-year combined growth in population and inflation',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 12',
    hidden: true
  },
  perCapitaExcessTaxGrowth: {
    name: 'Per Capita Property Taxes that Exceed Combined Population and Inflation Growth (2014-2024)',
    shortName: 'Per Capita Property Taxes that Exceed Combined Population and Inflation Growth (2014-2024)',
    category: 'propertyTax',
    format: 'currency',
    description: 'Includes all taxing jurisdictions in each county (counties, cities, school districts and special districts).',
    higherIsBetter: false,
    year: '2014-2024',
    source: 'Table 12'
  },
  countyExpenditureGrowth2013_2024: {
    name: 'County Expenditure Growth vs. Population and Inflation',
    shortName: 'County Expenditure Growth vs. Population and Inflation',
    category: 'countyMunicipalExpenditure',
    format: 'percent',
    description: 'Total growth in county government expenditures from FY 2012-13 to FY 2023-24.',
    higherIsBetter: false,
    year: 'FY 2012-13 to FY 2023-24',
    source: 'Table 30',
    countyNotes: {
      'Washington': '* Large infrastructure and other fixed capital outlay projects can skew expenditures, especially in smaller counties.\nWashington County had $50 million in transportation spending in 2023, approximately two-thirds of total spending.'
    }
  },
  popInflationGrowth2013_2024: {
    name: 'Population + Inflation Growth',
    shortName: 'Population + Inflation Growth',
    category: 'countyMunicipalExpenditure',
    format: 'percent',
    description: 'Combined growth of population and inflation (CPI) from FY 2012-13 to FY 2023-24. Used as a benchmark for reasonable expenditure growth.',
    higherIsBetter: null,
    year: 'FY 2012-13 to FY 2023-24',
    source: 'Table 30',
    hidden: true
  },
  municipalExpenditureGrowth: {
    name: 'Municipal Expenditure Growth vs. Population and Inflation for the 70 Largest Florida Cities',
    shortName: 'Municipal Expenditure Growth vs. Population and Inflation (Top 70 Cities)',
    category: 'countyMunicipalExpenditure',
    format: 'percent',
    description: 'Includes only municipal expenditures and population.',
    higherIsBetter: false,
    year: 'FY 2012-13 to FY 2023-24',
    source: 'Florida Legislature, Office of Economic and Demographic Research, Florida Department of Financial Services and Florida TaxWatch, November 2025',
    isCityLevel: true
  },
  percentTaxableJustValue: {
    name: 'Percent of Total Just Value that is Taxable',
    shortName: 'Percent of Total Just Value that is Taxable',
    category: 'propertyTax',
    format: 'percent',
    description: 'Shows the effect that various exclusions, differentials, exemptions, and credits have on the ad valorem tax base of local governments.',
    higherIsBetter: true,
    year: 2025,
    source: 'Table 15'
  },
  perCapitaJustValue: {
    name: 'Per Capita Just Value',
    shortName: 'Per Capita Just Value',
    category: 'propertyTax',
    format: 'currency',
    description: 'Just value is the full market value, the starting point for calculating a property’s taxable value.',
    higherIsBetter: true,
    year: 2025
  },
  perCapitaTaxableValue: {
    name: 'Per Capita Taxable Value',
    shortName: 'Per Capita Taxable Value',
    category: 'propertyTax',
    format: 'currency',
    description: 'Taxable value is just value of all property in each county, reduced by exclusions, differentials, exemptions, and credits.',
    higherIsBetter: true,
    year: 2025,
    source: 'Table 17'
  },
  totalPropertyTaxLeviesPer1000Income: {
    name: 'Total Property Tax Levies Per $1,000 of Personal Income',
    shortName: 'Tax / $1k Income',
    category: 'propertyTax',
    format: 'currency',
    description: 'Includes all taxing jurisdictions in each county. Calculated using 2023 levies and 2023 personal income.',
    higherIsBetter: false,
    year: 2023,
    source: 'Table 18'
  },
  localOptionSalesTaxRate: {
    name: 'Local Option Sales Tax Rate',
    shortName: 'Sales Tax Rate',
    category: 'salesTax',
    format: 'percent',
    description: 'Local option sales tax rates as of June 1, 2025. Includes school district levies.',
    higherIsBetter: false,
    year: 2025,
    source: 'Table 19'
  },
  perCapitaLocalOptionSalesTaxRevenue: {
    name: 'Per Capita Local Option Sales Tax Revenue',
    shortName: 'Sales Tax Rev / Capita',
    category: 'salesTax',
    format: 'currency',
    description: 'The majority of local option sales tax revenues are distributed to county governments, but some money goes to municipalities and school boards as well.',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 20'
  },
  percentSalesTaxRevenueLevied: {
    name: 'Percent of Available Local Option Sales Tax Revenue Being Levied',
    shortName: '% Sales Tax Levied',
    category: 'salesTax',
    format: 'percent',
    description: 'The percentage of the maximum potential local option sales tax revenue that is currently being levied.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 21'
  },
  localOptionMotorFuelTaxRate: {
    name: 'Local Option Motor Fuel Tax Rate',
    shortName: 'Fuel Tax Rate',
    category: 'fuelTax',
    format: 'currency',
    description: 'Local option motor fuel tax rates as of January 1, 2025. Includes the 9th cents tax, local option tax, and additional local option tax.',
    higherIsBetter: false,
    year: 2025,
    source: 'Table 22'
  },
  perCapitaLocalOptionMotorFuelTaxRevenue: {
    name: 'Per Capita Local Option Motor Fuel Tax Revenue',
    shortName: 'Fuel Tax Rev / Capita',
    category: 'fuelTax',
    format: 'currency',
    description: 'Local option motor fuel tax revenues are distributed to county and municipal governments and are generally used for transportation purposes.',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 23'
  },
  percentFuelTaxRevenueLevied: {
    name: 'Percent of Available Local Option Motor Fuel Tax Revenue Being Levied',
    shortName: '% Fuel Tax Levied',
    category: 'fuelTax',
    format: 'percent',
    description: 'The percentage of the maximum potential local option motor fuel tax revenue that is currently being levied.',
    higherIsBetter: null,
    year: 2025,
    source: 'Table 24'
  },
  localOptionTouristDevelopmentTaxRate: {
    name: 'Local Option Tourist Development Tax Rate',
    shortName: 'Tourist Tax Rate',
    category: 'touristTax',
    format: 'percent',
    description: 'Includes tourist development taxes, tourist impact taxes, professional sport franchise taxes and convention development taxes.',
    higherIsBetter: false,
    year: 2025,
    source: 'Table 25'
  },
  perCapitaLocalOptionTouristDevelopmentTaxRevenue: {
    name: 'Per Capita Local Option Tourist Development Tax Revenue',
    shortName: 'Tourist Tax Rev / Capita',
    category: 'touristTax',
    format: 'currency',
    description: 'Includes tourist development taxes, tourist impact taxes, professional sport franchise taxes and convention development taxes.',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 26'
  },
  perCapitaLocalCommunicationsServicesTaxRevenue: {
    name: 'Per Capita Local Communications Services Tax Revenue',
    shortName: 'Comm. Tax Rev / Capita',
    category: 'communicationsTax',
    format: 'currency',
    description: 'Counties and cities may levy the tax on telecommunications and cable services. Rates range from 0.3% to 7.7%.',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 27'
  },
  perCapitaLocalPublicServicesTaxRevenue: {
    name: 'Per Capita Local Public Services Tax Revenue',
    shortName: 'Public Svc Tax Rev / Capita',
    category: 'publicServicesTax',
    format: 'currency',
    description: 'Municipalities and charter counties may impose a tax on purchases of electricity, gas, and water service. Most jurisdictions levy the maximum rate of 10%.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 28'
  },
  perCapitaBuildingPermitFees: {
    name: 'Per Capita County and Municipal Building Permit Fees',
    shortName: 'Permit Fees / Capita',
    category: 'regulatoryFees',
    format: 'currency',
    description: 'These fees are regulatory fees imposed by both cities and counties. Such fees should not exceed the regulated activity’s cost.',
    higherIsBetter: null, // Neutral
    year: 2023
  },
  perCapitaImpactFees: {
    name: 'Per Capita County, Municipal and School Impact Fees',
    shortName: 'Impact Fees / Capita',
    category: 'regulatoryFees',
    format: 'currency',
    description: 'Includes school district, city and county fees. Impact fees are charges imposed by local governments against new development to provide for capital facilities’ costs made necessary by population growth.',
    higherIsBetter: null, // Neutral
    year: 2023,
    source: 'Table 31'
  },
  perCapitaSpecialAssessments: {
    name: 'Per Capita County, Municipal, and Independent Special District Special Assessment Revenue',
    shortName: 'Special Assessments / Capita',
    category: 'regulatoryFees',
    format: 'currency',
    description: 'Reflects total county and municipal assessments divided by total county population. Special assessments can fund items such as garbage disposal, sewer improvements, fire protection, street improvements, and downtown redevelopment.',
    higherIsBetter: null,
    year: 2021,
    source: 'Table 32'
  },
  
  // Revenue metrics
  perCapitaTotalRevenue: {
    name: 'Per Capita Total County and Municipal Government Revenue',
    shortName: 'Total Revenue / Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Includes all reported county and city government revenues and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 33'
  },
  perCapitaMunicipalRevenue: {
    name: 'Per Capita Total Municipal Revenue',
    shortName: 'Municipal Revenue / Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Includes all reported city government revenues and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 34'
  },
  perCapitaMunicipalRevenueIncorporated: {
    name: 'Per Capita Total Municipal Revenue (Incorporated Population)',
    shortName: 'Muni Rev / Incorp Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Includes all reported city government revenues and uses incorporated population (people living in municipalities) to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 35'
  },
  perCapitaCountyRevenue: {
    name: 'Per Capita Total County Revenue',
    shortName: 'County Rev / Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Includes county government revenue only and uses total county population. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 36'
  },
  perCapitaCountyMunicipalTaxRevenue: {
    name: 'Per Capita County and Municipal Tax Revenue',
    shortName: 'Tax Rev / Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Major tax sources include property taxes, public services tax, communications services tax, and local option sales and fuel taxes. Special assessments and impact fees are included in the next table.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 37'
  },
  perCapitaCountyMunicipalPermitsFeesAssessments: {
    name: 'Per Capita County and Municipal Permits, Fees, and Special Assessment Revenue',
    shortName: 'Permits/Fees/Assessments',
    category: 'revenue',
    format: 'currency',
    description: 'Includes special assessments, impact fees, building and other permits, franchise fees and license fees.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 38'
  },
  perCapitaCountyMunicipalIntergovernmentalRevenue: {
    name: 'Per Capita County and Municipal Intergovernmental Revenue',
    shortName: 'Intergov Rev / Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Intergovernmental revenue includes all revenues received from federal, state, and other local government sources in the form of grants, shared revenues, and payments in lieu of taxes.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 39'
  },
  perCapitaCountyMunicipalStateRevenue: {
    name: 'Per Capita Municipal and County Revenue from Florida’s State Government',
    shortName: 'State Rev / Capita',
    category: 'revenue',
    format: 'currency',
    description: 'Includes state grants, state revenue sharing, and payments in lieu of taxes.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 40'
  },
  perCapitaCountyMunicipalChargesForServices: {
    name: 'Per Capita County and Municipal Charges for Services',
    shortName: 'Charges for Services',
    category: 'revenue',
    format: 'currency',
    description: 'Charges for services are direct payments by private individuals or other governments for services provided. This includes such services as government owned utilities or waste collection.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 41'
  },
  perCapitaTaxRevenue: {
    name: 'Per Capita Tax Revenue',
    shortName: 'Tax Revenue',
    category: 'revenue',
    format: 'currency',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 42'
  },
  perCapitaIntergovernmentalRevenue: {
    name: 'Per Capita Intergovernmental Revenue',
    shortName: 'Intergovernmental Rev.',
    category: 'revenue',
    format: 'currency',
    higherIsBetter: null,
    year: 2024,
    source: 'Table 43'
  },
  
  // Expenditure metrics
  perCapitaTotalExpenditure: {
    name: 'Per Capita Total County and Municipal Government Expenditures',
    shortName: 'Per Capita Total County and Municipal Government Expenditures',
    category: 'countyMunicipalExpenditure',
    format: 'currency',
    description: 'Includes all reported county and city government expenditures and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 'FY 2022-23',
    source: 'Table 44'
  },
  perCapitaMunicipalExpenditure: {
    name: 'Per Capita Total Municipal Expenditures',
    shortName: 'Per Capita Total Municipal Expenditures',
    category: 'countyMunicipalExpenditure',
    format: 'currency',
    description: 'Includes all reported city government expenditures and uses total county population to calculate per capita amounts. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 'FY 2022-23',
    source: 'Table 45'
  },
  perCapitaCountyExpenditure: {
    name: 'Per Capita Total County Expenditures',
    shortName: 'Per Capita Total County Expenditures',
    category: 'countyMunicipalExpenditure',
    format: 'currency',
    description: 'Includes county government expenditures only and uses total county population. Excludes custodial revenue and inter-fund transfers.',
    higherIsBetter: null,
    year: 'FY 2022-23',
    source: 'Table 46'
  },
  perCapitaGeneralGovernmentExpenditure: {
    name: 'Per Capita County and Municipal General Government Expenditures',
    shortName: 'General Govt Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'General government expenditures are those for basic governmental administration, including legislative, executive, financial, legal counsel, information technology (non-court related), and comprehensive planning. Also includes debt service and pension benefits.',
    higherIsBetter: false,
    year: 2023,
    source: 'Table 47'
  },
  perCapitaPublicSafetyExpenditure: {
    name: 'Per Capita County and Municipal Public Safety Expenditures',
    shortName: 'Public Safety Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Public safety expenditures include law enforcement, fire control, protective inspections, emergency and disaster relief, ambulance and rescue services, medical examiners, and consumer affairs.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 48'
  },
  perCapitaPhysicalEnvironmentExpenditure: {
    name: 'Per Capita County and Municipal Physical Environment Expenditures',
    shortName: 'Physical Env Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Physical environment expenditures include electric utility, gas and water utility services, garbage/solid waste control, sewer/wastewater services, conservation management, and flood control/storm water management.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 49'
  },
  perCapitaTransportationExpenditure: {
    name: 'Per Capita County and Municipal Transportation Expenditures',
    shortName: 'Transportation Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Includes spending on road and street facilities, airports, water transportation systems, and transit and parking facilities. This expenditure category does not include traffic control, law enforcement, and highway safety projects (in public safety).',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 50'
  },
  perCapitaEconomicEnvironmentExpenditure: {
    name: 'Per Capita County and Municipal Economic Environment Expenditures',
    shortName: 'Economic Env Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Economic environment includes spending on employment opportunity and development, industry development, veteran’s services and housing, and urban development.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 51'
  },
  perCapitaHumanServicesExpenditure: {
    name: 'Per Capita County and Municipal Human Services Expenditures',
    shortName: 'Human Services Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Human services include hospitals, health, mental health, public assistance, developmental disabilities, and other human services.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 52'
  },
  perCapitaCultureRecreationExpenditure: {
    name: 'Per Capita County and Municipal Cultural and Recreation Expenditures',
    shortName: 'Culture/Rec Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Cultural and recreational expenditures include libraries, parks and recreation, cultural services, special events, and special recreational facilities.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 53'
  },
  perCapitaCourtRelatedExpenditure: {
    name: 'Per Capita County and Municipal Court-Related Expenditures',
    shortName: 'Court-Related Exp',
    category: 'expenditure',
    format: 'currency',
    description: 'Includes general court and circuit court administration, state attorney, public defender and clerks of the court administration, guardian ad litem, hearing officers, dispute resolution, misdemeanor probation, legal aid and other court related expenditures.',
    higherIsBetter: null,
    year: 2023,
    source: 'Table 54'
  }
};

/**
 * Format a value based on its metric type
 */
export function formatValue(value, format) {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(value);
    
    case 'millage':
      return value.toFixed(2) + ' mills';
    
    case 'percent':
      return value.toFixed(1) + '%';
    
    case 'percentDecimal':
      return (value * 100).toFixed(1) + '%';
    
    case 'number':
      return new Intl.NumberFormat('en-US').format(value);
    
    default:
      return value.toString();
  }
}

/**
 * Load county data from JSON file
 */
export async function loadCountyData(url = './data/counties.json') {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load county data: ${response.statusText}`);
    }
    
    const data = await response.json();
    processCountyData(data);
    
    return countiesData;
  } catch (error) {
    console.error('Error loading county data:', error);
    throw error;
  }
}

/**
 * Process loaded county data - compute ranks, build lookup maps
 */
function processCountyData(data) {
  countiesData = data;
  
  // Build lookup maps
  countiesMap.clear();
  countiesByFips.clear();
  
  data.forEach(county => {
    // Normalize county name for lookup
    const normalizedName = county.name.toLowerCase().replace(/\s+/g, '');
    countiesMap.set(normalizedName, county);
    
    if (county.fips) {
      countiesByFips.set(county.fips, county);
    }
  });
  
  // Compute ranks for all numeric metrics
  computeRanks();

  // Compute aggregated municipal expenditure growth per county for map coloring
  const countyGrowthSums = {};
  for (const [, data] of Object.entries(MUNICIPAL_EXPENDITURE_GROWTH)) {
    if (!countyGrowthSums[data.county]) {
      countyGrowthSums[data.county] = { sum: 0, count: 0 };
    }
    countyGrowthSums[data.county].sum += data.expenditureGrowth;
    countyGrowthSums[data.county].count += 1;
  }
  for (const [countyName, agg] of Object.entries(countyGrowthSums)) {
    const county = getCountyByName(countyName);
    if (county) {
      county.municipalExpenditureGrowth = agg.sum / agg.count;
    }
  }

  // Compute statewide statistics
  computeStatewideStats();
}

/**
 * Compute ranks for all metrics (1 = highest value)
 */
function computeRanks() {
  const metricKeys = Object.keys(METRICS_CONFIG);
  
  metricKeys.forEach(metricKey => {
    // Get all counties with valid values for this metric
    const validCounties = countiesData.filter(c => 
      c[metricKey] !== null && c[metricKey] !== undefined
    );
    
    // Sort by value (descending - highest is rank 1)
    const sorted = [...validCounties].sort((a, b) => b[metricKey] - a[metricKey]);
    
    // Assign ranks
    sorted.forEach((county, index) => {
      // Find the county in original data and add rank
      const original = countiesData.find(c => c.name === county.name);
      if (original) {
        if (!original.ranks) {
          original.ranks = {};
        }
        original.ranks[metricKey] = index + 1;
      }
    });
  });
}

/**
 * Compute statewide statistics (average, min, max, median)
 */
function computeStatewideStats() {
  const stats = {
    countyCount: countiesData.length
  };
  
  const metricKeys = Object.keys(METRICS_CONFIG);
  
  metricKeys.forEach(metricKey => {
    const values = countiesData
      .map(c => c[metricKey])
      .filter(v => v !== null && v !== undefined);
    
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      const sorted = [...values].sort((a, b) => a - b);
      
      stats[metricKey] = {
        average: sum / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        median: sorted[Math.floor(sorted.length / 2)],
        count: values.length
      };
    }
  });
  
  statewideStats = stats;
}

/**
 * Get a county by its FIPS code
 */
export function getCountyByFips(fips) {
  return countiesByFips.get(fips) || null;
}

/**
 * Get a county by name (case-insensitive, handles variations)
 */
export function getCountyByName(name) {
  if (!name) return null;
  
  // Try exact match first
  const normalizedName = name.toLowerCase().replace(/\s+/g, '').replace('county', '');
  
  // Handle common name variations
  const variations = [
    normalizedName,
    normalizedName.replace('saint', 'st'),
    normalizedName.replace('st', 'saint'),
    normalizedName.replace('st.', 'saint'),
    normalizedName.replace('-', '')
  ];
  
  for (const variant of variations) {
    if (countiesMap.has(variant)) {
      return countiesMap.get(variant);
    }
  }
  
  // Fallback: search through all counties
  return countiesData.find(c => 
    c.name.toLowerCase().includes(name.toLowerCase()) ||
    name.toLowerCase().includes(c.name.toLowerCase())
  ) || null;
}

/**
 * Get all counties
 */
export function getAllCounties() {
  return [...countiesData];
}

/**
 * Get counties sorted by a specific metric
 */
export function getCountiesSortedBy(metricKey, ascending = false) {
  const sorted = countiesData
    .filter(c => c[metricKey] !== null && c[metricKey] !== undefined)
    .sort((a, b) => ascending ? a[metricKey] - b[metricKey] : b[metricKey] - a[metricKey]);
  
  return sorted;
}

/**
 * Get statewide statistics
 */
export function getStatewideStats() {
  return statewideStats;
}

/**
 * Get the metric configuration
 */
export function getMetricsConfig() {
  return METRICS_CONFIG;
}

/**
 * Get metrics by category
 */
export function getMetricsByCategory(category) {
  return Object.entries(METRICS_CONFIG)
    .filter(([key, config]) => config.category === category)
    .map(([key, config]) => ({ key, ...config }));
}

/**
 * Get the min and max values for a metric (for choropleth scale)
 */
export function getMetricRange(metricKey) {
  const stats = statewideStats?.[metricKey];
  if (!stats) {
    return { min: 0, max: 1 };
  }
  return { min: stats.min, max: stats.max };
}

/**
 * Get a county's rank for a specific metric
 */
export function getCountyRank(countyName, metricKey) {
  const county = getCountyByName(countyName);
  if (!county || !county.ranks) return null;
  return county.ranks[metricKey] || null;
}

/**
 * Compare multiple counties on a specific metric
 */
export function compareCounties(countyNames, metricKey) {
  const results = [];
  const stateAvg = statewideStats?.[metricKey]?.average;
  
  countyNames.forEach(name => {
    const county = getCountyByName(name);
    if (county) {
      results.push({
        name: county.name,
        value: county[metricKey],
        rank: county.ranks?.[metricKey],
        vsStatewide: county[metricKey] && stateAvg 
          ? ((county[metricKey] - stateAvg) / stateAvg * 100).toFixed(1)
          : null
      });
    }
  });
  
  return results;
}

/**
 * Get related metrics (same category as given metric)
 */
export function getRelatedMetrics(metricKey, limit = 5) {
  const config = METRICS_CONFIG[metricKey];
  if (!config) return [];
  
  return Object.entries(METRICS_CONFIG)
    .filter(([key, cfg]) => cfg.category === config.category && key !== metricKey && !cfg.hidden)
    .slice(0, limit)
    .map(([key, cfg]) => ({ key, ...cfg }));
}

/**
 * Get a county's percentile for a metric (0-100)
 */
export function getCountyPercentile(countyName, metricKey) {
  const county = getCountyByName(countyName);
  if (!county || !county.ranks?.[metricKey]) return null;
  
  const rank = county.ranks[metricKey];
  // Rank 1 = highest value, Rank 67 = lowest value
  // Percentile: 100 = highest, 0 = lowest
  return Math.round(((67 - rank) / 66) * 100);
}

/**
 * Get full metric stats for display
 */
export function getMetricStats(metricKey) {
  const config = METRICS_CONFIG[metricKey];
  const stats = statewideStats?.[metricKey];
  
  if (!config || !stats) return null;
  
  return {
    key: metricKey,
    name: config.name,
    shortName: config.shortName,
    description: config.description || '',
    category: config.category,
    format: config.format,
    year: config.year,
    source: config.source,
    countyNotes: config.countyNotes,
    higherIsBetter: config.higherIsBetter,
    average: stats.average,
    min: stats.min,
    max: stats.max,
    formattedAverage: formatValue(stats.average, config.format),
    formattedMin: formatValue(stats.min, config.format),
    formattedMax: formatValue(stats.max, config.format)
  };
}

/**
 * Check if a metric is property-tax related (for showing statewide chart)
 */
export function isPropertyTaxMetric(metricKey) {
  const propertyTaxMetrics = [
    'perCapitaTotalPropertyTaxLevies',
    'perCapitaCountyPropertyTaxLevies',
    'perCapitaMunicipalPropertyTaxLevies',
    'perCapitaSchoolPropertyTaxLevies',
    'perCapitaSpecialDistrictPropertyTaxLevies',
    'avgTotalMillageRate',
    'propertyTaxGrowth2014_2024',
    'popInflationGrowth2014_2024',
    'perCapitaExcessTaxGrowth',
    'perCapitaSaveOurHomesImpact',
    'perCapita2008AmendmentImpact',
    'percentTaxableJustValue',
    'perCapitaJustValue',
    'perCapitaTaxableValue',
    'totalPropertyTaxLeviesPer1000Income'
  ];
  return propertyTaxMetrics.includes(metricKey);
}

/**
 * Get summary data for a county (all metrics)
 */
export function getCountySummary(countyName) {
  const county = getCountyByName(countyName);
  if (!county) return null;
  
  const summary = {
    name: county.name,
    fips: county.fips,
    metrics: {}
  };
  
  Object.entries(METRICS_CONFIG).forEach(([key, config]) => {
    if (county[key] !== undefined) {
      summary.metrics[key] = {
        ...config,
        value: county[key],
        rank: county.ranks?.[key],
        formattedValue: formatValue(county[key], config.format),
        stateAverage: statewideStats?.[key]?.average,
        formattedStateAverage: formatValue(statewideStats?.[key]?.average, config.format)
      };
    }
  });
  
  return summary;
}

// Export for use in other modules
export default {
  loadCountyData,
  getCountyByFips,
  getCountyByName,
  getAllCounties,
  getCountiesSortedBy,
  getStatewideStats,
  getMetricsConfig,
  getMetricsByCategory,
  getMetricRange,
  getCountyRank,
  compareCounties,
  getCountySummary,
  formatValue,
  getMunicipalGrowthCitiesInCounty,
  getAllMunicipalGrowthCities,
  isMunicipalExpenditureMetric,
  METRICS_CONFIG,
  MUNICIPAL_EXPENDITURE_GROWTH,
  MUNICIPAL_EXPENDITURE_COUNTIES
};
