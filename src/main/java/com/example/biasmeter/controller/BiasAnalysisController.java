package com.example.biasmeter.controller; 
 
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/bias")
@CrossOrigin(origins = "*")  // Allow frontend to call from any origin
public class BiasAnalysisController {
    
    private final Random random = new Random();
    
    /**
     * Health check endpoint
     * Useful for judges to test if backend is running
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "BiasMeter AI API");
        response.put("version", "1.0.0");
        response.put("message", "Ready to analyze bias in AI systems");
        response.put("timestamp", System.currentTimeMillis());
        return ResponseEntity.ok(response);
    }
    
    /**
     * Analyze CSV file for bias
     * This is called by the frontend when user clicks "Analyze for Bias"
     */
    @PostMapping("/analyze")
    public ResponseEntity<Map<String, Object>> analyzeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("industry") String industry) {
        
        try {
            // Log the request
            System.out.println("📁 Received file: " + file.getOriginalFilename());
            System.out.println("🏭 Industry: " + industry);
            System.out.println("📏 File size: " + file.getSize() + " bytes");
            
            // For demo purposes, simulate analysis
            // In a real application, you would parse the CSV here
            
            Map<String, Object> result = simulateBiasAnalysis(industry, file.getSize());
            
            // Add file info to result
            result.put("fileName", file.getOriginalFilename());
            result.put("fileSize", file.getSize());
            result.put("industry", industry);
            result.put("analysisTime", System.currentTimeMillis());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            System.err.println("❌ Error analyzing file: " + e.getMessage());
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Failed to analyze file: " + e.getMessage());
            error.put("suggestion", "Please check if the file is a valid CSV format");
            
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    /**
     * Get industry-specific CSV format
     */
    @GetMapping("/format/{industry}")
    public ResponseEntity<Map<String, String>> getIndustryFormat(@PathVariable String industry) {
        Map<String, String> formats = new HashMap<>();
        
        formats.put("hiring", "Gender,Experience,Position,Selected");
        formats.put("finance", "Gender,Income,CreditScore,LoanApproved");
        formats.put("education", "Gender,TestScore,Extracurriculars,Admitted");
        formats.put("health", "Gender,Age,Symptoms,TreatmentGiven");
        formats.put("justice", "Ethnicity,Priors,BailAmount,Sentenced");
        formats.put("ecommerce", "UserGender,BrowsingHistory,PriceShown,Purchased");
        formats.put("social", "UserDemographic,ContentType,Visibility,Engagement");
        formats.put("industrial", "WorkerGender,Experience,SafetyIncidents,Promoted");
        
        String format = formats.getOrDefault(industry.toLowerCase(), 
            "Gender,Feature1,Feature2,Selected");
        
        Map<String, String> response = new HashMap<>();
        response.put("industry", industry);
        response.put("format", format);
        response.put("description", getIndustryDescription(industry));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * Simulate bias analysis (for demo purposes)
     */
    private Map<String, Object> simulateBiasAnalysis(String industry, long fileSize) {
        Map<String, Object> result = new HashMap<>();
        
        // Industry-specific base bias scores
        Map<String, Double> industryBases = new HashMap<>();
        industryBases.put("hiring", 25.0);
        industryBases.put("finance", 35.0);
        industryBases.put("education", 20.0);
        industryBases.put("health", 30.0);
        industryBases.put("justice", 40.0);
        industryBases.put("ecommerce", 15.0);
        industryBases.put("social", 22.0);
        industryBases.put("industrial", 28.0);
        
        double baseBias = industryBases.getOrDefault(industry.toLowerCase(), 25.0);
        double biasScore = baseBias + random.nextDouble() * 25; // Add randomness
        
        // Generate selection rates
        double maleRate = 30 + random.nextDouble() * 40;
        double femaleRate = 30 + random.nextDouble() * 40;
        double otherRate = 5 + random.nextDouble() * 15;
        
        // Calculate derived metrics
        double disparateImpact = Math.abs(maleRate - femaleRate);
        double statisticalParity = 100 - disparateImpact;
        
        // Determine status and risk level
        String status = getBiasStatus(biasScore);
        String riskLevel = getRiskLevel(biasScore);
        
        // Build result
        result.put("biasScore", Math.round(biasScore * 10.0) / 10.0);
        result.put("status", status);
        result.put("message", String.format("Analysis of %s data completed", industry));
        
        result.put("maleRate", Math.round(maleRate * 10.0) / 10.0);
        result.put("femaleRate", Math.round(femaleRate * 10.0) / 10.0);
        result.put("otherRate", Math.round(otherRate * 10.0) / 10.0);
        
        // Metrics
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("disparateImpact", Math.round(disparateImpact * 10.0) / 10.0);
        metrics.put("statisticalParity", Math.round(statisticalParity * 10.0) / 10.0);
        metrics.put("biasScore", Math.round(biasScore * 10.0) / 10.0);
        metrics.put("riskLevel", riskLevel);
        metrics.put("sampleSize", 100 + random.nextInt(900)); // Simulate sample size
        metrics.put("confidence", Math.round((95 - biasScore / 2) * 10.0) / 10.0);
        
        result.put("metrics", metrics);
        
        // Recommendations
        result.put("recommendations", getIndustryRecommendations(industry));
        
        return result;
    }
    
    private String getBiasStatus(double score) {
        if (score < 20) return "Low Bias";
        if (score < 40) return "Moderate Bias";
        if (score < 60) return "High Bias";
        return "Critical Bias";
    }
    
    private String getRiskLevel(double score) {
        if (score < 20) return "Low";
        if (score < 40) return "Medium";
        if (score < 60) return "High";
        return "Critical";
    }
    
    private String getIndustryDescription(String industry) {
        Map<String, String> descriptions = new HashMap<>();
        descriptions.put("hiring", "Analyzes gender bias in hiring decisions");
        descriptions.put("finance", "Detects bias in loan approvals and credit scoring");
        descriptions.put("education", "Identifies bias in admissions and grading");
        descriptions.put("health", "Analyzes bias in medical treatment recommendations");
        descriptions.put("justice", "Detects bias in bail amounts and sentencing");
        descriptions.put("ecommerce", "Identifies price discrimination and recommendation bias");
        descriptions.put("social", "Analyzes content visibility and engagement bias");
        descriptions.put("industrial", "Detects bias in promotions and safety evaluations");
        
        return descriptions.getOrDefault(industry.toLowerCase(), 
            "Analyzes bias in decision-making systems");
    }
    
    private String[] getIndustryRecommendations(String industry) {
        Map<String, String[]> recommendations = new HashMap<>();
        
        recommendations.put("hiring", new String[]{
            "Implement blind resume screening",
            "Standardize interview questions across all candidates",
            "Set diversity goals for hiring panels",
            "Regular bias audits of hiring algorithms",
            "Use structured interviews with scoring rubrics"
        });
        
        recommendations.put("finance", new String[]{
            "Remove ZIP code and neighborhood data from loan decisions",
            "Audit interest rate algorithms monthly for disparities",
            "Provide alternative credit scoring options",
            "Transparent loan approval criteria accessible to applicants",
            "Regular training on fair lending practices"
        });
        
        recommendations.put("education", new String[]{
            "Review admission criteria for socioeconomic bias",
            "Implement anonymous grading where possible",
            "Diversify curriculum examples and case studies",
            "Regular faculty bias training and workshops",
            "Monitor grade distributions across demographic groups"
        });
        
        recommendations.put("health", new String[]{
            "Standard treatment protocols for all demographics",
            "Regular bias audits of diagnostic algorithms",
            "Diverse representation in clinical trials",
            "Cultural competency training for medical staff",
            "Patient outcome monitoring by demographic"
        });
        
        // Default recommendations
        return recommendations.getOrDefault(industry.toLowerCase(), new String[]{
            "Review data collection methods for potential bias",
            "Implement regular bias audits of decision systems",
            "Diversify training datasets across demographic groups",
            "Transparent algorithmic decision-making processes",
            "Establish bias monitoring and response protocols"
        });
    }
}
