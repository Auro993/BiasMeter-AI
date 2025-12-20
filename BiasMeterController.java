package com.example.biasmeter.controller;

import com.example.biasmeter.model.BiasResult;
import com.example.biasmeter.service.BiasService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/bias")
@CrossOrigin
public class BiasMeterController {

    @Autowired
    private BiasService biasService;

    @PostMapping("/check")
    public BiasResult checkBias(@RequestParam("file") MultipartFile file) {
        // Log that the frontend request has been received
        System.out.println("Request received from frontend");

        List<String[]> data = new ArrayList<>();

        try (BufferedReader br = new BufferedReader(new InputStreamReader(file.getInputStream()))) {

            String line;
            br.readLine(); // skip header

            while ((line = br.readLine()) != null) {
                String[] values = line.split(",");
                data.add(values);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        // Call the service to calculate bias
        BiasResult result = biasService.calculateBias(data);

        // Log the calculated bias
        System.out.println("Bias calculated: " + result.getBiasScore() + "%");

        return result;
    }
}
