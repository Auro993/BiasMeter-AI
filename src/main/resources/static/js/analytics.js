// analytics.js - Detailed analytics page functionality

let detailedChart;
let analyticsData = [];
let isPaused = false;
let currentTimeRange = 30; // seconds
let smoothingLevel = 50;
const UPDATE_INTERVAL = 2000; // 2 seconds

// Initialize analytics page
document.addEventListener('DOMContentLoaded', function() {
    initializeAnalytics();
    setupEventListeners();
    startDataCollection();
});

function initializeAnalytics() {
    // Initialize the detailed chart
    initDetailedChart();
    
    // Set initial stats
    updateStats();
    
    // Show current time
    document.getElementById('currentTime').textContent = new Date().toLocaleTimeString();
}

function initDetailedChart() {
    const ctx = document.getElementById('detailedBiasChart').getContext('2d');
    
    detailedChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Fairness Score',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 8
                },
                {
                    label: 'Trend Line',
                    data: [],
                    borderColor: '#2ecc71',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.4,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Fairness Score (%)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        },
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Time (seconds ago)',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        maxTicksLimit: 10,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(44, 62, 80, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y.toFixed(1) + '%';
                            return label;
                        },
                        afterLabel: function(context) {
                            if (context.datasetIndex === 0) {
                                const biasScore = 100 - context.parsed.y;
                                return `Bias Score: ${biasScore.toFixed(1)}%`;
                            }
                            return '';
                        }
                    }
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            yMin: 80,
                            yMax: 80,
                            borderColor: '#2ecc71',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Good (80%)',
                                position: 'start',
                                backgroundColor: '#2ecc71',
                                color: 'white',
                                font: {
                                    size: 10
                                }
                            }
                        },
                        line2: {
                            type: 'line',
                            yMin: 60,
                            yMax: 60,
                            borderColor: '#f39c12',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Warning (60%)',
                                position: 'start',
                                backgroundColor: '#f39c12',
                                color: 'white',
                                font: {
                                    size: 10
                                }
                            }
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'nearest'
            }
        }
    });
}

function setupEventListeners() {
    // Time range buttons
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.range === 'pause') {
                isPaused = !isPaused;
                this.classList.toggle('active');
                this.innerHTML = isPaused ? '▶️ Resume' : '⏸️ Pause';
                return;
            }
            
            // Update active button
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update time range
            currentTimeRange = parseInt(this.dataset.range);
            updateChartTimeRange();
        });
    });
    
    // Smoothing slider
    document.getElementById('smoothingSlider').addEventListener('input', function() {
        smoothingLevel = parseInt(this.value);
        updateTrendLine();
    });
    
    // Download buttons
    document.getElementById('downloadPNG').addEventListener('click', downloadPNG);
    document.getElementById('downloadCSV').addEventListener('click', downloadCSV);
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('exportReport').addEventListener('click', exportReport);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === ' ') {
            isPaused = !isPaused;
            const pauseBtn = document.querySelector('[data-range="pause"]');
            if (pauseBtn) {
                pauseBtn.classList.toggle('active');
                pauseBtn.innerHTML = isPaused ? '▶️ Resume' : '⏸️ Pause';
            }
            e.preventDefault();
        }
    });
}

function startDataCollection() {
    // Start collecting data
    setInterval(updateAnalyticsData, UPDATE_INTERVAL);
}

function updateAnalyticsData() {
    if (isPaused) return;
    
    // Generate new data point
    const lastValue = analyticsData.length > 0 ? analyticsData[analyticsData.length - 1].value : 85;
    let newValue;
    
    // Add realistic fluctuations
    if (Math.random() > 0.8) {
        // Occasional dip
        newValue = Math.max(60, lastValue - (15 + Math.random() * 20));
    } else if (Math.random() > 0.9) {
        // Occasional spike
        newValue = Math.min(100, lastValue + (15 + Math.random() * 20));
    } else {
        // Normal fluctuation
        newValue = Math.min(100, Math.max(60, lastValue + (Math.random() * 6 - 3)));
    }
    
    // Add to data array
    analyticsData.push({
        timestamp: new Date(),
        value: newValue,
        maleRate: 40 + (newValue - 70) / 30 * 20 + Math.random() * 10,
        femaleRate: 60 - (newValue - 70) / 30 * 20 + Math.random() * 10
    });
    
    // Keep only data within time range
    const cutoffTime = new Date(Date.now() - currentTimeRange * 1000);
    analyticsData = analyticsData.filter(point => point.timestamp >= cutoffTime);
    
    // Update chart
    updateChart();
    
    // Update stats
    updateStats();
    
    // Check for alerts
    checkForAlerts();
}

function updateChart() {
    const labels = analyticsData.map((point, index) => {
        const secondsAgo = Math.floor((Date.now() - point.timestamp) / 1000);
        return secondsAgo === 0 ? 'Now' : `-${secondsAgo}s`;
    });
    
    const values = analyticsData.map(point => point.value);
    
    // Update main dataset
    detailedChart.data.labels = labels;
    detailedChart.data.datasets[0].data = values;
    
    // Update trend line
    updateTrendLine();
    
    // Update chart
    detailedChart.update('none');
}

function updateTrendLine() {
    if (analyticsData.length === 0) return;
    
    const values = analyticsData.map(point => point.value);
    const smoothedValues = applySmoothing(values, smoothingLevel / 100);
    
    detailedChart.data.datasets[1].data = smoothedValues;
    detailedChart.update('none');
}

function applySmoothing(data, factor) {
    if (data.length === 0) return [];
    
    const smoothed = [data[0]];
    for (let i = 1; i < data.length; i++) {
        smoothed.push(smoothed[i-1] * (1 - factor) + data[i] * factor);
    }
    return smoothed;
}

function updateStats() {
    if (analyticsData.length === 0) return;
    
    const values = analyticsData.map(point => point.value);
    const currentValue = values[values.length - 1];
    const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    
    document.getElementById('avgBias').textContent = (100 - avgValue).toFixed(1);
    document.getElementById('currentBiasDetailed').textContent = (100 - currentValue).toFixed(1);
    document.getElementById('minBias').textContent = (100 - minValue).toFixed(1);
    document.getElementById('maxBias').textContent = (100 - maxValue).toFixed(1);
}

function checkForAlerts() {
    if (analyticsData.length < 5) return;
    
    const recentValues = analyticsData.slice(-5).map(point => point.value);
    const currentValue = recentValues[recentValues.length - 1];
    const avgRecent = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
    
    let alertText = 'No alerts in current time range';
    
    if (currentValue < 60) {
        alertText = '⚠️ CRITICAL: Fairness score below 60%';
    } else if (currentValue < 70) {
        alertText = '⚠️ WARNING: Fairness score below 70%';
    } else if (avgRecent < 75 && Math.random() > 0.7) {
        alertText = '⚠️ MONITOR: Average score trending low';
    }
    
    document.getElementById('alertSummary').textContent = alertText;
}

function updateChartTimeRange() {
    // Filter data based on time range
    const cutoffTime = new Date(Date.now() - currentTimeRange * 1000);
    analyticsData = analyticsData.filter(point => point.timestamp >= cutoffTime);
    
    // Update chart with filtered data
    updateChart();
    updateStats();
}

// Download functions
function downloadPNG() {
    const link = document.createElement('a');
    link.download = `bias-trend-${new Date().toISOString().slice(0,10)}.png`;
    link.href = detailedChart.toBase64Image();
    link.click();
}

function downloadCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Timestamp,Fairness Score (%),Bias Score (%),Male Rate (%),Female Rate (%)\n";
    
    analyticsData.forEach(point => {
        const row = [
            point.timestamp.toISOString(),
            point.value.toFixed(2),
            (100 - point.value).toFixed(2),
            point.maleRate.toFixed(2),
            point.femaleRate.toFixed(2)
        ].join(',');
        csvContent += row + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bias-data-${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadPDF() {
    alert('PDF export would require additional libraries. For demo purposes, this would generate a professional report.');
}

function exportReport() {
    alert('Full report export feature would generate: \n1. Executive Summary\n2. Detailed Charts\n3. Statistical Analysis\n4. Recommendations\n5. Compliance Checklist');
}

// Add to main dashboard: Link to analytics page
// Add this button in your main dashboard:
function addAnalyticsButton() {
    const button = document.createElement('a');
    button.href = '/analytics.html';
    button.className = 'realtime-btn';
    button.innerHTML = '<i class="fas fa-chart-line"></i> View Detailed Analytics';
    button.style.marginLeft = '15px';
    
    const controls = document.querySelector('.realtime-controls');
    if (controls) {
        controls.appendChild(button);
    }
}

// Initialize on main page
if (window.location.pathname === '/') {
    document.addEventListener('DOMContentLoaded', addAnalyticsButton);
}