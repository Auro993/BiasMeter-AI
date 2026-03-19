package com.example.biasmeter.controller; 

import com.example.biasmeter.model.BiasResult;
import com.example.biasmeter.service.BiasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bias")
@CrossOrigin(origins = "*")
public class BiasMeterController {

    @Autowired
    private BiasService biasService;

    @PostMapping("/check")
    public BiasResult checkBias(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "industry", defaultValue = "hiring") String industry) {
        
        System.out.println("Request received for industry: " + industry);
        
        List<String[]> data = new ArrayList<>();
        
        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = br.readLine()) != null) {
                // Handle different delimiters
                String[] values = line.split("[,;|]");
                if (values.length >= 2) {
                    data.add(values);
                }
            }
            
            System.out.println("Data rows read: " + data.size());
            
        } catch (Exception e) {
            System.err.println("Error reading file: " + e.getMessage());
            e.printStackTrace();
            return createErrorResult("Error reading file: " + e.getMessage());
        }
        
        // Call service with industry parameter
        BiasResult result = biasService.calculateBias(data, industry);
        
        System.out.println("Analysis complete for " + industry);
        System.out.println("Bias Score: " + result.getBiasScore());
        System.out.println("Status: " + result.getStatus());
        
        return result;
    }
    
    private BiasResult createErrorResult(String errorMessage) {
        Map<String, Double> metrics = new HashMap<>();
        metrics.put("error", 100.0);
        
        List<String> recommendations = new ArrayList<>();
        recommendations.add("Check file format and try again");
        recommendations.add("Ensure CSV has correct columns");
        recommendations.add("Verify data integrity");
        
        return new BiasResult(
            0.0, 0.0, 100.0, 
            "Analysis Failed", 
            errorMessage,
            metrics,
            recommendations
        );
    }
}
