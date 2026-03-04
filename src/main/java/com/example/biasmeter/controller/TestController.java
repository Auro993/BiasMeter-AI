package com.example.biasmeter.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {
    
    @GetMapping("/api/test")
    public Map<String, String> test() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "BiasMeter AI Server is running");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        response.put("version", "1.0.0");
        return response;
    }
    
    @GetMapping("/api/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "BiasMeter AI");
        response.put("timestamp", System.currentTimeMillis());
        response.put("java.version", System.getProperty("java.version"));
        return response;
    }
}