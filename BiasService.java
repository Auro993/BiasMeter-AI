package com.example.biasmeter.service;

import com.example.biasmeter.model.BiasResult;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BiasService {

    public BiasResult calculateBias(List<String[]> data) {

        int maleTotal = 0, maleSelected = 0;
        int femaleTotal = 0, femaleSelected = 0;

        for (String[] row : data) {
            String gender = row[0].trim();
            String decision = row[1].trim();

            if (gender.equalsIgnoreCase("Male")) {
                maleTotal++;
                if (decision.equalsIgnoreCase("Selected")) {
                    maleSelected++;
                }
            }

            if (gender.equalsIgnoreCase("Female")) {
                femaleTotal++;
                if (decision.equalsIgnoreCase("Selected")) {
                    femaleSelected++;
                }
            }
        }

        double maleRate = maleTotal == 0 ? 0 : (maleSelected * 100.0) / maleTotal;
        double femaleRate = femaleTotal == 0 ? 0 : (femaleSelected * 100.0) / femaleTotal;

        double biasScore = Math.abs(maleRate - femaleRate);

        String status = biasScore >= 20 ? "High Bias" : "Fair";
        String message = biasScore >= 20
                ? "System favors one group over another."
                : "No significant bias detected.";

        return new BiasResult(
                maleRate,
                femaleRate,
                biasScore,
                status,
                message
        );
    }
}
