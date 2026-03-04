package com.example.biasmeter.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.*;

@RestController
@RequestMapping("/api/realtime")
public class RealTimeController {
    
    private double currentBias = 50.0;
    
    // Real-time streaming endpoint
    @GetMapping("/stream")
    public SseEmitter streamBiasData() {
        SseEmitter emitter = new SseEmitter(30_000L); // 30 seconds timeout
        
        ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
        
        // Send data every 2 seconds
        ScheduledFuture<?> future = scheduler.scheduleAtFixedRate(() -> {
            try {
                // Simulate changing bias score
                currentBias += (Math.random() - 0.5) * 10;
                if (currentBias < 0) currentBias = 0;
                if (currentBias > 100) currentBias = 100;
                
                // Create data packet
                Map<String, Object> data = Map.of(
                    "biasScore", Math.round(currentBias * 10) / 10.0,
                    "timestamp", System.currentTimeMillis(),
                    "alert", currentBias > 70 ? "🚨 HIGH BIAS DETECTED" : "Normal",
                    "dataPoints", (int)(Math.random() * 100) + 50
                );
                
                emitter.send(data);
            } catch (IOException e) {
                emitter.completeWithError(e);
                scheduler.shutdown();
            }
        }, 0, 2, TimeUnit.SECONDS);
        
        // Cleanup on completion
        emitter.onCompletion(() -> {
            future.cancel(true);
            scheduler.shutdown();
        });
        
        return emitter;
    }
    
    // Get current status
    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        return Map.of(
            "status", "ACTIVE",
            "monitoring", "Real-time bias detection",
            "lastUpdate", new java.util.Date(),
            "currentBias", currentBias
        );
    }
}