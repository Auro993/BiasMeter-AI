package com.example.biasmeter.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AnalyticsController {
    
    /**
     * Serves the analytics page
     * Makes the URL /analytics instead of /analytics.html
     */
    @GetMapping("/analytics")
    public String analyticsPage() {
        return "forward:/analytics.html";
    }
    
    /**
     * Educational content page
     */
    @GetMapping("/learn")
    public String learnPage() {
        return "forward:/learn.html";
    }
    
    /**
     * Compliance guidelines page
     */
    @GetMapping("/compliance")
    public String compliancePage() {
        return "forward:/compliance.html";
    }
    
    /**
     * Developer documentation page
     */
    @GetMapping("/developers")
    public String developersPage() {
        return "forward:/developers.html";
    }
    
    /**
     * Industry reports page
     */
    @GetMapping("/reports")
    public String reportsPage() {
        return "forward:/reports.html";
    }
    
    /**
     * FAQ and support page
     */
    @GetMapping("/faq")
    public String faqPage() {
        return "forward:/faq.html";
    }
    
    /**
     * Optional: Real-time data API for analytics page
     * Uncomment if you want real data streaming
     */
    /*
    @GetMapping("/api/realtime/metrics")
    @ResponseBody
    public Map<String, Object> getRealtimeMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("timestamp", System.currentTimeMillis());
        metrics.put("fairnessScore", 85 + Math.random() * 15);
        metrics.put("maleRate", 40 + Math.random() * 30);
        metrics.put("femaleRate", 30 + Math.random() * 40);
        metrics.put("biasScore", 15 + Math.random() * 20);
        return metrics;
    }
    */
}