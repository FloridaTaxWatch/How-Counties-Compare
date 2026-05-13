/**
 * Main Application Entry Point
 * 
 * Metric-focused Florida Counties Tax Comparison app:
 * - Sidebar shows details for the SELECTED METRIC
 * - Click county = show that county's value for current metric
 * - CTRL+click = add counties to compare for current metric
 */

import { 
  loadCountyData, 
  getAllCounties, 
  getCountyByName, 
  getStatewideStats,
  getMetricStats,
  getRelatedMetrics,
  getCountyPercentile,
  isPropertyTaxMetric,
  getPairedMetricsInfo,
  formatValue,
  getCountySummary,
  getCitiesInCounty,
  CITY_STATEWIDE_GROWTH,
  METRICS_CONFIG 
} from './data.js';

import { 
  initMap, 
  setMetric, 
  selectCounty, 
  updateColors,
  showTooltip,
  hideTooltip,
  addToComparison,
  removeFromComparison,
  clearComparison
} from './map.js';

import { 
  initCharts, 
  updateComparisonBarChart,
  clearCharts,
  initStatewideChart
} from './charts.js';

// Application state
let appState = {
  currentMetric: 'population',
  selectedCounty: null,
  comparedCounties: [],  // Array of county objects for CTRL+click comparison
  counties: [],
  statewideStats: null,
  mapController: null
};

/**
 * Initialize the application
 */
async function init() {
  console.log('Initializing Florida Counties Tax Map...');
  
  try {
    // Load county data
    await loadData();
    
    // Initialize UI components
    initCharts();
    await initializeMap();
    populateCountyDropdown();
    setupEventListeners();
    initRecapDownload();
    setupStatewideChartDropdown();
    
    // Set initial metric display
    updateMetricDisplay();
    
    // Show statewide view by default
    showStatewideView();
    updateRecapSection(false);
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showErrorState(error.message);
  }
}

/**
 * Load all data files
 */
async function loadData() {
  appState.counties = await loadCountyData('./data/counties.json');
  appState.statewideStats = getStatewideStats();
  console.log(`Loaded ${appState.counties.length} counties`);
}

/**
 * Initialize the map component
 */
async function initializeMap() {
  appState.mapController = await initMap(
    document.querySelector('.map-container'),
    {
      geoJsonUrl: './data/florida-counties.geojson',
      onHover: handleCountyHover,
      onClick: handleCountyClick,
      onSelect: handleCountySelect
    }
  );
  
  // Apply initial colors based on default metric
  setMetric(appState.currentMetric, appState.counties);
}

/**
 * Populate the county dropdown
 */
function populateCountyDropdown() {
  const select = document.getElementById('county-select');
  if (!select) return;
  
  // Sort counties alphabetically
  const sortedCounties = [...appState.counties].sort((a, b) => 
    a.name.localeCompare(b.name)
  );
  
  // Clear existing options except first (Statewide)
  select.innerHTML = '<option value="">Statewide (All Counties)</option>';
  
  // Add county options
  sortedCounties.forEach(county => {
    const option = document.createElement('option');
    option.value = county.name;
    option.textContent = county.name;
    select.appendChild(option);
  });
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
  // County dropdown
  const countySelect = document.getElementById('county-select');
  if (countySelect) {
    countySelect.addEventListener('change', (e) => {
      if (e.target.value) {
        selectCountyByName(e.target.value);
      } else {
        clearSelection();
      }
    });
  }
  
  // Metric dropdown - THIS DRIVES EVERYTHING
  const metricSelect = document.getElementById('metric-select');
  if (metricSelect) {
    metricSelect.addEventListener('change', (e) => {
      appState.currentMetric = e.target.value;
      setMetric(e.target.value, appState.counties);
      updateMetricDisplay();
      
      // Refresh county/statewide display with new metric
      if (appState.selectedCounty) {
        updateCountyDisplay(appState.selectedCounty);
      } else {
        showStatewideView();
      }
      if (appState.comparedCounties.length > 0) {
        updateComparisonDisplay();
      }
    });
  }
  
  // Clear selection button
  const clearSelectionBtn = document.getElementById('clear-selection');
  if (clearSelectionBtn) {
    clearSelectionBtn.addEventListener('click', clearSelection);
  }
  
  // Clear comparison button
  const clearComparisonBtn = document.getElementById('clear-comparison');
  if (clearComparisonBtn) {
    clearComparisonBtn.addEventListener('click', clearAllComparisons);
  }
  
  // About section toggle
  const aboutToggle = document.getElementById('about-toggle');
  const aboutContent = document.getElementById('about-content');
  if (aboutToggle && aboutContent) {
    aboutToggle.addEventListener('click', () => {
      const isExpanded = aboutToggle.getAttribute('aria-expanded') === 'true';
      aboutToggle.setAttribute('aria-expanded', !isExpanded);
      aboutContent.hidden = isExpanded;
    });
  }
  
  // Window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initCharts();
      if (appState.comparedCounties.length > 0) {
        updateComparisonChart();
      }
    }, 250);
  });
}

/**
 * Handle county hover event from map
 */
function handleCountyHover(countyName, isEntering, event) {
  if (isEntering) {
    const county = getCountyByName(countyName);
    if (county) {
      showTooltip(county, event);
    }
  } else {
    hideTooltip();
  }
}

/**
 * Handle county click event from map
 */
function handleCountyClick(countyName, fips, event) {
  // CTRL/CMD+click = add to comparison
  if (event.ctrlKey || event.metaKey) {
    toggleCountyComparison(countyName);
  } else {
    // Regular click = select county
    selectCountyByName(countyName);
  }
}

/**
 * Handle county selection change
 */
function handleCountySelect(countyName) {
  // Update dropdown to match
  const select = document.getElementById('county-select');
  if (select) {
    select.value = countyName || '';
  }
}

/**
 * Update the metric display in sidebar header
 */
function updateMetricDisplay() {
  const metricStats = getMetricStats(appState.currentMetric);
  if (!metricStats) return;
  
  // Update metric header
  const nameEl = document.getElementById('current-metric-name');
  const descEl = document.getElementById('current-metric-description');
  const yearEl = document.getElementById('metric-year');
  const indicatorEl = document.getElementById('metric-indicator');
  
  if (nameEl) nameEl.textContent = metricStats.shortName || metricStats.name;
  
  // For statewide view, adjust description to remove "county" references
  if (descEl) {
    let description = metricStats.description || '';
    if (!appState.selectedCounty) {
      // Remove "county" from descriptions for statewide view
      description = description.replace(/county /gi, '').replace(/ county/gi, '');
    }
    descEl.textContent = description;
  }
  
  if (yearEl) yearEl.textContent = metricStats.year || '';

  // Display county-specific notes if available
  const countyNoteEl = document.getElementById('county-note');
  if (countyNoteEl) {
    const countyName = appState.selectedCounty?.name;
    const countyNote = countyName && metricStats.countyNotes?.[countyName];
    if (countyNote) {
      countyNoteEl.textContent = countyNote;
      countyNoteEl.style.display = '';
    } else {
      countyNoteEl.textContent = '';
      countyNoteEl.style.display = 'none';
    }
  }

  // Only show indicator badge if there's a source
  if (indicatorEl) {
    if (metricStats.source) {
      indicatorEl.textContent = `Source: ${metricStats.source}`;
      indicatorEl.className = 'metric-badge indicator-source';
      indicatorEl.style.display = '';
    } else {
      indicatorEl.textContent = '';
      indicatorEl.style.display = 'none';
    }
  }
  
  // Update statewide stats
  document.getElementById('statewide-avg').textContent = metricStats.formattedAverage || '—';
  document.getElementById('statewide-min').textContent = metricStats.formattedMin || '—';
  document.getElementById('statewide-max').textContent = metricStats.formattedMax || '—';
  
  // Update related metrics
  updateRelatedMetrics();
}

/**
 * Update related metrics section
 */
function updateRelatedMetrics() {
  const container = document.getElementById('related-metrics-list');
  if (!container) return;
  
  const related = getRelatedMetrics(appState.currentMetric, 4);
  
  if (related.length === 0) {
    container.innerHTML = '<p class="no-related">No related metrics</p>';
    return;
  }
  
  container.innerHTML = related.map(metric => {
    const county = appState.selectedCounty;
    const value = county ? formatValue(county[metric.key], metric.format) : '—';
    const rank = county?.ranks?.[metric.key] ? `#${county.ranks[metric.key]}` : '';
    
    return `
      <button class="related-metric-btn" data-metric="${metric.key}">
        <span class="related-name">${metric.shortName}</span>
        <span class="related-value">${value} ${rank}</span>
      </button>
    `;
  }).join('');
  
  // Add click handlers to switch metrics
  container.querySelectorAll('.related-metric-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const metricKey = btn.dataset.metric;
      const metricSelect = document.getElementById('metric-select');
      if (metricSelect) {
        metricSelect.value = metricKey;
        metricSelect.dispatchEvent(new Event('change'));
      }
    });
  });
  
  // Update city tax growth section (only shows for property tax metrics with top 50 cities)
  updateCityTaxGrowthSection();
}

/**
 * Update city property tax growth section
 * Only shows when a county is selected, the metric is property tax related,
 * and the county has cities in the top 50 largest Florida cities
 */
function updateCityTaxGrowthSection() {
  const section = document.getElementById('city-tax-growth-section');
  const tbody = document.getElementById('city-growth-tbody');
  const countyNameSpan = document.getElementById('city-county-name');
  
  if (!section || !tbody) return;
  
  // Hide if no county selected or not a property tax metric
  if (!appState.selectedCounty || !isPropertyTaxMetric(appState.currentMetric)) {
    section.style.display = 'none';
    return;
  }
  
  // Get cities in this county
  const cities = getCitiesInCounty(appState.selectedCounty.name);
  
  // Hide if no cities in top 50
  if (cities.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  // Show section and populate
  section.style.display = 'block';
  
  if (countyNameSpan) {
    countyNameSpan.textContent = appState.selectedCounty.name + ' County';
  }
  
  // Build table rows
  tbody.innerHTML = cities.map(city => {
    const aboveAvg = city.growth > CITY_STATEWIDE_GROWTH;
    return `
      <tr>
        <td>#${city.rank}</td>
        <td>${city.city}</td>
        <td class="${aboveAvg ? 'above-average' : 'below-average'}">${city.growth.toFixed(1)}%</td>
      </tr>
    `;
  }).join('');
}

/**
 * Initialize statewide property tax chart when dropdown is opened
 */
function setupStatewideChartDropdown() {
  const dropdown = document.getElementById('statewide-chart-dropdown');
  if (!dropdown) return;
  
  // Initialize chart when dropdown is first opened
  dropdown.addEventListener('toggle', (e) => {
    if (dropdown.open) {
      // Small delay to ensure container has dimensions
      setTimeout(() => {
        initStatewideChart();
      }, 50);
    }
  });
}

/**
 * Select a county and show its data for current metric
 */
function selectCountyByName(name) {
  const county = getCountyByName(name);
  if (!county) {
    console.warn(`County not found: ${name}`);
    return;
  }
  
  appState.selectedCounty = county;
  
  // Update map selection
  selectCounty(name);
  
  // Update UI
  updateCountyDisplay(county);
  updateRelatedMetrics();
  updateAdditionalInfo(county);
  updateRecapSection(true);
  
  // Show county display, hide prompt
  document.getElementById('county-display').style.display = 'block';
  document.getElementById('select-county-prompt').style.display = 'none';
  document.getElementById('clear-selection').style.display = 'inline-block';
}

/**
 * Clear county selection - return to statewide view
 */
function clearSelection() {
  appState.selectedCounty = null;
  selectCounty(null);
  
  // Show statewide view
  showStatewideView();
  updateRecapSection(false);
  
  // Update dropdown
  const select = document.getElementById('county-select');
  if (select) select.value = '';
  
  // Update related metrics to remove county values
  updateRelatedMetrics();
}

/**
 * Show the statewide view (no specific county selected)
 */
function showStatewideView() {
  const metric = appState.currentMetric;
  const config = METRICS_CONFIG[metric];
  const stats = appState.statewideStats?.[metric];
  
  // Update header to show "Statewide"
  document.getElementById('selected-county-name').textContent = 'Statewide';
  
  // Show statewide average as the main value
  document.getElementById('county-value').textContent = 
    stats?.average !== undefined ? formatValue(stats.average, config?.format) : '—';
  document.getElementById('county-metric-label').textContent = 'Average';
  
  // Update context items for statewide view
  document.getElementById('county-rank').textContent = '67 counties';
  
  const vsAvgEl = document.getElementById('county-vs-avg');
  vsAvgEl.textContent = '—';
  vsAvgEl.className = 'context-value vs-neutral';
  
  // Hide percentile bar for statewide
  const markerEl = document.getElementById('percentile-marker');
  const percentileLabel = document.getElementById('percentile-value');
  markerEl.style.left = '50%';
  percentileLabel.textContent = 'Select a county';
  
  // Hide paired metrics for statewide
  const pairedDisplay = document.getElementById('paired-metrics-display');
  if (pairedDisplay) pairedDisplay.style.display = 'none';
  
  // Hide city tax growth section for statewide
  const citySection = document.getElementById('city-tax-growth-section');
  if (citySection) citySection.style.display = 'none';
  
  // Keep county display visible but show prompt
  document.getElementById('county-display').style.display = 'block';
  document.getElementById('select-county-prompt').style.display = 'block';
  document.getElementById('clear-selection').style.display = 'none';
}

/**
 * Update the county display for current metric
 */
function updateCountyDisplay(county) {
  const metric = appState.currentMetric;
  const config = METRICS_CONFIG[metric];
  const stats = appState.statewideStats?.[metric];
  
  // County name
  document.getElementById('selected-county-name').textContent = `${county.name} County`;
  
  // Value
  const value = county[metric];
  document.getElementById('county-value').textContent = 
    value !== undefined ? formatValue(value, config?.format) : 'N/A';
  document.getElementById('county-metric-label').textContent = config?.shortName || '';
  
  // Rank
  const rank = county.ranks?.[metric];
  document.getElementById('county-rank').textContent = 
    rank ? `#${rank} of 67` : 'N/A';
  
  // vs Average
  const vsAvgEl = document.getElementById('county-vs-avg');
  if (value !== undefined && stats?.average) {
    const diff = ((value - stats.average) / stats.average * 100);
    const sign = diff > 0 ? '+' : '';
    vsAvgEl.textContent = `${sign}${diff.toFixed(1)}%`;
    vsAvgEl.className = 'context-value ' + (diff > 0 ? 'vs-above' : diff < 0 ? 'vs-below' : 'vs-neutral');
  } else {
    vsAvgEl.textContent = '—';
    vsAvgEl.className = 'context-value vs-neutral';
  }
  
  // Percentile bar
  const percentile = getCountyPercentile(county.name, metric);
  const markerEl = document.getElementById('percentile-marker');
  const percentileLabel = document.getElementById('percentile-value');
  
  if (percentile !== null) {
    markerEl.style.left = `${percentile}%`;
    percentileLabel.textContent = `${percentile}th percentile`;
  } else {
    markerEl.style.left = '50%';
    percentileLabel.textContent = 'N/A';
  }
  
  // Handle paired metrics (growth vs benchmark)
  updatePairedMetricsDisplay(county, metric);
}

/**
 * Update the paired metrics display (for growth comparisons)
 */
function updatePairedMetricsDisplay(county, metric) {
  const pairedInfo = getPairedMetricsInfo(metric);
  const pairedContainer = document.getElementById('paired-metrics-display');

  if (!pairedInfo || !pairedContainer) {
    if (pairedContainer) {
      pairedContainer.style.display = 'none';
    }
    return;
  }

  // Show the paired metrics section
  pairedContainer.style.display = 'block';

  // Set the group title
  document.getElementById('paired-metrics-title').textContent = pairedInfo.groupName;

  const primaryKey = pairedInfo.primary;
  const benchmarkKey = pairedInfo.benchmark;

  const primaryValue = county[primaryKey];
  const benchmarkValue = county[benchmarkKey];

  const primaryConfig = METRICS_CONFIG[primaryKey];
  const benchmarkConfig = METRICS_CONFIG[benchmarkKey];

  // Update primary metric
  document.getElementById('paired-primary-label').textContent = pairedInfo.labels[primaryKey];
  document.getElementById('paired-primary-value').textContent =
    primaryValue !== undefined ? formatValue(primaryValue, primaryConfig?.format) : 'N/A';

  // Update benchmark metric
  document.getElementById('paired-benchmark-label').textContent = pairedInfo.labels[benchmarkKey];
  document.getElementById('paired-benchmark-value').textContent =
    benchmarkValue !== undefined ? formatValue(benchmarkValue, benchmarkConfig?.format) : 'N/A';
}

/**
 * Toggle a county in the comparison list
 */
function toggleCountyComparison(countyName) {
  const county = getCountyByName(countyName);
  if (!county) return;
  
  const index = appState.comparedCounties.findIndex(
    c => c.name.toLowerCase() === countyName.toLowerCase()
  );
  
  if (index >= 0) {
    // Remove from comparison
    appState.comparedCounties.splice(index, 1);
    removeFromComparison(countyName);
  } else if (appState.comparedCounties.length < 5) {
    // Add to comparison
    appState.comparedCounties.push(county);
    addToComparison(countyName);
  }
  
  updateComparisonDisplay();
}

/**
 * Clear all county comparisons
 */
function clearAllComparisons() {
  appState.comparedCounties = [];
  clearComparison();
  updateComparisonDisplay();
}

/**
 * Update the comparison section display
 */
function updateComparisonDisplay() {
  const section = document.getElementById('comparison-section');
  const thead = document.getElementById('comparison-thead');
  const tbody = document.getElementById('comparison-tbody');
  
  if (!section || !tbody) return;
  
  if (appState.comparedCounties.length === 0) {
    section.style.display = 'none';
    return;
  }
  
  section.style.display = 'block';
  
  const metric = appState.currentMetric;
  const config = METRICS_CONFIG[metric];
  const stats = appState.statewideStats?.[metric];
  const pairedInfo = getPairedMetricsInfo(metric);
  
  // Build table headers
  if (thead) {
    if (pairedInfo) {
      thead.innerHTML = `
        <tr>
          <th>County</th>
          <th>${pairedInfo.labels[pairedInfo.primary]}</th>
          <th>${pairedInfo.labels[pairedInfo.benchmark]}</th>
        </tr>
      `;
    } else {
      // Standard single metric
      thead.innerHTML = `
        <tr>
          <th>County</th>
          <th>Value</th>
          <th>Rank</th>
          <th>vs Avg</th>
        </tr>
      `;
    }
  }

  // Build comparison table rows
  if (pairedInfo) {
    // Paired metrics comparison
    const primaryKey = pairedInfo.primary;
    const benchmarkKey = pairedInfo.benchmark;
    const primaryConfig = METRICS_CONFIG[primaryKey];
    const benchmarkConfig = METRICS_CONFIG[benchmarkKey];

    tbody.innerHTML = appState.comparedCounties.map(county => {
      const primaryVal = county[primaryKey];
      const benchmarkVal = county[benchmarkKey];

      return `
        <tr>
          <td>
            <span class="county-name">${county.name}</span>
            <button class="remove-county-btn" data-county="${county.name}" title="Remove">✕</button>
          </td>
          <td>${primaryVal !== undefined ? formatValue(primaryVal, primaryConfig?.format) : 'N/A'}</td>
          <td>${benchmarkVal !== undefined ? formatValue(benchmarkVal, benchmarkConfig?.format) : 'N/A'}</td>
        </tr>
      `;
    }).join('');

    // Add statewide average row
    const primaryStats = appState.statewideStats?.[primaryKey];
    const benchmarkStats = appState.statewideStats?.[benchmarkKey];

    tbody.innerHTML += `
      <tr class="statewide-row">
        <td><em>Statewide Avg</em></td>
        <td>${primaryStats?.average ? formatValue(primaryStats.average, primaryConfig?.format) : '—'}</td>
        <td>${benchmarkStats?.average ? formatValue(benchmarkStats.average, benchmarkConfig?.format) : '—'}</td>
      </tr>
    `;
  } else {
    // Standard single metric comparison
    tbody.innerHTML = appState.comparedCounties.map(county => {
      const value = county[metric];
      const rank = county.ranks?.[metric];
      let vsAvg = '—';
      let vsClass = 'vs-neutral';
      
      if (value !== undefined && stats?.average) {
        const diff = ((value - stats.average) / stats.average * 100);
        const sign = diff > 0 ? '+' : '';
        vsAvg = `${sign}${diff.toFixed(1)}%`;
        vsClass = diff > 0 ? 'vs-above' : diff < 0 ? 'vs-below' : 'vs-neutral';
      }
      
      return `
        <tr>
          <td>
            <span class="county-name">${county.name}</span>
            <button class="remove-county-btn" data-county="${county.name}" title="Remove">✕</button>
          </td>
          <td>${value !== undefined ? formatValue(value, config?.format) : 'N/A'}</td>
          <td>${rank ? `#${rank}` : '—'}</td>
          <td class="${vsClass}">${vsAvg}</td>
        </tr>
      `;
    }).join('');
    
    // Add statewide average row
    tbody.innerHTML += `
      <tr class="statewide-row">
        <td><em>Statewide Avg</em></td>
        <td>${stats?.average ? formatValue(stats.average, config?.format) : '—'}</td>
        <td>—</td>
        <td>—</td>
      </tr>
    `;
  }
  
  // Add remove handlers
  tbody.querySelectorAll('.remove-county-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      toggleCountyComparison(btn.dataset.county);
    });
  });
  
  // Update comparison chart
  updateComparisonChart();
}

/**
 * Update the comparison bar chart
 */
function updateComparisonChart() {
  if (appState.comparedCounties.length === 0) return;
  
  updateComparisonBarChart(
    appState.comparedCounties,
    appState.currentMetric,
    appState.statewideStats
  );
}

/**
 * Update additional county info (largest cities, municipal growth)
 */
function updateAdditionalInfo(county) {
  // Largest cities
  const citiesTbody = document.getElementById('largest-cities-tbody');
  if (citiesTbody) {
    if (county.largestCities && county.largestCities.length > 0) {
      citiesTbody.innerHTML = county.largestCities.map(city => `
        <tr>
          <td>${city.rank}</td>
          <td>${city.city}</td>
          <td>${formatValue(city.population, 'number')}</td>
        </tr>
      `).join('');
    } else {
      citiesTbody.innerHTML = `
        <tr><td colspan="3" class="no-data">No cities in Florida's top 70</td></tr>
      `;
    }
  }
  
  // Municipal growth
  const municipalTbody = document.getElementById('municipal-tbody');
  if (municipalTbody) {
    if (county.municipalGrowth && county.municipalGrowth.length > 0) {
      municipalTbody.innerHTML = county.municipalGrowth.map(city => {
        const excess = parseFloat(city.excessGrowth);
        const excessClass = excess > 0 ? 'excess-positive' : 'excess-negative';
        return `
          <tr>
            <td>${city.city}</td>
            <td>${city.expenditureGrowth}%</td>
            <td class="${excessClass}">${excess > 0 ? '+' : ''}${city.excessGrowth}%</td>
          </tr>
        `;
      }).join('');
    } else {
      municipalTbody.innerHTML = `
        <tr><td colspan="3" class="no-data">No municipal data available</td></tr>
      `;
    }
  }
}

// ==========================================
// COUNTY RECAP DOWNLOAD FEATURE
// ==========================================

/**
 * Category display names for the recap
 */
const CATEGORY_NAMES = {
  populationMisc: 'Population & Miscellaneous',
  demographics: 'Demographics',
  propertyTax: 'Property Taxes',
  salesTax: 'Sales Tax',
  fuelTax: 'Fuel Tax',
  touristTax: 'Tourist Development Tax',
  communicationsTax: 'Communications Services Tax',
  publicServicesTax: 'Public Services Tax',
  regulatoryFees: 'Regulatory Fees',
  revenue: 'Revenue',
  expenditure: 'Expenditures',
  countyMunicipalExpenditure: 'County & Municipal Expenditure',
  growth: 'Growth'
};

/**
 * Map categories to HTML table IDs  
 * Some categories combine into single tables
 */
const CATEGORY_TABLE_MAP = {
  populationMisc: 'recap-populationMisc-table',
  demographics: 'recap-demographics-table',
  propertyTax: 'recap-propertyTax-table',
  // These all go into "Other Taxes" table
  salesTax: 'recap-otherTaxes-table',
  fuelTax: 'recap-otherTaxes-table',
  touristTax: 'recap-otherTaxes-table',
  communicationsTax: 'recap-otherTaxes-table',
  publicServicesTax: 'recap-otherTaxes-table',
  regulatoryFees: 'recap-otherTaxes-table',
  // These have their own tables
  revenue: 'recap-revenue-table',
  expenditure: 'recap-expenditure-table',
  countyMunicipalExpenditure: 'recap-countyMunicipalExpenditure-table',
  growth: 'recap-growth-table'
};

/**
 * Group metrics by their category
 */
function groupMetricsByCategory(metrics) {
  const grouped = {};
  
  Object.entries(metrics).forEach(([key, data]) => {
    const category = data.category || 'other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push({ key, ...data });
  });
  
  return grouped;
}

/**
 * Populate the recap template with county data
 */
function populateRecapTemplate(countyName) {
  const summary = getCountySummary(countyName);
  if (!summary) return false;
  
  // Update header
  const titleEl = document.querySelector('.recap-title-block h1');
  if (titleEl) {
    titleEl.textContent = `${summary.name} County Recap`;
  }
  
  const dateEl = document.querySelector('.recap-date');
  if (dateEl) {
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    dateEl.textContent = `Generated: ${today}`;
  }
  
  // Group metrics by category
  const grouped = groupMetricsByCategory(summary.metrics);
  
  // Clear all table bodies first
  const tableIds = new Set(Object.values(CATEGORY_TABLE_MAP));
  tableIds.forEach(tableId => {
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (tbody) tbody.innerHTML = '';
  });
  
  // Track which tables we've added content to
  const tablesWithContent = new Set();
  
  // Populate each category
  Object.entries(CATEGORY_NAMES).forEach(([catKey, catName]) => {
    const tableId = CATEGORY_TABLE_MAP[catKey];
    if (!tableId) return;
    
    const tbody = document.querySelector(`#${tableId} tbody`);
    if (!tbody) return;
    
    const metrics = grouped[catKey] || [];
    if (metrics.length === 0) return;
    
    tablesWithContent.add(tableId);
    
    const rows = metrics.map(metric => {
      const rank = metric.rank || 'N/A';
      const rankClass = getRankClass(rank, metric.higherIsBetter);
      const formattedRank = typeof rank === 'number' ? `${rank} of 67` : rank;
      
      return `
        <tr>
          <td>${metric.label}</td>
          <td>${metric.formattedValue || 'N/A'}</td>
          <td>${metric.formattedStateAverage || 'N/A'}</td>
          <td class="${rankClass}">${formattedRank}</td>
        </tr>
      `;
    }).join('');
    
    tbody.innerHTML += rows;
  });
  
  // Add "no data" message to empty tables
  tableIds.forEach(tableId => {
    if (!tablesWithContent.has(tableId)) {
      const tbody = document.querySelector(`#${tableId} tbody`);
      if (tbody && tbody.innerHTML === '') {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#999;">No data available</td></tr>`;
      }
    }
  });
  
  return true;
}

/**
 * Determine CSS class for rank display
 */
function getRankClass(rank, higherIsBetter) {
  if (typeof rank !== 'number') return '';
  
  // Top 15 = good, Bottom 15 = bad (considering higherIsBetter)
  if (higherIsBetter === true) {
    // Higher is better: low rank number = good
    if (rank <= 15) return 'rank-good';
    if (rank >= 53) return 'rank-bad';
  } else if (higherIsBetter === false) {
    // Lower is better: high rank number = good (since rank 67 = lowest value)
    if (rank >= 53) return 'rank-good';
    if (rank <= 15) return 'rank-bad';
  }
  return '';
}

/**
 * Download county recap as PDF
 */
async function downloadCountyRecap() {
  const county = appState.selectedCounty;
  if (!county) {
    alert('Please select a county first.');
    return;
  }
  
  // Show a generating message
  const btn = document.getElementById('download-recap-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Generating...';
  btn.disabled = true;
  
  try {
    // Build the HTML content directly
    const htmlContent = buildRecapHTML(county.name);
    if (!htmlContent) {
      alert('Error generating recap data.');
      btn.innerHTML = originalText;
      btn.disabled = false;
      return;
    }
    
    // Create full HTML document
    const fullHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${county.name} County Recap - Florida TaxWatch</title>
        <style>
          @media print {
            body { margin: 0; }
            @page { margin: 0.5in; }
          }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    
    // Open in new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(fullHTML);
    printWindow.document.close();
    
  } catch (error) {
    console.error('Error generating recap:', error);
    alert('Error generating recap. Please try again.');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

/**
 * Build the recap HTML content as a string
 */
function buildRecapHTML(countyName) {
  const summary = getCountySummary(countyName);
  if (!summary) return null;
  
  const today = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Group metrics by category
  const grouped = groupMetricsByCategory(summary.metrics);
  
  // Build category sections
  const categoryHTML = buildCategorySections(grouped);
  
  return `
    <div style="font-family: 'Segoe UI', system-ui, sans-serif; color: #333; padding: 0.4in; background: white;">
      <div style="display: flex; align-items: center; gap: 20px; padding-bottom: 15px; border-bottom: 3px solid #b40000; margin-bottom: 15px;">
        <img src="./assets/ftw-logo-black.png" alt="Florida TaxWatch" style="height: 60px; width: auto;">
        <div>
          <h1 style="margin: 0; font-size: 28px; color: #b40000; font-weight: 700;">${summary.name} County Recap</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #666; font-weight: 500;">Florida County Tax &amp; Finance Profile</p>
          <p style="margin: 2px 0 0 0; font-size: 11px; color: #999;">Generated: ${today}</p>
        </div>
      </div>
      ${categoryHTML}
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #888; text-align: center;">
        <p style="margin: 2px 0;">Source: Florida Department of Revenue and Florida TaxWatch, November 2025</p>
        <p style="margin: 2px 0;">www.floridataxwatch.org</p>
      </div>
    </div>
  `;
}

/**
 * Build HTML for all category sections
 */
function buildCategorySections(grouped) {
  const sections = [
    { key: 'populationMisc', title: '👥 Population & Miscellaneous' },
    { key: 'demographics', title: '📍 Demographics' },
    { key: 'propertyTax', title: '🏠 Property Taxes' },
    { keys: ['salesTax', 'fuelTax', 'touristTax', 'communicationsTax', 'publicServicesTax', 'regulatoryFees'], title: '💰 Other Local Taxes' },
    { key: 'revenue', title: '📈 Revenue' },
    { key: 'countyMunicipalExpenditure', title: '💸 County & Municipal Expenditure' },
    { key: 'expenditure', title: '💸 Expenditures' },
    { key: 'growth', title: '📊 Growth & Trends' }
  ];
  
  return sections.map(section => {
    let metrics = [];
    if (section.keys) {
      // Combine multiple categories
      section.keys.forEach(k => {
        if (grouped[k]) metrics = metrics.concat(grouped[k]);
      });
    } else if (grouped[section.key]) {
      metrics = grouped[section.key];
    }
    
    if (metrics.length === 0) return '';
    
    const rows = metrics.map(metric => {
      const rank = metric.rank || 'N/A';
      const rankStyle = getRankStyle(rank, metric.higherIsBetter);
      const formattedRank = typeof rank === 'number' ? `${rank} of 67` : rank;
      const metricName = metric.shortName || metric.name || metric.key;
      
      return `
        <tr>
          <td style="padding: 3px 6px; border-bottom: 1px solid #eee;">${metricName}</td>
          <td style="padding: 3px 6px; border-bottom: 1px solid #eee; text-align: right; font-family: Consolas, monospace; font-size: 9px;">${metric.formattedValue || 'N/A'}</td>
          <td style="padding: 3px 6px; border-bottom: 1px solid #eee; text-align: right; font-family: Consolas, monospace; font-size: 9px;">${metric.formattedStateAverage || 'N/A'}</td>
          <td style="padding: 3px 6px; border-bottom: 1px solid #eee; text-align: right; font-family: Consolas, monospace; font-size: 9px; ${rankStyle}">${formattedRank}</td>
        </tr>
      `;
    }).join('');
    
    return `
      <div style="margin-bottom: 12px; page-break-inside: avoid;">
        <h2 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #b40000; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">${section.title}</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 4px 6px; text-align: left; font-weight: 600; color: #555; border-bottom: 1px solid #ddd;">Metric</th>
              <th style="padding: 4px 6px; text-align: right; font-weight: 600; color: #555; border-bottom: 1px solid #ddd; width: 90px;">County Value</th>
              <th style="padding: 4px 6px; text-align: right; font-weight: 600; color: #555; border-bottom: 1px solid #ddd; width: 90px;">State Avg</th>
              <th style="padding: 4px 6px; text-align: right; font-weight: 600; color: #555; border-bottom: 1px solid #ddd; width: 70px;">Rank</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }).join('');
}

/**
 * Get inline style for rank coloring
 */
function getRankStyle(rank, higherIsBetter) {
  if (typeof rank !== 'number') return '';
  
  if (higherIsBetter === true) {
    if (rank <= 15) return 'color: #27ae60; font-weight: 600;';
    if (rank >= 53) return 'color: #e74c3c; font-weight: 600;';
  } else if (higherIsBetter === false) {
    if (rank >= 53) return 'color: #27ae60; font-weight: 600;';
    if (rank <= 15) return 'color: #e74c3c; font-weight: 600;';
  }
  return '';
}

/**
 * Show/hide recap section based on county selection
 */
function updateRecapSection(hasCounty) {
  const section = document.getElementById('county-recap-section');
  const countyNameSpan = document.getElementById('recap-county-name');
  
  if (section) {
    section.style.display = hasCounty ? 'block' : 'none';
  }
  
  if (countyNameSpan && appState.selectedCounty) {
    countyNameSpan.textContent = appState.selectedCounty.name;
  }
}

/**
 * Initialize recap download button
 */
function initRecapDownload() {
  const btn = document.getElementById('download-recap-btn');
  if (btn) {
    btn.addEventListener('click', downloadCountyRecap);
  }
}

/**
 * Show error state
 */
function showErrorState(message) {
  const loadingEl = document.getElementById('map-loading');
  if (loadingEl) {
    loadingEl.innerHTML = `
      <span style="color: #e74c3c;">
        <strong>Error loading data</strong><br>
        ${message}<br>
        <small>Make sure the data files are accessible.</small>
      </span>
    `;
    loadingEl.classList.remove('hidden');
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export for potential external use
export { appState, selectCountyByName, toggleCountyComparison };
