package com.example.biasmeter.model;

public class BiasResult {

    private double maleRate;
    private double femaleRate;
    private double biasScore;
    private String status;
    private String message;

    public BiasResult(double maleRate, double femaleRate,
                      double biasScore, String status, String message) {
        this.maleRate = maleRate;
        this.femaleRate = femaleRate;
        this.biasScore = biasScore;
        this.status = status;
        this.message = message;
    }

    public double getMaleRate() {
        return maleRate;
    }

    public double getFemaleRate() {
        return femaleRate;
    }

    public double getBiasScore() {
        return biasScore;
    }

    public String getStatus() {
        return status;
    }

    public String getMessage() {
        return message;
    }
}
