/**
 * Map Module - Renders and manages the Florida county map
 * 
 * Features:
 * - Renders SVG map from GeoJSON
 * - Choropleth coloring by selected metric
 * - Hover tooltips
 * - Click selection and multi-county comparison
 * - Keyboard accessibility
 */

import { formatValue, getMetricRange, METRICS_CONFIG } from './data.js';

// Map state
let svg = null;
let projection = null;
let pathGenerator = null;
let geoData = null;
let countyPaths = null;
let colorScale = null;

// Current state
let currentMetric = 'perCapitaTotalPropertyTaxLevies';
let selectedCounty = null;
let comparedCounties = [];

// Callbacks
let onCountyHover = null;
let onCountyClick = null;
let onCountySelect = null;

// DOM elements
let tooltip = null;
let mapContainer = null;
let legend = null;

// Color scheme for choropleth (9-class Reds with grey-to-red gradient)
const COLOR_SCHEME = [
  '#f7f7f7', '#fee5e5', '#fcc8c8', '#f99a9a', 
  '#f56b6b', '#e84545', '#d02030', '#a01825', '#6b1018'
];

// Comparison colors (dark blue, red, grey, black, gold)
const COMPARE_COLORS = ['#1a365d', '#d02030', '#4b5563', '#111827', '#c9a227'];

/**
 * Initialize the map
 */
export async function initMap(container, options = {}) {
  mapContainer = container;
  
  // Get DOM elements
  svg = d3.select('#florida-map');
  tooltip = d3.select('#tooltip');
  legend = d3.select('#map-legend');
  
  // Set up callbacks
  onCountyHover = options.onHover || (() => {});
  onCountyClick = options.onClick || (() => {});
  onCountySelect = options.onSelect || (() => {});
  
  // Load and render the map
  await loadGeoData(options.geoJsonUrl || './data/florida-counties.geojson');
  
  return {
    setMetric,
    selectCounty,
    addToComparison,
    removeFromComparison,
    clearComparison,
    updateColors,
    getSelectedCounty: () => selectedCounty,
    getComparedCounties: () => [...comparedCounties]
  };
}

/**
 * Load GeoJSON data and render the map
 * Loads from CDN and filters for Florida counties (FIPS starting with "12")
 */
async function loadGeoData(url) {
  const loadingIndicator = document.getElementById('map-loading');
  
  // CDN URL for all US counties GeoJSON
  const cdnUrl = 'https://raw.githubusercontent.com/plotly/datasets/master/geojson-counties-fips.json';
  
  try {
    // First try to load from CDN (preferred - has all 67 Florida counties)
    let data;
    
    try {
      const response = await fetch(cdnUrl);
      if (response.ok) {
        data = await response.json();
        // Filter for Florida counties (FIPS codes starting with "12")
        const floridaFeatures = data.features.filter(f => 
          f.id && f.id.startsWith('12')
        );
        geoData = {
          type: 'FeatureCollection',
          features: floridaFeatures
        };
        console.log(`Loaded ${floridaFeatures.length} Florida counties from CDN`);
      }
    } catch (cdnError) {
      console.warn('CDN fetch failed, trying local file:', cdnError);
    }
    
    // Fallback to local file if CDN fails
    if (!geoData) {
      const localResponse = await fetch(url);
      if (!localResponse.ok) {
        throw new Error(`Failed to load GeoJSON: ${localResponse.statusText}`);
      }
      geoData = await localResponse.json();
    }
    
    renderMap();
    
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.classList.add('hidden');
    }
  } catch (error) {
    console.error('Error loading GeoJSON:', error);
    if (loadingIndicator) {
      loadingIndicator.innerHTML = '<span style="color: #e74c3c;">Failed to load map data</span>';
    }
    throw error;
  }
}

/**
 * Render the map SVG
 */
function renderMap() {
  // Clear existing content
  svg.selectAll('*').remove();
  
  // Get container dimensions
  const container = mapContainer || svg.node().parentElement;
  const width = container.clientWidth || 800;
  const height = Math.min(600, width * 0.75);
  
  // Set up SVG with viewBox for responsiveness
  svg
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');
  
  // Create projection centered on Florida
  // Florida roughly spans: Lat 24.5 to 31, Lon -87.6 to -80
  projection = d3.geoAlbers()
    .rotate([84, 0, 0])        // Rotate to center on Florida longitude
    .center([0, 27.8])          // Center on Florida latitude
    .parallels([24, 31.5])      // Standard parallels for Florida
    .translate([width / 2, height / 2])
    .scale(1);  // Will be adjusted after fitting
  
  // Create path generator
  pathGenerator = d3.geoPath().projection(projection);
  
  // Fit the projection to the GeoJSON bounds
  const features = geoData.features || geoData;
  projection.fitSize([width * 0.95, height * 0.95], {
    type: 'FeatureCollection',
    features: features
  });
  
  // Create a group for the counties
  const g = svg.append('g').attr('class', 'counties-group');
  
  // Render county paths
  countyPaths = g.selectAll('path.county')
    .data(features)
    .join('path')
    .attr('class', 'county')
    .attr('d', pathGenerator)
    .attr('data-name', d => getCountyName(d))
    .attr('data-fips', d => getCountyFips(d))
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', d => `${getCountyName(d)} County`)
    .on('mouseenter', handleMouseEnter)
    .on('mousemove', handleMouseMove)
    .on('mouseleave', handleMouseLeave)
    .on('click', handleClick)
    .on('keydown', handleKeyDown);
  
  // Initialize color scale and apply colors
  initColorScale();
  updateColors();
  
  // Render legend
  renderLegend();
}

/**
 * Get county name from GeoJSON feature
 */
function getCountyName(feature) {
  const props = feature.properties || {};
  return props.NAME || props.name || props.NAMELSAD || props.County || 'Unknown';
}

/**
 * Get county FIPS code from GeoJSON feature
 */
function getCountyFips(feature) {
  // CDN data uses 'id' for FIPS, local might use properties
  if (feature.id) return feature.id;
  
  const props = feature.properties || {};
  return props.GEOID || props.fips || props.FIPS || props.COUNTYFP || '';
}

/**
 * Initialize the color scale based on current metric
 */
function initColorScale() {
  colorScale = d3.scaleQuantile()
    .range(COLOR_SCHEME);
}

/**
 * Update the color scale domain based on current metric and county data
 */
export function updateColorScale(countyData) {
  if (!countyData || countyData.length === 0) return;
  
  const values = countyData
    .map(c => c[currentMetric])
    .filter(v => v !== null && v !== undefined);
  
  if (values.length > 0) {
    colorScale.domain(values);
  }
}

/**
 * Update county fill colors based on metric values
 */
export function updateColors(countyData) {
  if (!countyPaths) return;
  
  // Update color scale if data provided
  if (countyData) {
    updateColorScale(countyData);
  }
  
  countyPaths.each(function(d) {
    const path = d3.select(this);
    const countyName = getCountyName(d);
    const countyFips = getCountyFips(d);
    
    // Find matching county data by FIPS first, then by name
    let county = null;
    if (countyData) {
      // Try FIPS match first (more reliable)
      county = countyData.find(c => c.fips === countyFips);
      
      // Fall back to name matching
      if (!county) {
        county = countyData.find(c => 
          c.name.toLowerCase() === countyName.toLowerCase() ||
          c.name.toLowerCase().replace(/\s+/g, '') === countyName.toLowerCase().replace(/\s+/g, '') ||
          c.name.toLowerCase().replace('miami-dade', 'dade') === countyName.toLowerCase() ||
          c.name.toLowerCase() === countyName.toLowerCase().replace('miami-dade', 'dade')
        );
      }
    }
    
    // Determine fill color
    let fillColor = '#ccc'; // Default gray if no data
    if (county && county[currentMetric] !== undefined) {
      fillColor = colorScale(county[currentMetric]);
    }
    
    path.style('fill', fillColor);
  });
  
  // Update legend
  renderLegend();
}

/**
 * Render the color legend
 */
function renderLegend() {
  if (!legend || !colorScale) return;
  
  const metricConfig = METRICS_CONFIG[currentMetric];
  const quantiles = colorScale.quantiles();
  
  // Clear existing legend
  legend.html('');
  
  // Create legend label (low end)
  const domain = colorScale.domain();
  const minVal = domain.length > 0 ? Math.min(...domain) : 0;
  const maxVal = domain.length > 0 ? Math.max(...domain) : 0;
  
  legend.append('span')
    .attr('class', 'legend-label')
    .text(formatValue(minVal, metricConfig?.format || 'currency'));
  
  // Create color bar
  const colorBar = legend.append('div')
    .attr('class', 'legend-bar');
  
  COLOR_SCHEME.forEach(color => {
    colorBar.append('span')
      .style('background-color', color);
  });
  
  // Create legend label (high end)
  legend.append('span')
    .attr('class', 'legend-label')
    .text(formatValue(maxVal, metricConfig?.format || 'currency'));
}

/**
 * Set the current metric for choropleth coloring
 */
export function setMetric(metricKey, countyData) {
  currentMetric = metricKey;
  if (countyData) {
    updateColors(countyData);
  }
}

/**
 * Handle mouse enter on county
 */
function handleMouseEnter(event, d) {
  const countyName = getCountyName(d);
  
  // Highlight the county
  d3.select(event.currentTarget)
    .raise() // Bring to front
    .classed('hovered', true);
  
  // Trigger callback for data lookup
  onCountyHover(countyName, true, event);
}

/**
 * Handle mouse move for tooltip positioning
 */
function handleMouseMove(event, d) {
  if (tooltip.classed('visible')) {
    positionTooltip(event);
  }
}

/**
 * Handle mouse leave on county
 */
function handleMouseLeave(event, d) {
  const countyName = getCountyName(d);
  
  d3.select(event.currentTarget)
    .classed('hovered', false);
  
  onCountyHover(countyName, false, event);
  hideTooltip();
}

/**
 * Handle click on county
 */
function handleClick(event, d) {
  const countyName = getCountyName(d);
  const fips = getCountyFips(d);
  
  // Check if shift/ctrl held for multi-select
  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    toggleComparison(countyName);
  } else {
    selectCounty(countyName);
  }
  
  onCountyClick(countyName, fips, event);
}

/**
 * Handle keyboard navigation
 */
function handleKeyDown(event, d) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick(event, d);
  }
}

/**
 * Select a county (single selection)
 */
export function selectCounty(countyName) {
  // Clear previous selection
  countyPaths.classed('selected', false);
  
  // Find and select the new county
  countyPaths.each(function(d) {
    const name = getCountyName(d);
    if (name.toLowerCase() === countyName.toLowerCase()) {
      d3.select(this).classed('selected', true).raise();
      selectedCounty = countyName;
    }
  });
  
  // Notify
  onCountySelect(selectedCounty);
}

/**
 * Toggle a county in comparison list
 */
function toggleComparison(countyName) {
  const index = comparedCounties.findIndex(
    c => c.toLowerCase() === countyName.toLowerCase()
  );
  
  if (index >= 0) {
    removeFromComparison(countyName);
  } else if (comparedCounties.length < 5) {
    addToComparison(countyName);
  }
}

/**
 * Add a county to comparison
 */
export function addToComparison(countyName) {
  if (comparedCounties.length >= 5) return false;
  if (comparedCounties.find(c => c.toLowerCase() === countyName.toLowerCase())) {
    return false;
  }
  
  comparedCounties.push(countyName);
  updateComparisonStyles();
  return true;
}

/**
 * Remove a county from comparison
 */
export function removeFromComparison(countyName) {
  const index = comparedCounties.findIndex(
    c => c.toLowerCase() === countyName.toLowerCase()
  );
  
  if (index >= 0) {
    comparedCounties.splice(index, 1);
    updateComparisonStyles();
    return true;
  }
  return false;
}

/**
 * Clear all counties from comparison
 */
export function clearComparison() {
  comparedCounties = [];
  updateComparisonStyles();
}

/**
 * Update visual styles for compared counties
 */
function updateComparisonStyles() {
  countyPaths.each(function(d) {
    const path = d3.select(this);
    const name = getCountyName(d);
    const compIndex = comparedCounties.findIndex(
      c => c.toLowerCase() === name.toLowerCase()
    );
    
    path.classed('compared', compIndex >= 0);
    
    if (compIndex >= 0) {
      path.style('stroke', COMPARE_COLORS[compIndex]);
    } else if (!path.classed('selected')) {
      path.style('stroke', null); // Reset to CSS default
    }
  });
}

/**
 * Show tooltip with county data
 */
export function showTooltip(countyData, event) {
  if (!tooltip || !countyData) return;
  
  const metricConfig = METRICS_CONFIG[currentMetric];
  
  let html = `
    <div class="tooltip-title">${countyData.name} County</div>
  `;
  
  // Show current metric
  if (countyData[currentMetric] !== undefined) {
    html += `
      <div class="tooltip-row">
        <span class="tooltip-label">${metricConfig?.shortName || 'Value'}:</span>
        <span class="tooltip-value">${formatValue(countyData[currentMetric], metricConfig?.format)}</span>
      </div>
    `;
    
    if (countyData.ranks && countyData.ranks[currentMetric]) {
      html += `
        <div class="tooltip-rank">Rank: #${countyData.ranks[currentMetric]} of 67</div>
      `;
    }
  }
  
  // Show a couple other key metrics
  if (currentMetric !== 'avgTotalMillageRate' && countyData.avgTotalMillageRate !== undefined) {
    html += `
      <div class="tooltip-row">
        <span class="tooltip-label">Avg Millage:</span>
        <span class="tooltip-value">${formatValue(countyData.avgTotalMillageRate, 'millage')}</span>
      </div>
    `;
  }
  
  tooltip.html(html);
  tooltip.classed('visible', true);
  
  positionTooltip(event);
}

/**
 * Position tooltip near cursor
 */
function positionTooltip(event) {
  const tooltipNode = tooltip.node();
  const tooltipRect = tooltipNode.getBoundingClientRect();
  const padding = 15;
  
  let left = event.clientX + padding;
  let top = event.clientY + padding;
  
  // Keep tooltip on screen
  if (left + tooltipRect.width > window.innerWidth) {
    left = event.clientX - tooltipRect.width - padding;
  }
  
  if (top + tooltipRect.height > window.innerHeight) {
    top = event.clientY - tooltipRect.height - padding;
  }
  
  tooltip
    .style('left', left + 'px')
    .style('top', top + 'px');
}

/**
 * Hide tooltip
 */
export function hideTooltip() {
  if (tooltip) {
    tooltip.classed('visible', false);
  }
}

/**
 * Resize handler - call when container size changes
 */
export function resize() {
  if (geoData) {
    renderMap();
  }
}

// Export default object with all functions
export default {
  initMap,
  setMetric,
  selectCounty,
  addToComparison,
  removeFromComparison,
  clearComparison,
  updateColors,
  showTooltip,
  hideTooltip,
  resize
};


