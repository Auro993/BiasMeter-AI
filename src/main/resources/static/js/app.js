// app.js - Complete JavaScript for BiasMeter AI Platform
// Version: 3.0.0 - With Scrollable Modal & Working Registration

// ==================== GLOBAL VARIABLES ====================
let chart;
let currentIndustry = 'hiring';
let isAnalyzing = false;
let currentUser = null;
let realtimeInterval = null;
let authToken = null;

// Industry configurations
const industryConfigs = {
    hiring: {
        name: "Hiring",
        icon: "fa-briefcase",
        format: "Gender,Experience,Position,Selected",
        description: "Analyzes gender bias in hiring decisions",
        metrics: ['Gender Parity', 'Experience Bias', 'Position Bias'],
        biasThreshold: 25
    },
    finance: {
        name: "Finance",
        icon: "fa-money-bill-wave",
        format: "Gender,Income,CreditScore,LoanApproved",
        description: "Detects bias in loan approvals and credit scoring",
        metrics: ['Approval Rate', 'Income Bias', 'Credit Score Equity'],
        biasThreshold: 20
    },
    education: {
        name: "Education",
        icon: "fa-graduation-cap",
        format: "Gender,TestScore,Extracurriculars,Admitted",
        description: "Identifies bias in admissions and grading",
        metrics: ['Admission Rate', 'Test Score Impact', 'Extracurricular Weight'],
        biasThreshold: 30
    },
    health: {
        name: "Health",
        icon: "fa-heartbeat",
        format: "Gender,Age,Symptoms,TreatmentGiven",
        description: "Analyzes bias in medical treatment recommendations",
        metrics: ['Treatment Parity', 'Age Bias', 'Symptom Assessment'],
        biasThreshold: 15
    },
    justice: {
        name: "Criminal Justice",
        icon: "fa-gavel",
        format: "Ethnicity,Priors,BailAmount,Sentenced",
        description: "Detects bias in bail amounts and sentencing",
        metrics: ['Bail Disparity', 'Sentencing Equity', 'Prior Offense Weight'],
        biasThreshold: 20
    },
    ecommerce: {
        name: "E-commerce",
        icon: "fa-shopping-cart",
        format: "UserGender,BrowsingHistory,PriceShown,Purchased",
        description: "Identifies price discrimination and recommendation bias",
        metrics: ['Price Parity', 'Recommendation Bias', 'Purchase Rate'],
        biasThreshold: 35
    },
    social: {
        name: "Social Media",
        icon: "fa-users",
        format: "UserDemographic,ContentType,Visibility,Engagement",
        description: "Analyzes content visibility and engagement bias",
        metrics: ['Visibility Score', 'Engagement Parity', 'Content Type Bias'],
        biasThreshold: 40
    },
    industrial: {
        name: "Industrial",
        icon: "fa-industry",
        format: "WorkerGender,Experience,SafetyIncidents,Promoted",
        description: "Detects bias in promotions and safety evaluations",
        metrics: ['Promotion Rate', 'Safety Assessment', 'Experience Weight'],
        biasThreshold: 30
    }
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 BiasMeter AI loaded');
    
    // Initialize authentication
    initAuth();
    
    // Setup login modal functionality
    setupLoginModal();
    
    // Setup form handlers
    setupAuthFormHandlers();
    
    // Test API connection
    testApiConnection();
    
    // Initialize the application
    initializeApp();
    
    // Check authentication for protected pages
    if (window.location.pathname.includes('dashboard')) {
        checkAuthentication();
    }
});

// ==================== AUTHENTICATION ====================
function initAuth() {
    console.log('🔐 Initializing authentication...');
    
    const savedUser = localStorage.getItem('biasmeter_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            console.log('✅ User restored:', currentUser.email);
            updateUIAfterLogin();
        } catch (e) {
            console.error('Error parsing saved user:', e);
            clearAuthData();
        }
    }
}

function setupLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModal');
    const navLoginBtn = document.getElementById('navLoginBtn');
    const exploreBtn = document.getElementById('exploreBtn');
    const authTabs = document.querySelectorAll('.auth-tab');
    
    // Show modal
    function showLoginModal() {
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Scroll to top
            loginModal.scrollTop = 0;
        }
    }
    
    // Close modal
    function closeLoginModal() {
        if (loginModal) {
            loginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Clear forms
            document.getElementById('loginFormElement')?.reset();
            document.getElementById('registerFormElement')?.reset();
        }
    }
    
    // Event listeners
    if (navLoginBtn) navLoginBtn.addEventListener('click', showLoginModal);
    if (exploreBtn) exploreBtn.addEventListener('click', showLoginModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeLoginModal);
    
    // Close when clicking outside modal
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                closeLoginModal();
            }
        });
    }
    
    // Tab switching
    if (authTabs) {
        authTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const tabId = this.dataset.tab;
                
                // Update active tab
                authTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding form
                document.getElementById('loginForm').classList.remove('active');
                document.getElementById('registerForm').classList.remove('active');
                
                if (tabId === 'login') {
                    document.getElementById('loginForm').classList.add('active');
                } else {
                    document.getElementById('registerForm').classList.add('active');
                }
                
                // Scroll to top of form
                const loginRight = document.querySelector('.login-right');
                if (loginRight) loginRight.scrollTop = 0;
            });
        });
    }
}

function setupAuthFormHandlers() {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            
            // Show loading
            const submitBtn = loginForm.querySelector('.auth-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
            submitBtn.disabled = true;
            
            const result = await login(email, password, rememberMe);
            
            // Reset button if login failed
            if (!result.success) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Register form - FIXED WITH SCROLLABLE SUPPORT
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const company = document.getElementById('registerCompany').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Show loading
            const submitBtn = registerForm.querySelector('.auth-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;
            
            // Validation
            if (!email.includes('@')) {
                showNotification('Please enter a valid email address', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            if (password.length < 6) {
                showNotification('Password must be at least 6 characters', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            if (password !== confirmPassword) {
                showNotification('Passwords do not match', 'error');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            const result = await register(name, email, company, password);
            
            // Reset button if registration failed
            if (!result.success) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Auto-fill demo credentials
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    
    if (loginEmail) {
        loginEmail.addEventListener('dblclick', function() {
            this.value = 'demo@biasmeter.ai';
        });
        
        // Auto-fill with user's email if saved
        if (currentUser?.email) {
            loginEmail.value = currentUser.email;
        }
    }
    
    if (loginPassword) {
        loginPassword.addEventListener('dblclick', function() {
            this.value = 'demo123';
        });
    }
}

async function login(email, password, rememberMe = false) {
    console.log('🔐 Attempting login for:', email);
    
    try {
        // Try real API first
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: email, 
                password: password 
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                currentUser = data.user;
                
                if (rememberMe) {
                    localStorage.setItem('biasmeter_user', JSON.stringify(currentUser));
                } else {
                    sessionStorage.setItem('biasmeter_user', JSON.stringify(currentUser));
                }
                
                showNotification('Login successful!', 'success');
                
                // Close modal and redirect
                setTimeout(() => {
                    document.getElementById('loginModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                    window.location.href = '/dashboard.html';
                }, 1500);
                
                return { success: true };
            }
        }
    } catch (error) {
        console.log('Using demo login:', error);
    }
    
    // Fallback to demo login
    return demoLogin(email, password, rememberMe);
}

async function register(name, email, company, password) {
    console.log('📝 Attempting registration for:', email);
    
    try {
        // Try real API first
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                email: email,
                company: company || '',
                password: password
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                showNotification('Account created successfully!', 'success');
                
                // Auto-fill login form
                document.getElementById('loginEmail').value = email;
                document.getElementById('loginPassword').value = password;
                
                // Switch to login tab after delay
                setTimeout(() => {
                    switchToLoginTab();
                    // Scroll to top
                    const loginRight = document.querySelector('.login-right');
                    if (loginRight) loginRight.scrollTop = 0;
                }, 1500);
                
                return { success: true };
            }
        }
    } catch (error) {
        console.log('Using demo registration:', error);
    }
    
    // Fallback to demo registration
    return demoRegister(name, email, company, password);
}

function demoLogin(email, password, rememberMe) {
    console.log('👤 DEMO: Simulating login for:', email);
    
    // Demo users
    const demoUsers = {
        'demo@biasmeter.ai': { 
            name: 'Demo User', 
            role: 'user',
            company: 'Demo Corp'
        },
        'admin@biasmeter.ai': { 
            name: 'Admin User', 
            role: 'admin',
            company: 'Admin Corp'
        },
        'aurosmitasahood@gmail.com': { 
            name: 'Aurosmita Sahoo', 
            role: 'user',
            company: 'Centurion University'
        }
    };
    
    const userData = demoUsers[email] || {
        name: email.split('@')[0] || 'New User',
        role: 'user',
        company: 'User Company'
    };
    
    currentUser = {
        email: email,
        ...userData
    };
    
    // Store user
    if (rememberMe) {
        localStorage.setItem('biasmeter_user', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('biasmeter_user', JSON.stringify(currentUser));
    }
    
    showNotification('Demo login successful!', 'success');
    
    // Close modal and redirect
    setTimeout(() => {
        document.getElementById('loginModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        window.location.href = '/dashboard.html';
    }, 1000);
    
    return { success: true };
}

function demoRegister(name, email, company, password) {
    console.log('📝 DEMO: Simulating registration for:', email);
    
    currentUser = {
        name: name,
        email: email,
        company: company || '',
        role: 'user'
    };
    
    // Store user
    localStorage.setItem('biasmeter_user', JSON.stringify(currentUser));
    
    showNotification('Demo account created! Auto-filling login...', 'success');
    
    // Auto-fill login form
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    
    // Switch to login tab after delay
    setTimeout(() => {
        switchToLoginTab();
        // Scroll to top
        const loginRight = document.querySelector('.login-right');
        if (loginRight) loginRight.scrollTop = 0;
    }, 1500);
    
    return { success: true };
}

function switchToLoginTab() {
    // Switch tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector('[data-tab="login"]').classList.add('active');
    
    // Switch forms
    document.getElementById('loginForm').classList.add('active');
    document.getElementById('registerForm').classList.remove('active');
}

function updateUIAfterLogin() {
    if (!currentUser) return;
    
    // Update user info in header if elements exist
    const userEmail = document.getElementById('userEmail');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    
    if (userEmail) userEmail.textContent = currentUser.email;
    if (userName) userName.textContent = currentUser.name;
    if (userAvatar) {
        // Set avatar initials
        let initials = 'U';
        if (currentUser.name) {
            initials = currentUser.name.split(' ')
                .map(name => name[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        }
        userAvatar.textContent = initials;
        
        // Add random color
        const colors = ['#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12'];
        const colorIndex = currentUser.email.length % colors.length;
        userAvatar.style.background = colors[colorIndex];
    }
}

function logout() {
    clearAuthData();
    showNotification('Logged out successfully', 'info');
    setTimeout(() => {
        window.location.href = '/';
    }, 1000);
}

function clearAuthData() {
    localStorage.removeItem('biasmeter_user');
    sessionStorage.removeItem('biasmeter_user');
    currentUser = null;
}

function checkAuthentication() {
    const savedUser = localStorage.getItem('biasmeter_user') || 
                      sessionStorage.getItem('biasmeter_user');
    
    if (!savedUser) {
        // Redirect to homepage
        setTimeout(() => {
            window.location.href = '/';
        }, 1000);
    }
}

// ==================== MAIN APP FUNCTIONS ====================
async function testApiConnection() {
    try {
        console.log('🔌 Testing API connection...');
        const response = await fetch('/api/test');
        if (response.ok) {
            console.log('✅ API Connected');
            showNotification('Connected to BiasMeter AI API', 'success', 3000);
        }
    } catch (error) {
        console.log('⚠️ API connection failed - using demo mode');
        showNotification('Using demo mode - API not connected', 'warning', 5000);
    }
}

function initializeApp() {
    console.log('🔄 Initializing BiasMeter AI...');
    
    // Set current time
    updateSystemTime();
    setInterval(updateSystemTime, 60000);
    
    // Setup event listeners
    setupEventListeners();
    
    // Set default industry
    setIndustry('hiring');
    
    // Initialize charts
    initializeCharts();
    
    // Initialize real-time monitoring
    initializeRealTimeMonitoring();
    
    // Update UI if user is logged in
    if (currentUser) {
        updateUIAfterLogin();
        setTimeout(() => {
            showNotification(`Welcome back, ${currentUser.name}!`, 'info', 4000);
        }, 1000);
    }
    
    console.log('✅ Application initialized');
}

function updateSystemTime() {
    const timeElement = document.getElementById('systemTime');
    if (timeElement) {
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
}

function setupEventListeners() {
    console.log('🔧 Setting up event listeners...');
    
    // File upload
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const dropArea = document.getElementById('dropArea');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (browseBtn) {
        browseBtn.addEventListener('click', () => {
            console.log('📁 Browse button clicked');
            fileInput.click();
        });
    }
    
    if (fileInput) {
        fileInput.addEventListener('change', handleFileSelect);
    }
    
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', handleAnalyzeClick);
    }
    
    // Drag and drop
    if (dropArea) {
        setupDragAndDrop(dropArea, fileInput);
    }
    
    // Industry selection
    const industryGrid = document.getElementById('industryGrid');
    if (industryGrid) {
        industryGrid.addEventListener('click', handleIndustrySelect);
    }
    
    // Real-time monitoring
    const startRealtimeBtn = document.getElementById('startRealtime');
    const stopRealtimeBtn = document.getElementById('stopRealtime');
    
    if (startRealtimeBtn) {
        startRealtimeBtn.addEventListener('click', startRealTimeMonitoring);
    }
    
    if (stopRealtimeBtn) {
        stopRealtimeBtn.addEventListener('click', stopRealTimeMonitoring);
    }
    
    // Export buttons
    const exportPDFBtn = document.getElementById('exportPDF');
    const exportCSVBtn = document.getElementById('exportCSV');
    
    if (exportPDFBtn) {
        exportPDFBtn.addEventListener('click', exportToPDF);
    }
    
    if (exportCSVBtn) {
        exportCSVBtn.addEventListener('click', exportToCSV);
    }
    
    // Trend details
    const viewTrendDetails = document.getElementById('viewTrendDetails');
    const closeTrendDetails = document.getElementById('closeTrendDetails');
    
    if (viewTrendDetails) {
        viewTrendDetails.addEventListener('click', function() {
            document.getElementById('trendDetailsPanel').style.display = 'block';
            this.style.display = 'none';
        });
    }
    
    if (closeTrendDetails) {
        closeTrendDetails.addEventListener('click', function() {
            document.getElementById('trendDetailsPanel').style.display = 'none';
            viewTrendDetails.style.display = 'inline-flex';
        });
    }
}

function setupDragAndDrop(dropArea, fileInput) {
    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            console.log('📁 File dropped:', file.name);
            displayFileInfo(file);
            fileInput.files = e.dataTransfer.files;
        }
    });
}

function handleFileSelect() {
    if (this.files.length > 0) {
        const file = this.files[0];
        console.log('📁 File selected:', file.name);
        displayFileInfo(file);
    }
}

function displayFileInfo(file) {
    const selectedFile = document.getElementById('selectedFile');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    
    if (!selectedFile || !fileName || !fileSize) return;
    
    selectedFile.style.display = 'flex';
    fileName.textContent = file.name;
    
    // Calculate file size
    const sizeInMB = file.size / (1024 * 1024);
    fileSize.textContent = sizeInMB < 1 ? 
        (file.size / 1024).toFixed(2) + ' KB' : 
        sizeInMB.toFixed(2) + ' MB';
    
    console.log(`✅ File info displayed: ${file.name} (${fileSize.textContent})`);
}

function handleIndustrySelect(event) {
    const industryCard = event.target.closest('.industry-card');
    if (!industryCard) return;
    
    const industry = industryCard.dataset.industry;
    console.log('🏭 Industry selected:', industry);
    setIndustry(industry);
}

function setIndustry(industry) {
    currentIndustry = industry;
    const config = industryConfigs[industry];
    
    if (!config) return;
    
    // Update UI
    document.querySelectorAll('.industry-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`[data-industry="${industry}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    // Update hints
    const fileFormat = document.getElementById('fileFormat');
    if (fileFormat) {
        fileFormat.textContent = `${config.name}: ${config.format}`;
    }
    
    console.log(`✅ Industry set to: ${config.name}`);
}

async function handleAnalyzeClick() {
    if (isAnalyzing) {
        showNotification('Analysis already in progress', 'warning');
        return;
    }
    
    const fileInput = document.getElementById('fileInput');
    if (!fileInput || !fileInput.files.length) {
        showNotification('Please select a CSV file first!', 'warning');
        return;
    }
    
    isAnalyzing = true;
    
    // Show loading
    const loading = document.getElementById('loading');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    if (loading) loading.style.display = 'block';
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
    }
    
    console.log('🔍 Starting analysis...');
    
    try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate results
        const result = simulateAnalysis(fileInput.files[0]);
        
        // Display results
        displayResults(result);
        showNotification('Analysis completed successfully!', 'success');
        
    } catch (error) {
        console.error('Analysis error:', error);
        showNotification('Analysis failed. Please try again.', 'error');
    } finally {
        isAnalyzing = false;
        
        if (loading) loading.style.display = 'none';
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analyze for Bias';
        }
    }
}

function simulateAnalysis(file) {
    const config = industryConfigs[currentIndustry];
    const biasScore = Math.floor(Math.random() * 50) + 10;
    const maleRate = Math.floor(Math.random() * 70) + 15;
    const femaleRate = Math.floor(Math.random() * 70) + 15;
    
    return {
        success: true,
        fileName: file.name,
        industry: config.name,
        biasScore: biasScore,
        maleRate: maleRate,
        femaleRate: femaleRate,
        otherRate: Math.floor(Math.random() * 30) + 5,
        status: getBiasStatus(biasScore),
        metrics: {
            biasScore: biasScore,
            disparateImpact: Math.floor(Math.random() * 40) + 60,
            statisticalParity: Math.floor(Math.random() * 30) + 70,
            sampleSize: Math.floor(Math.random() * 5000) + 1000,
            confidence: Math.floor(Math.random() * 30) + 70,
            riskLevel: getRiskLevel(biasScore)
        },
        message: `Analysis of ${config.name} data completed`
    };
}

function displayResults(result) {
    // Update bias score
    const biasScore = result.biasScore || 0;
    const scoreValue = document.getElementById('scoreValue');
    const scoreText = document.getElementById('scoreText');
    
    if (scoreValue) scoreValue.textContent = biasScore.toFixed(1);
    if (scoreText) scoreText.textContent = result.status;
    
    // Update score circle color
    const scoreCircle = document.getElementById('scoreCircle');
    if (scoreCircle) {
        scoreCircle.style.background = getScoreColor(biasScore);
    }
    
    // Show results
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const resultsContent = document.getElementById('resultsContent');
    
    if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
    if (resultsContent) resultsContent.style.display = 'block';
    
    // Draw chart
    drawChart(result);
    
    // Update metrics
    updateMetrics(result.metrics || {});
    
    // Update recommendations
    updateRecommendations(result.recommendations || []);
    
    // Update real-time metrics
    updateRealTimeMetrics(result);
}

function getBiasStatus(score) {
    if (score < 15) return "Low Bias";
    if (score < 30) return "Moderate Bias";
    if (score < 45) return "High Bias";
    return "Critical Bias";
}

function getRiskLevel(score) {
    if (score < 15) return "Low";
    if (score < 30) return "Medium";
    if (score < 45) return "High";
    return "Critical";
}

function getScoreColor(score) {
    if (score < 15) return 'linear-gradient(135deg, #2ecc71, #27ae60)';
    if (score < 30) return 'linear-gradient(135deg, #f39c12, #d35400)';
    if (score < 45) return 'linear-gradient(135deg, #e74c3c, #c0392b)';
    return 'linear-gradient(135deg, #8b0000, #ff0000)';
}

// ==================== CHARTS ====================
function initializeCharts() {
    // Main bias chart
    const biasCtx = document.getElementById('biasChart');
    if (biasCtx) {
        chart = new Chart(biasCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'Score',
                    data: [0],
                    backgroundColor: ['#95a5a6']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Score (%)'
                        }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
        console.log('📊 Main chart initialized');
    }
    
    // Live bias chart
    const liveBiasCtx = document.getElementById('liveBiasChart');
    if (liveBiasCtx) {
        window.liveBiasChart = new Chart(liveBiasCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: Array.from({length: 20}, (_, i) => `${i+1}s`),
                datasets: [{
                    label: 'Bias Score',
                    data: Array(20).fill(50),
                    borderColor: 'rgb(52, 152, 219)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, max: 100, grid: { display: false } },
                    x: { grid: { display: false } }
                }
            }
        });
        console.log('📈 Live chart initialized');
    }
}

function drawChart(result) {
    const biasCtx = document.getElementById('biasChart');
    if (!biasCtx || !chart) return;
    
    if (chart) {
        chart.destroy();
    }
    
    const labels = ['Male Rate', 'Female Rate', 'Other Rate', 'Bias Score'];
    const data = [
        result.maleRate || 0,
        result.femaleRate || 0,
        result.otherRate || 0,
        result.biasScore || 0
    ];
    
    const colors = ['#3498db', '#e74c3c', '#9b59b6', '#ff7043'];
    
    chart = new Chart(biasCtx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Score',
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: Math.max(...data) * 1.2,
                    title: { display: true, text: 'Score (%)' }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// ==================== METRICS ====================
function updateMetrics(metrics) {
    const metricsGrid = document.getElementById('metricsGrid');
    if (!metricsGrid) return;
    
    metricsGrid.innerHTML = '';
    
    const metricEntries = [
        ['Bias Score', metrics.biasScore || 0, '%'],
        ['Disparate Impact', metrics.disparateImpact || 0, '%'],
        ['Statistical Parity', metrics.statisticalParity || 0, '%'],
        ['Sample Size', metrics.sampleSize || 0, ''],
        ['Confidence', metrics.confidence || 0, '%'],
        ['Risk Level', metrics.riskLevel || 'Low', '']
    ];
    
    metricEntries.forEach(([name, value, unit]) => {
        const metricCard = document.createElement('div');
        metricCard.className = 'metric-card';
        
        let riskClass = '';
        if (name === 'Risk Level') {
            if (value === 'High' || value === 'Critical') riskClass = 'risk-high';
            else if (value === 'Medium') riskClass = 'risk-medium';
            else riskClass = 'risk-low';
        } else if (name === 'Bias Score') {
            if (value > 30) riskClass = 'risk-high';
            else if (value > 15) riskClass = 'risk-medium';
            else riskClass = 'risk-low';
        }
        
        metricCard.innerHTML = `
            <div class="metric-name">${name}</div>
            <div class="metric-value ${riskClass}">
                ${typeof value === 'number' ? value.toFixed(1) + unit : value}
            </div>
        `;
        
        metricsGrid.appendChild(metricCard);
    });
}

function updateRecommendations(recommendations) {
    const recommendationsDiv = document.getElementById('recommendations');
    if (!recommendationsDiv) return;
    
    if (!Array.isArray(recommendations) || recommendations.length === 0) {
        // Default recommendations
        const defaultRecs = {
            hiring: [
                "Implement blind resume screening",
                "Standardize interview questions",
                "Set diversity goals for hiring panels",
                "Regular bias audits of hiring algorithms"
            ],
            finance: [
                "Remove ZIP code from loan decisions",
                "Audit interest rate algorithms monthly",
                "Provide alternative credit scoring",
                "Transparent loan approval criteria"
            ]
        };
        
        recommendations = defaultRecs[currentIndustry] || [
            "Review data collection methods",
            "Implement regular bias audits",
            "Diversify training datasets",
            "Transparent decision-making processes"
        ];
    }
    
    const listItems = recommendations.map(rec => `<li>${rec}</li>`).join('');
    
    recommendationsDiv.innerHTML = `
        <h3><i class="fas fa-lightbulb"></i> ${industryConfigs[currentIndustry]?.name || 'Industry'} Recommendations</h3>
        <ul>${listItems}</ul>
    `;
}

// ==================== REAL-TIME MONITORING ====================
function initializeRealTimeMonitoring() {
    console.log('⚡ Initializing real-time monitoring...');
    updateRealTimeMetrics({ biasScore: 0, maleRate: 0, femaleRate: 0 });
}

function startRealTimeMonitoring() {
    console.log('▶️ Starting real-time monitoring');
    
    const startBtn = document.getElementById('startRealtime');
    const stopBtn = document.getElementById('stopRealtime');
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    
    // Update status
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) {
        statusIndicator.classList.remove('disconnected');
        statusIndicator.classList.add('connected');
        statusIndicator.querySelector('.status-text').textContent = 'Connected';
    }
    
    // Add initial alert
    addAlert('Monitoring Started', 'Real-time bias monitoring is now active', 'low');
    
    // Start updates
    let time = 0;
    realtimeInterval = setInterval(() => {
        time++;
        
        // Update live chart
        if (window.liveBiasChart) {
            const newData = window.liveBiasChart.data.datasets[0].data;
            newData.shift();
            newData.push(45 + Math.random() * 30);
            window.liveBiasChart.update('none');
        }
        
        // Update metrics occasionally
        if (time % 5 === 0) {
            updateSimulatedMetrics();
            
            // Random alerts
            if (Math.random() > 0.8) {
                const alerts = [
                    {title: 'Bias Spike Detected', message: 'Gender bias increased by 15%', level: 'high'},
                    {title: 'Anomaly Detected', message: 'Unusual selection pattern', level: 'medium'},
                    {title: 'System Update', message: 'New fairness constraints applied', level: 'low'}
                ];
                const alert = alerts[Math.floor(Math.random() * alerts.length)];
                addAlert(alert.title, alert.message, alert.level);
            }
        }
    }, 1000);
    
    showNotification('Real-time monitoring started', 'success');
}

function stopRealTimeMonitoring() {
    console.log('⏹️ Stopping real-time monitoring');
    
    const startBtn = document.getElementById('startRealtime');
    const stopBtn = document.getElementById('stopRealtime');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    
    // Update status
    const statusIndicator = document.getElementById('statusIndicator');
    if (statusIndicator) {
        statusIndicator.classList.remove('connected');
        statusIndicator.classList.add('disconnected');
        statusIndicator.querySelector('.status-text').textContent = 'Not Connected';
    }
    
    if (realtimeInterval) {
        clearInterval(realtimeInterval);
        realtimeInterval = null;
    }
    
    addAlert('Monitoring Stopped', 'Real-time bias monitoring has been stopped', 'low');
    showNotification('Real-time monitoring stopped', 'info');
}

function updateSimulatedMetrics() {
    const currentBias = parseFloat(document.getElementById('currentBias').textContent) || 0;
    const maleRate = parseFloat(document.getElementById('maleRate').textContent) || 0;
    const femaleRate = parseFloat(document.getElementById('femaleRate').textContent) || 0;
    
    const newBias = Math.max(0, Math.min(100, currentBias + (Math.random() - 0.5) * 10));
    const newMaleRate = Math.max(0, Math.min(100, maleRate + (Math.random() - 0.5) * 5));
    const newFemaleRate = Math.max(0, Math.min(100, femaleRate + (Math.random() - 0.5) * 5));
    
    document.getElementById('currentBias').textContent = newBias.toFixed(1);
    document.getElementById('maleRate').textContent = newMaleRate.toFixed(0) + '%';
    document.getElementById('femaleRate').textContent = newFemaleRate.toFixed(0) + '%';
    
    const trend = 100 - newBias;
    const trendValue = document.getElementById('trendValue');
    const trendBarFill = document.getElementById('trendBarFill');
    
    if (trendValue) trendValue.textContent = trend.toFixed(0) + '%';
    if (trendBarFill) trendBarFill.style.width = trend + '%';
    
    // Update alert count
    if (Math.random() > 0.9) {
        const alertCount = document.getElementById('alertCount');
        if (alertCount) {
            alertCount.textContent = parseInt(alertCount.textContent) + 1;
        }
    }
}

function updateRealTimeMetrics(result) {
    const currentBias = document.getElementById('currentBias');
    const maleRate = document.getElementById('maleRate');
    const femaleRate = document.getElementById('femaleRate');
    const trendValue = document.getElementById('trendValue');
    const trendBarFill = document.getElementById('trendBarFill');
    
    if (currentBias) currentBias.textContent = (result.biasScore || 0).toFixed(1);
    if (maleRate) maleRate.textContent = (result.maleRate || 0).toFixed(0) + '%';
    if (femaleRate) femaleRate.textContent = (result.femaleRate || 0).toFixed(0) + '%';
    
    const trend = 100 - (result.biasScore || 0);
    if (trendValue) trendValue.textContent = trend.toFixed(0) + '%';
    if (trendBarFill) trendBarFill.style.width = trend + '%';
}

function addAlert(title, message, level = 'low') {
    const alertList = document.getElementById('alertList');
    const alertCount = document.getElementById('alertCount');
    
    if (!alertList) return;
    
    const alertItem = document.createElement('div');
    alertItem.className = `alert-item ${level}`;
    alertItem.innerHTML = `
        <div class="alert-title">
            <i class="fas fa-${level === 'high' ? 'exclamation-triangle' : level === 'medium' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${title}
        </div>
        <div class="alert-message">${message}</div>
        <div class="alert-time">${getCurrentTime()}</div>
    `;
    
    alertList.insertBefore(alertItem, alertList.firstChild);
    
    // Limit alerts
    if (alertList.children.length > 5) {
        alertList.removeChild(alertList.lastChild);
    }
    
    // Update count
    if (alertCount) {
        alertCount.textContent = parseInt(alertCount.textContent) + 1;
    }
}

function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' });
}

// ==================== EXPORT FUNCTIONS ====================
function exportToPDF() {
    console.log('📄 Exporting to PDF...');
    showNotification('Preparing PDF export...', 'info');
    
    setTimeout(() => {
        showNotification('PDF report generated and downloaded!', 'success');
        
        // Simulate download
        const blob = new Blob(['BiasMeter AI Report'], {type: 'application/pdf'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BiasMeter_Report_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1500);
}

function exportToCSV() {
    console.log('📊 Exporting to CSV...');
    showNotification('Preparing CSV export...', 'info');
    
    setTimeout(() => {
        showNotification('CSV data exported and downloaded!', 'success');
        
        // Create CSV content
        const csvContent = "Metric,Value\nBias Score,25.5\nDisparate Impact,78.2\nStatistical Parity,85.6\nIndustry," + 
                         (industryConfigs[currentIndustry]?.name || currentIndustry) + "\nDate," + new Date().toLocaleDateString();
        
        const blob = new Blob([csvContent], {type: 'text/csv'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BiasMeter_Data_${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1500);
}

// ==================== NOTIFICATIONS ====================
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notif => notif.remove());
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// ==================== GLOBAL EXPORTS ====================
window.biasmeter = {
    login,
    register,
    logout,
    showNotification,
    addAlert,
    startRealTimeMonitoring,
    stopRealTimeMonitoring,
    exportToPDF,
    exportToCSV,
    getCurrentUser: () => currentUser,
    getCurrentIndustry: () => currentIndustry
};

console.log('🎉 BiasMeter AI v3.0.0 ready!');