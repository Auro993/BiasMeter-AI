package com.example.biasmeter.model;

import java.util.List;
import java.util.Map;

public class BiasResult {
    private double maleRate;
    private double femaleRate;
    private double biasScore;
    private String status;
    private String message;
    private Map<String, Double> metrics;
    private List<String> recommendations;
    
    // Constructors
    public BiasResult() {}
    
    public BiasResult(double maleRate, double femaleRate, double biasScore, 
                     String status, String message) {
        this.maleRate = maleRate;
        this.femaleRate = femaleRate;
        this.biasScore = biasScore;
        this.status = status;
        this.message = message;
    }
    
    public BiasResult(double maleRate, double femaleRate, double biasScore,
                     String status, String message, 
                     Map<String, Double> metrics, List<String> recommendations) {
        this.maleRate = maleRate;
        this.femaleRate = femaleRate;
        this.biasScore = biasScore;
        this.status = status;
        this.message = message;
        this.metrics = metrics;
        this.recommendations = recommendations;
    }
    
    // Getters and Setters
    public double getMaleRate() {
        return maleRate;
    }
    
    public void setMaleRate(double maleRate) {
        this.maleRate = maleRate;
    }
    
    public double getFemaleRate() {
        return femaleRate;
    }
    
    public void setFemaleRate(double femaleRate) {
        this.femaleRate = femaleRate;
    }
    
    public double getBiasScore() {
        return biasScore;
    }
    
    public void setBiasScore(double biasScore) {
        this.biasScore = biasScore;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Map<String, Double> getMetrics() {
        return metrics;
    }
    
    public void setMetrics(Map<String, Double> metrics) {
        this.metrics = metrics;
    }
    
    public List<String> getRecommendations() {
        return recommendations;
    }
    
    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}