package com.example.biasmeter.model;

import java.util.Date;

public class RealTimeData {
    private double biasScore;
    private double maleRate;
    private double femaleRate;
    private String alertLevel;
    private Date timestamp;
    private int dataPoints;
    
    // Constructor, getters, setters
    public RealTimeData() {}
    
    public RealTimeData(double biasScore, double maleRate, double femaleRate) {
        this.biasScore = biasScore;
        this.maleRate = maleRate;
        this.femaleRate = femaleRate;
        this.timestamp = new Date();
        this.alertLevel = biasScore > 70 ? "HIGH" : biasScore > 40 ? "MEDIUM" : "LOW";
    }
    
    // Add all getters and setters here...
    public double getBiasScore() { return biasScore; }
    public void setBiasScore(double biasScore) { this.biasScore = biasScore; }
    public double getMaleRate() { return maleRate; }
    public void setMaleRate(double maleRate) { this.maleRate = maleRate; }
    public double getFemaleRate() { return femaleRate; }
    public void setFemaleRate(double femaleRate) { this.femaleRate = femaleRate; }
    public String getAlertLevel() { return alertLevel; }
    public void setAlertLevel(String alertLevel) { this.alertLevel = alertLevel; }
    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
    public int getDataPoints() { return dataPoints; }
    public void setDataPoints(int dataPoints) { this.dataPoints = dataPoints; }
}