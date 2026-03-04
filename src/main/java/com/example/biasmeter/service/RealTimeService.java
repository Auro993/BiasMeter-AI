package com.example.biasmeter.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RealTimeService {
    
    private final Map<String, List<Double>> biasHistory = new ConcurrentHashMap<>();
    private final List<String> alerts = new LinkedList<>();
    
    public Map<String, Object> getLiveMetrics() {
        // Simulate live metrics
        double currentBias = 50 + (Math.random() * 30);
        double maleRate = 70 + (Math.random() * 20);
        double femaleRate = 30 + (Math.random() * 20);
        
        return Map.of(
            "currentBias", Math.round(currentBias * 10) / 10.0,
            "maleRate", Math.round(maleRate * 10) / 10.0,
            "femaleRate", Math.round(femaleRate * 10) / 10.0,
            "disparity", Math.round(Math.abs(maleRate - femaleRate) * 10) / 10.0,
            "trend", currentBias > 60 ? "📈 Increasing" : "📉 Decreasing",
            "timestamp", new Date(),
            "activeAlerts", alerts.size()
        );
    }
    
    public void addAlert(String alertMessage) {
        alerts.add(0, new Date() + " - " + alertMessage);
        if (alerts.size() > 10) {
            alerts.remove(alerts.size() - 1);
        }
    }
    
    public List<String> getRecentAlerts() {
        return new ArrayList<>(alerts);
    }
}