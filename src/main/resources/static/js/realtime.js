// realtime.js - Real-time monitoring functionality

let liveChart;
let monitoringInterval;
let isMonitoring = false;
let liveDataPoints = [];
let alertCounter = 0;
const MAX_DATA_POINTS = 15;

// Initialize real-time monitoring
document.addEventListener('DOMContentLoaded', function() {
    initRealtimeMonitoring();
});

function initRealtimeMonitoring() {
    // Initialize live chart
    initLiveChart();
    
    // Set up event listeners
    setupRealtimeEventListeners();
    
    // Set initial values
    updateSystemTime();
    
    // Auto-update time every minute
    setInterval(updateSystemTime, 60000);
}

function initLiveChart() {
    const ctx = document.getElementById('liveBiasChart').getContext('2d');
    
    liveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Fairness Score',
                data: [],
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
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
                        color: '#666',
                        font: {
                            size: 12,
                            weight: '500'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        color: '#666',
                        maxTicksLimit: 6
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(44, 62, 80, 0.9)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return `Fairness: ${context.parsed.y.toFixed(1)}%`;
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

function setupRealtimeEventListeners() {
    const startBtn = document.getElementById('startRealtime');
    const stopBtn = document.getElementById('stopRealtime');
    const testAlertBtn = document.getElementById('testAlert');
    const viewTrendDetails = document.getElementById('viewTrendDetails');
    const closeTrendDetails = document.getElementById('closeTrendDetails');
    
    // Start monitoring
    startBtn.addEventListener('click', startMonitoring);
    
    // Stop monitoring
    stopBtn.addEventListener('click', stopMonitoring);
    
    // Test alert
    testAlertBtn.addEventListener('click', testAlert);
    
    // Trend details
    viewTrendDetails.addEventListener('click', () => {
        document.getElementById('trendDetailsPanel').classList.add('show');
    });
    
    closeTrendDetails.addEventListener('click', () => {
        document.getElementById('trendDetailsPanel').classList.remove('show');
    });
}

function startMonitoring() {
    if (isMonitoring) return;
    
    isMonitoring = true;
    const statusIndicator = document.getElementById('statusIndicator');
    
    // Update status
    statusIndicator.className = 'status-indicator connecting';
    statusIndicator.querySelector('.status-text').textContent = 'Connecting...';
    
    // Disable start button, enable stop button
    document.getElementById('startRealtime').disabled = true;
    document.getElementById('stopRealtime').disabled = false;
    
    // Simulate connection delay
    setTimeout(() => {
        statusIndicator.className = 'status-indicator connected';
        statusIndicator.querySelector('.status-text').textContent = 'Connected';
        
        // Clear existing data
        liveDataPoints = [];
        updateChartData([]);
        
        // Start data simulation
        monitoringInterval = setInterval(updateLiveData, 2000);
        
        // Add alert
        addAlert('System Connected', 'Real-time monitoring started successfully', 'low');
        
        // Update button states
        document.getElementById('testAlert').disabled = false;
        
    }, 1500);
}

function stopMonitoring() {
    if (!isMonitoring) return;
    
    isMonitoring = false;
    clearInterval(monitoringInterval);
    
    const statusIndicator = document.getElementById('statusIndicator');
    statusIndicator.className = 'status-indicator disconnected';
    statusIndicator.querySelector('.status-text').textContent = 'Not Connected';
    
    // Update button states
    document.getElementById('startRealtime').disabled = false;
    document.getElementById('stopRealtime').disabled = true;
    document.getElementById('testAlert').disabled = true;
    
    // Add alert
    addAlert('Monitoring Stopped', 'Real-time monitoring has been stopped', 'low');
}

function updateLiveData() {
    if (!isMonitoring) return;
    
    // Generate random data with some trend
    const lastValue = liveDataPoints.length > 0 ? liveDataPoints[liveDataPoints.length - 1] : 100;
    let newBias;
    
    // Add some randomness but keep trend
    if (Math.random() > 0.7) {
        // Occasional dip
        newBias = Math.max(60, lastValue - (10 + Math.random() * 20));
    } else if (Math.random() > 0.8) {
        // Occasional spike
        newBias = Math.min(100, lastValue + (10 + Math.random() * 20));
    } else {
        // Small fluctuations
        newBias = Math.min(100, Math.max(60, lastValue + (Math.random() * 10 - 5)));
    }
    
    // Calculate derived metrics
    const biasScore = 100 - newBias;
    const newMaleRate = 40 + (newBias - 70) / 30 * 20 + Math.random() * 10;
    const newFemaleRate = 60 - (newBias - 70) / 30 * 20 + Math.random() * 10;
    
    // Update UI
    document.getElementById('currentBias').textContent = biasScore.toFixed(1);
    document.getElementById('maleRate').textContent = newMaleRate.toFixed(1) + '%';
    document.getElementById('femaleRate').textContent = newFemaleRate.toFixed(1) + '%';
    
    // Update trend display
    updateTrendDisplay(newBias);
    
    // Add to data points
    liveDataPoints.push(newBias);
    if (liveDataPoints.length > MAX_DATA_POINTS) {
        liveDataPoints.shift();
    }
    
    // Update chart
    updateChartData(liveDataPoints);
    
    // Check for alerts
    checkForAlerts(newBias, biasScore);
}

function updateTrendDisplay(fairnessScore) {
    const trendValue = document.getElementById('trendValue');
    const trendBarFill = document.getElementById('trendBarFill');
    const biasTrend = document.getElementById('biasTrend');
    
    // Update value and bar
    trendValue.textContent = fairnessScore.toFixed(1) + '%';
    trendBarFill.style.width = fairnessScore + '%';
    
    // Update color and trend indicator
    trendValue.className = 'trend-value-large';
    
    if (fairnessScore >= 90) {
        trendValue.classList.add('success');
        biasTrend.textContent = '→ Excellent';
        biasTrend.style.color = '#2ecc71';
    } else if (fairnessScore >= 80) {
        trendValue.classList.add('warning');
        biasTrend.textContent = '→ Good';
        biasTrend.style.color = '#f39c12';
    } else if (fairnessScore >= 70) {
        trendValue.classList.add('warning');
        biasTrend.textContent = '→ Fair';
        biasTrend.style.color = '#f39c12';
    } else {
        trendValue.classList.add('danger');
        biasTrend.textContent = '→ Poor';
        biasTrend.style.color = '#e74c3c';
    }
}

function updateChartData(dataPoints) {
    const labels = dataPoints.map((_, index) => {
        const secondsAgo = (dataPoints.length - index - 1) * 2;
        return secondsAgo === 0 ? 'Now' : `-${secondsAgo}s`;
    });
    
    liveChart.data.labels = labels;
    liveChart.data.datasets[0].data = dataPoints;
    liveChart.update('none');
}

function checkForAlerts(fairnessScore, biasScore) {
    const alertCountEl = document.getElementById('alertCount');
    let currentAlerts = parseInt(alertCountEl.textContent);
    
    // Check for critical bias
    if (fairnessScore < 65 && Math.random() > 0.5) {
        addAlert('Critical Bias Detected', 
            `Fairness score dropped to ${fairnessScore.toFixed(1)}%. Immediate action required.`, 
            'high');
        currentAlerts++;
        flashAlertCount();
    }
    // Check for high bias
    else if (fairnessScore < 75 && Math.random() > 0.7) {
        addAlert('High Bias Warning', 
            `Fairness score is ${fairnessScore.toFixed(1)}%. Monitor closely.`, 
            'medium');
        currentAlerts++;
        flashAlertCount();
    }
    // Check for improvement
    else if (fairnessScore > 95 && Math.random() > 0.8) {
        addAlert('Excellent Fairness', 
            `Fairness score improved to ${fairnessScore.toFixed(1)}%. Good job!`, 
            'low');
    }
    
    // Update alert count
    alertCountEl.textContent = currentAlerts;
}

function testAlert() {
    const alertCountEl = document.getElementById('alertCount');
    let currentAlerts = parseInt(alertCountEl.textContent);
    
    addAlert('Test Alert', 
        'This is a test alert to verify the notification system is working correctly.', 
        'medium');
    
    currentAlerts++;
    alertCountEl.textContent = currentAlerts;
    flashAlertCount();
}

function addAlert(title, message, level) {
    const alertList = document.getElementById('alertList');
    const alertItem = document.createElement('div');
    
    const icons = {
        high: 'fa-exclamation-triangle',
        medium: 'fa-exclamation-circle',
        low: 'fa-info-circle'
    };
    
    const time = new Date().toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
    
    alertItem.className = `alert-item ${level}`;
    alertItem.innerHTML = `
        <div class="alert-title">
            <i class="fas ${icons[level]}"></i>
            ${title}
        </div>
        <div class="alert-message">${message}</div>
        <div class="alert-time">${time}</div>
    `;
    
    // Add to top of alert list
    alertList.insertBefore(alertItem, alertList.firstChild);
    
    // Limit to 10 alerts
    if (alertList.children.length > 10) {
        alertList.removeChild(alertList.lastChild);
    }
    
    // Add sound effect for high priority alerts
    if (level === 'high') {
        playAlertSound();
    }
    
    // Auto-remove low priority alerts after 1 minute
    if (level === 'low') {
        setTimeout(() => {
            if (alertItem.parentNode) {
                alertItem.style.opacity = '0';
                alertItem.style.transform = 'translateX(-100%)';
                setTimeout(() => {
                    if (alertItem.parentNode) {
                        alertItem.remove();
                        updateAlertCount();
                    }
                }, 300);
            }
        }, 60000);
    }
}

function flashAlertCount() {
    const alertCountEl = document.getElementById('alertCount');
    alertCountEl.style.color = '#e74c3c';
    alertCountEl.style.fontWeight = 'bold';
    alertCountEl.style.transform = 'scale(1.2)';
    
    setTimeout(() => {
        alertCountEl.style.color = '';
        alertCountEl.style.fontWeight = '';
        alertCountEl.style.transform = '';
    }, 500);
}

function updateAlertCount() {
    const alertList = document.getElementById('alertList');
    const alertCount = alertList.children.length;
    document.getElementById('alertCount').textContent = alertCount;
}

function playAlertSound() {
    // Create a simple beep sound using Web Audio API
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio context not supported');
    }
}

function updateSystemTime() {
    const timeElements = document.querySelectorAll('.alert-time:first-child');
    if (timeElements.length > 0) {
        timeElements[0].textContent = getCurrentTime();
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}

// Export functions if needed
window.realtime = {
    startMonitoring,
    stopMonitoring,
    addAlert,
    testAlert
};
// Add analytics page link functionality
function setupAnalyticsLink() {
    // This function can be called from app.js or realtime.js
    console.log('Analytics page available at: /analytics');
}

// Initialize when document is ready
if (document.getElementById('viewAnalyticsBtn')) {
    document.getElementById('viewAnalyticsBtn').addEventListener('click', function() {
        window.open('/analytics', '_blank');
    });
}

// Export for use in other files
window.analytics = {
    setupAnalyticsLink
};