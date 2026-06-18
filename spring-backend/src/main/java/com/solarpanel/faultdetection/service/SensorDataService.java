package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.PredictionResponse;
import com.solarpanel.faultdetection.dto.SensorDataDTO;
import com.solarpanel.faultdetection.dto.SensorDataRequest;
import com.solarpanel.faultdetection.entity.Alert;
import com.solarpanel.faultdetection.entity.SensorData;
import com.solarpanel.faultdetection.repository.AlertRepository;
import com.solarpanel.faultdetection.repository.SensorDataRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
public class SensorDataService {

    private final SensorDataRepository sensorDataRepository;
    private final AlertRepository alertRepository;
    private final PredictionService predictionService;

    // Self-inject via proxy so @Transactional(REQUIRES_NEW) is honoured on internal calls
    @Autowired
    @Lazy
    private SensorDataService self;

    public SensorDataService(SensorDataRepository sensorDataRepository,
                             AlertRepository alertRepository,
                             PredictionService predictionService) {
        this.sensorDataRepository = sensorDataRepository;
        this.alertRepository = alertRepository;
        this.predictionService = predictionService;
    }

    /**
     * Main entry point — no @Transactional here so each step manages its own transaction.
     */
    public PredictionResponse processSensorData(SensorDataDTO dto) {
        log.info("Processing sensor data for panel: {}", dto.getPanelId());

        // 1. Persist sensor data in its own committed transaction
        self.saveSensorData(dto);

        // 2. Build prediction request
        SensorDataRequest req = new SensorDataRequest();
        req.setVoltage(dto.getVoltage());
        req.setCurrent(dto.getCurrent());
        req.setTemperature(dto.getTemperature());
        req.setIrradiance(dto.getIrradiance());
        req.setPower(dto.getPower());

        // 3. Call ML API — degrade gracefully if unavailable
        PredictionResponse prediction;
        try {
            prediction = predictionService.analyzeSensorData(req);
            log.info("ML prediction: {} - {}", prediction.getPredictedFault(), prediction.getSeverity());
        } catch (Exception e) {
            log.warn("ML API unavailable — sensor data saved without prediction: {}", e.getMessage());
            PredictionResponse fallback = new PredictionResponse();
            fallback.setPredictedFault("UNKNOWN");
            fallback.setConfidence("LOW");
            fallback.setConfidenceScore(0.0);
            fallback.setSeverity("UNKNOWN");
            fallback.setDescription("ML API unavailable. Sensor data was saved successfully.");
            fallback.setMaintenanceRecommendation("Start the Python ML API (python api/app.py) to enable predictions.");
            fallback.setTimestamp(LocalDateTime.now());
            return fallback;
        }

        // 4. Generate alert if a fault was detected
        if (!"NORMAL".equals(prediction.getPredictedFault())) {
            self.saveAlert(dto.getPanelId(), prediction);
        }

        return prediction;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveSensorData(SensorDataDTO dto) {
        SensorData entity = new SensorData();
        entity.setPanelId(dto.getPanelId());
        entity.setVoltage(dto.getVoltage());
        entity.setCurrent(dto.getCurrent());
        entity.setTemperature(dto.getTemperature());
        entity.setIrradiance(dto.getIrradiance());
        entity.setPower(dto.getPower());
        entity.setTimestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now());
        sensorDataRepository.save(entity);
        log.info("Sensor data committed for panel: {}", dto.getPanelId());
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAlert(String panelId, PredictionResponse prediction) {
        log.info("Generating alert for panel {} — fault: {}", panelId, prediction.getPredictedFault());
        Alert alert = new Alert();
        alert.setPanelId(panelId);
        alert.setFaultType(prediction.getPredictedFault());
        alert.setSeverity(prediction.getSeverity());
        alert.setMessage(buildAlertMessage(prediction.getPredictedFault(), prediction.getSeverity()));
        alert.setConfidence(prediction.getConfidence());
        alert.setConfidenceScore(prediction.getConfidenceScore());
        alert.setCreatedAt(LocalDateTime.now());
        alert.setAcknowledged(false);
        alertRepository.save(alert);
        log.info("Alert saved for panel: {}", panelId);
    }

    private String buildAlertMessage(String faultType, String severity) {
        String s = "CRITICAL".equals(severity) ? "Critical" :
                   "HIGH".equals(severity)     ? "High"     :
                   "MEDIUM".equals(severity)   ? "Medium"   : "Low";
        switch (faultType) {
            case "INVERTER_FAULT":    return s + " severity inverter fault detected. Immediate inspection recommended.";
            case "PARTIAL_SHADING":   return s + " severity partial shading detected. Check for obstructions.";
            case "PANEL_DEGRADATION": return s + " severity panel degradation detected. Performance monitoring required.";
            case "DUST_ACCUMULATION": return s + " severity dust accumulation detected. Cleaning recommended.";
            default:                  return s + " severity fault detected in solar panel.";
        }
    }
}
