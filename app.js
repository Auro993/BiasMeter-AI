let chart;

document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const dropArea = document.getElementById('dropArea');
    const selectedFile = document.getElementById('selectedFile');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const resultsContent = document.getElementById('resultsContent');
    const loading = document.getElementById('loading');
    
    // Browse button click event
    browseBtn.addEventListener('click', function() {
        fileInput.click();
    });
    
    // File input change event
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            const file = this.files[0];
            displayFileInfo(file);
        }
    });
    
    // Drag and drop functionality
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.classList.add('dragover');
    });
    
    dropArea.addEventListener('dragleave', function() {
        dropArea.classList.remove('dragover');
    });
    
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dropArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            displayFileInfo(file);
            fileInput.files = e.dataTransfer.files;
        }
    });
    
    // Display file information
    function displayFileInfo(file) {
        selectedFile.style.display = 'flex';
        fileName.textContent = file.name;
        
        // Calculate file size
        const sizeInMB = file.size / (1024 * 1024);
        fileSize.textContent = sizeInMB.toFixed(2) + ' MB';
        
        // Change file icon based on extension
        const fileIcon = selectedFile.querySelector('.file-icon');
        if (file.name.toLowerCase().endsWith('.csv')) {
            fileIcon.innerHTML = '<i class="fas fa-file-csv"></i>';
        } else {
            fileIcon.innerHTML = '<i class="fas fa-file-alt"></i>';
        }
    }
    
    // Analyze button click event - This connects to your backend
    analyzeBtn.addEventListener('click', async function() {
        if (!fileInput.files.length) {
            alert('Please select a CSV file first!');
            return;
        }
        
        // Show loading animation
        loading.style.display = 'block';
        analyzeBtn.style.display = 'none';
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        try {
            // Call your Spring Boot backend
            const response = await fetch('/bias/check', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const result = await response.json();
            
            // Hide loading animation
            loading.style.display = 'none';
            analyzeBtn.style.display = 'flex';
            
            // Show results
            resultsPlaceholder.style.display = 'none';
            resultsContent.style.display = 'block';
            
            // Display the results from backend
            displayResults(result);
            
        } catch (error) {
            console.error('Error:', error);
            loading.style.display = 'none';
            analyzeBtn.style.display = 'flex';
            alert('Error analyzing file. Please check the console for details.');
        }
    });
    
    // Function to display results from backend
    function displayResults(result) {
        // Update overall bias score
        const scoreValue = document.querySelector('.score-value');
        const scoreText = document.querySelector('.score-text');
        
        scoreValue.textContent = result.biasScore.toFixed(1);
        scoreText.textContent = result.status;
        
        // Update gender bias category
        const maleRateElem = document.querySelector('.male-rate');
        const femaleRateElem = document.querySelector('.female-rate');
        const genderBiasValue = document.querySelector('.gender-bias-value');
        const genderProgress = document.querySelector('.gender-progress');
        
        if (maleRateElem) maleRateElem.textContent = result.maleRate.toFixed(1) + '%';
        if (femaleRateElem) femaleRateElem.textContent = result.femaleRate.toFixed(1) + '%';
        
        const genderBiasScore = result.biasScore;
        if (genderBiasValue) genderBiasValue.textContent = genderBiasScore.toFixed(1) + '/10';
        
        // Set progress bar based on bias score
        let progressWidth = (genderBiasScore / 10) * 100;
        if (progressWidth > 100) progressWidth = 100;
        
        if (genderProgress) {
            genderProgress.style.width = progressWidth + '%';
            
            // Set color based on bias level
            if (genderBiasScore < 4) {
                genderProgress.className = 'progress-fill low-bias';
            } else if (genderBiasScore < 7) {
                genderProgress.className = 'progress-fill medium-bias';
            } else {
                genderProgress.className = 'progress-fill high-bias';
            }
        }
        
        // Draw chart
        drawChart(result.maleRate, result.femaleRate, result.biasScore);
        
        // Update message
        const messageElem = document.querySelector('.recommendations p');
        if (messageElem) {
            messageElem.textContent = result.message;
        }
    }
    
    // Function to draw chart
    function drawChart(male, female, bias) {
        const ctx = document.getElementById("biasChart").getContext("2d");
        
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Male Selection Rate", "Female Selection Rate", "Bias Score"],
                datasets: [{
                    label: "Percentage (%)",
                    data: [male, female, bias],
                    backgroundColor: [
                        "#42a5f5",
                        "#ec407a",
                        "#ff7043"
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(male, female, bias) * 1.2,
                        title: {
                            display: true,
                            text: 'Percentage (%)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': ' + context.raw.toFixed(1) + '%';
                            }
                        }
                    }
                }
            }
        });
    }
});