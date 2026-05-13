/**
 * Charts Module - Simplified for metric-focused design
 * 
 * Features:
 * - Single comparison bar chart for comparing counties on current metric
 * - Statewide property tax trend chart (shown only for property tax metrics)
 * - Responsive sizing with viewBox
 * - Animated transitions
 */

import { formatValue, METRICS_CONFIG } from './data.js';

// Chart instances
let comparisonChart = null;
let statewideChart = null;

// Chart colors
const COLORS = {
  county: '#d02030',       // TaxWatch red
  statewide: '#6b7280',    // Grey for statewide
  comparison: ['#d02030', '#1a365d', '#059669', '#7c3aed', '#ea580c']
};

// Margin convention
const MARGIN = { top: 20, right: 60, bottom: 40, left: 100 };

/**
 * Initialize charts
 */
export function initCharts() {
  comparisonChart = createChartContainer('#comparison-chart');
}

/**
 * Create SVG container for a chart
 */
function createChartContainer(selector) {
  const container = d3.select(selector);
  if (container.empty()) return null;
  
  // Clear existing
  container.selectAll('*').remove();
  
  // Get dimensions
  const width = container.node().clientWidth || 350;
  const height = 200;
  
  // Create SVG with viewBox for responsiveness
  const svg = container.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('width', '100%')
    .attr('height', height);
  
  // Create main group with margins
  const g = svg.append('g')
    .attr('class', 'chart-area')
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);
  
  // Create axis groups
  g.append('g').attr('class', 'x-axis axis');
  g.append('g').attr('class', 'y-axis axis');
  
  // Create grid group
  g.append('g').attr('class', 'grid');
  
  // Create bars group
  g.append('g').attr('class', 'bars');
  
  // Store dimensions
  svg.datum({
    width: width - MARGIN.left - MARGIN.right,
    height: height - MARGIN.top - MARGIN.bottom
  });
  
  return svg;
}

/**
 * Update the comparison bar chart (horizontal bars for compared counties)
 */
export function updateComparisonBarChart(countiesData, metricKey, statewideStats) {
  if (!comparisonChart || !countiesData || countiesData.length === 0) return;
  
  const config = METRICS_CONFIG[metricKey];
  const stateAvg = statewideStats?.[metricKey]?.average;
  
  // Build data for chart
  const data = countiesData.map((county, i) => ({
    label: county.name,
    value: county[metricKey] || 0,
    color: COLORS.comparison[i % COLORS.comparison.length],
    format: config?.format || 'currency'
  }));
  
  // Add statewide average
  if (stateAvg) {
    data.push({
      label: 'Statewide Avg',
      value: stateAvg,
      color: COLORS.statewide,
      format: config?.format || 'currency',
      isAverage: true
    });
  }
  
  renderHorizontalBarChart(comparisonChart, data);
}

/**
 * Render horizontal bar chart
 */
function renderHorizontalBarChart(svg, data) {
  if (!svg || !data || data.length === 0) return;
  
  const dims = svg.datum();
  const { width, height } = dims;
  const g = svg.select('.chart-area');
  
  // Create scales
  const maxVal = d3.max(data, d => d.value) * 1.1;
  
  const x = d3.scaleLinear()
    .domain([0, maxVal])
    .range([0, width]);
  
  const y = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, height])
    .padding(0.25);
  
  // Update axes
  const xAxis = d3.axisBottom(x)
    .ticks(4)
    .tickFormat(d => {
      const format = data[0]?.format;
      if (format === 'currency') {
        return d >= 1000 ? `$${(d/1000).toFixed(0)}k` : `$${d.toFixed(0)}`;
      }
      if (format === 'percent') {
        return `${d.toFixed(0)}%`;
      }
      return d >= 1000 ? `${(d/1000).toFixed(0)}k` : d.toFixed(0);
    });
  
  const yAxis = d3.axisLeft(y);
  
  g.select('.x-axis')
    .attr('transform', `translate(0, ${height})`)
    .transition()
    .duration(300)
    .call(xAxis);
  
  g.select('.y-axis')
    .transition()
    .duration(300)
    .call(yAxis);
  
  // Add grid lines
  g.select('.grid')
    .selectAll('line')
    .data(x.ticks(4))
    .join('line')
    .attr('class', 'grid-line')
    .attr('x1', d => x(d))
    .attr('x2', d => x(d))
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#e5e7eb')
    .attr('stroke-dasharray', '2,2');
  
  // Update bars
  const bars = g.select('.bars')
    .selectAll('.bar-group')
    .data(data, d => d.label);
  
  // Enter
  const barsEnter = bars.enter()
    .append('g')
    .attr('class', 'bar-group');
  
  barsEnter.append('rect').attr('class', 'bar');
  barsEnter.append('text').attr('class', 'bar-value');
  
  // Update
  const barsUpdate = barsEnter.merge(bars);
  
  barsUpdate.select('.bar')
    .attr('y', d => y(d.label))
    .attr('height', y.bandwidth())
    .attr('fill', d => d.color)
    .attr('opacity', d => d.isAverage ? 0.6 : 1)
    .transition()
    .duration(300)
    .attr('x', 0)
    .attr('width', d => Math.max(0, x(d.value)));
  
  barsUpdate.select('.bar-value')
    .attr('y', d => y(d.label) + y.bandwidth() / 2)
    .attr('dy', '0.35em')
    .attr('fill', '#374151')
    .attr('font-size', '11px')
    .attr('font-weight', d => d.isAverage ? 'normal' : '600')
    .transition()
    .duration(300)
    .attr('x', d => x(d.value) + 5)
    .text(d => formatValue(d.value, d.format));
  
  // Exit
  bars.exit().remove();
}

/**
 * Clear all charts
 */
export function clearCharts() {
  if (comparisonChart) {
    comparisonChart.select('.bars').selectAll('*').remove();
  }
}

/**
 * Initialize the statewide property tax chart
 */
export async function initStatewideChart() {
  const container = d3.select('#statewide-property-tax-chart');
  if (container.empty()) return;
  
  // Check if chart already exists
  if (!container.select('svg').empty()) return;
  
  try {
    // Load chart data
    const response = await fetch('./data/charts.json');
    const chartsData = await response.json();
    
    if (!chartsData.statewidePropertyTaxGrowth) {
      console.warn('Statewide property tax data not found');
      return;
    }
    
    renderStatewideChart(chartsData.statewidePropertyTaxGrowth);
  } catch (error) {
    console.error('Failed to load statewide chart data:', error);
  }
}

/**
 * Render the statewide property tax line chart
 */
function renderStatewideChart(chartData) {
  const container = d3.select('#statewide-property-tax-chart');
  if (container.empty()) return;
  
  container.selectAll('*').remove();
  
  // Data is in chartData.data array
  const data = chartData.data;
  if (!data || data.length === 0) {
    console.warn('No data for statewide chart');
    return;
  }
  
  // Use container width for responsive sizing
  const containerWidth = container.node().clientWidth || 800;
  const width = Math.max(containerWidth, 600);
  const height = 350;
  const margin = { top: 30, right: 40, bottom: 60, left: 80 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const svg = container.append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('width', '100%')
    .attr('height', height);
  
  const g = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);
  
  // Parse years (format: "2000-01" -> use first year)
  const parseYear = d => {
    const parts = d.year.split('-');
    return new Date(parseInt(parts[0]), 0, 1);
  };
  
  const years = data.map(d => parseYear(d));
  
  // Define series with colors
  const series = [
    { key: 'total', label: 'Total', color: '#1a1a2e' },
    { key: 'schools', label: 'School Districts', color: '#4285f4' },
    { key: 'counties', label: 'Counties', color: '#d02030' },
    { key: 'municipalities', label: 'Municipalities', color: '#34a853' },
    { key: 'specialDistricts', label: 'Special Districts', color: '#fbbc04' }
  ];
  
  // Scales
  const x = d3.scaleTime()
    .domain(d3.extent(years))
    .range([0, innerWidth]);
  
  const maxVal = d3.max(data, d => d.total);
  const y = d3.scaleLinear()
    .domain([0, maxVal * 1.1])
    .range([innerHeight, 0]);
  
  // Axes
  const xAxis = d3.axisBottom(x)
    .ticks(6)
    .tickFormat(d3.timeFormat("'%y"));
  
  const yAxis = d3.axisLeft(y)
    .ticks(5)
    .tickFormat(d => `$${(d/1000).toFixed(0)}B`);
  
  g.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(xAxis);
  
  g.append('g')
    .attr('class', 'y-axis')
    .call(yAxis);
  
  // Draw lines for each series
  series.forEach(s => {
    const line = d3.line()
      .x((d, i) => x(years[i]))
      .y(d => y(d[s.key]))
      .curve(d3.curveMonotoneX);
    
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', s.color)
      .attr('stroke-width', s.key === 'total' ? 3 : 2)
      .attr('d', line);
  });
  
  // Add endpoint dots for total line only
  const keyPoints = [data[0], data[data.length - 1]];
  g.selectAll('.dot')
    .data(keyPoints)
    .join('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(parseYear(d)))
    .attr('cy', d => y(d.total))
    .attr('r', 4)
    .attr('fill', series[0].color);
  
  // Update legend with all series
  const legendContainer = document.getElementById('statewide-chart-legend');
  if (legendContainer) {
    const firstYear = data[0];
    const lastYear = data[data.length - 1];
    const totalGrowth = ((lastYear.total - firstYear.total) / firstYear.total * 100).toFixed(0);
    
    let legendHTML = `
      <div class="chart-legend-row">
        <div class="chart-legend-item">
          <span class="chart-legend-color" style="background: ${series[0].color}"></span>
          <span><strong>Total:</strong> $${(lastYear.total/1000).toFixed(1)}B (+${totalGrowth}%)</span>
        </div>
      </div>
      <div class="chart-legend-row">
    `;
    
    // Add component series to legend
    series.slice(1).forEach(s => {
      const val = lastYear[s.key];
      legendHTML += `
        <div class="chart-legend-item">
          <span class="chart-legend-color" style="background: ${s.color}"></span>
          <span>${s.label}: $${(val/1000).toFixed(1)}B</span>
        </div>
      `;
    });
    
    legendHTML += '</div>';
    legendContainer.innerHTML = legendHTML;
  }
}

// Legacy exports for compatibility (can be removed later)
export function updateComparisonChart() {}
export function updateBreakdownChart() {}
export function updateMultiCountyChart() {}
export function updateRevenueComparisonChart() {}
export function updateRevenueBreakdownChart() {}
export function updateExpenditureComparisonChart() {}
export function updateExpenditureBreakdownChart() {}
