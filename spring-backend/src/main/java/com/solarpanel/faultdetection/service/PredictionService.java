package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.MLApiResponse;
import com.solarpanel.faultdetection.dto.PredictionResponse;
import com.solarpanel.faultdetection.dto.SensorDataRequest;
import com.solarpanel.faultdetection.entity.PredictionResult;
import com.solarpanel.faultdetection.entity.SolarPanel;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.PredictionResultRepository;
import com.solarpanel.faultdetection.repository.SolarPanelRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class PredictionService {
    
    private static final Logger logger = LoggerFactory.getLogger(PredictionService.class);
    
    @Autowired
    private PredictionResultRepository predictionRepository;
    
    @Autowired
    private MLApiService mlApiService;
    
    @Autowired
    private SeverityAssessmentService severityAssessmentService;

    @Autowired
    @Lazy
    private UserService userService;

    @Autowired
    private SolarPanelRepository solarPanelRepository;

    /**
     * Returns panel IDs for the current non-admin user, or null for admins (meaning show all).
     */
    private Collection<String> getUserPanelIds() {
        Optional<User> cu = userService.getCurrentUser();
        // ADMIN and TECHNICIAN see all data
        if (cu.isPresent()
                && cu.get().getRole() != User.Role.ADMIN
                && cu.get().getRole() != User.Role.TECHNICIAN) {
            return solarPanelRepository.findByPlantUserId(cu.get().getId())
                    .stream().map(SolarPanel::getPanelId).collect(Collectors.toList());
        }
        return null; // null = no filter = see everything
    }
    
    /**
     * Analyze sensor data and return prediction result (no panelId).
     */
    public PredictionResponse analyzeSensorData(SensorDataRequest sensorData) {
        return analyzeSensorData(sensorData, null);
    }

    /**
     * Analyze sensor data and return prediction result, associating the result with the given panelId.
     */
    public PredictionResponse analyzeSensorData(SensorDataRequest sensorData, String panelId) {
        logger.info("Starting analysis for sensor data: {}", sensorData);
        
        try {
            // Call ML API for prediction
            MLApiResponse mlResponse = mlApiService.predictFault(sensorData);
            
            // Create and save prediction result
            PredictionResult predictionResult = createPredictionResult(sensorData, mlResponse);
            predictionResult.setPanelId(panelId);
            PredictionResult savedResult = predictionRepository.save(predictionResult);
            
            logger.info("Prediction result saved with ID: {}", savedResult.getId());
            
            // Convert to response DTO
            PredictionResponse response = convertToResponse(savedResult, mlResponse);
            
            return response;
            
        } catch (Exception e) {
            logger.error("Error during sensor data analysis: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to analyze sensor data: " + e.getMessage());
        }
    }
    
    /**
     * Get all prediction history
     */
    @Transactional(readOnly = true)
    public List<PredictionResponse> getAllPredictions() {
        logger.info("Retrieving all prediction history");

        Collection<String> panelIds = getUserPanelIds();
        List<PredictionResult> results;
        if (panelIds != null) {
            results = panelIds.isEmpty() ? List.of()
                    : predictionRepository.findByPanelIdInOrderByCreatedAtDesc(panelIds);
        } else {
            results = predictionRepository.findAllByOrderByCreatedAtDesc();
        }
        
        return results.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get paginated prediction history
     */
    @Transactional(readOnly = true)
    public Page<PredictionResponse> getPaginatedPredictions(int page, int size) {
        logger.info("Retrieving paginated predictions - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Collection<String> panelIds = getUserPanelIds();
        Page<PredictionResult> results;
        if (panelIds != null) {
            results = panelIds.isEmpty() ? Page.empty(pageable)
                    : predictionRepository.findByPanelIdIn(panelIds, pageable);
        } else {
            results = predictionRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        
        return results.map(this::convertToResponse);
    }
    
    /**
     * Get predictions by fault type
     */
    @Transactional(readOnly = true)
    public List<PredictionResponse> getPredictionsByFaultType(String faultType) {
        logger.info("Retrieving predictions for fault type: {}", faultType);

        Collection<String> panelIds = getUserPanelIds();
        List<PredictionResult> results = predictionRepository.findByPredictedFaultOrderByCreatedAtDesc(faultType);
        if (panelIds != null) {
            final Collection<String> ids = panelIds;
            results = results.stream()
                    .filter(p -> ids.contains(p.getPanelId()))
                    .collect(Collectors.toList());
        }
        
        return results.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get predictions by severity
     */
    @Transactional(readOnly = true)
    public List<PredictionResponse> getPredictionsBySeverity(String severity) {
        logger.info("Retrieving predictions for severity: {}", severity);

        Collection<String> panelIds = getUserPanelIds();
        List<PredictionResult> results = predictionRepository.findBySeverityOrderByCreatedAtDesc(severity);
        if (panelIds != null) {
            final Collection<String> ids = panelIds;
            results = results.stream()
                    .filter(p -> ids.contains(p.getPanelId()))
                    .collect(Collectors.toList());
        }
        
        return results.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get recent predictions (last 24 hours)
     */
    @Transactional(readOnly = true)
    public List<PredictionResponse> getRecentPredictions() {
        logger.info("Retrieving recent predictions (last 24 hours)");
        
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<PredictionResult> results = predictionRepository.findRecentPredictions(since);
        
        return results.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get prediction by ID
     */
    @Transactional(readOnly = true)
    public Optional<PredictionResponse> getPredictionById(Long id) {
        logger.info("Retrieving prediction with ID: {}", id);
        
        return predictionRepository.findById(id)
                .map(this::convertToResponse);
    }
    
    /**
     * Get fault type statistics
     */
    @Transactional(readOnly = true)
    public List<Object[]> getFaultTypeStatistics() {
        logger.info("Retrieving fault type statistics");
        
        return predictionRepository.countByFaultType();
    }
    
    /**
     * Create PredictionResult entity from sensor data and ML response
     */
    private PredictionResult createPredictionResult(SensorDataRequest sensorData, MLApiResponse mlResponse) {
        // Assess severity using our enhanced logic
        String assessedSeverity = severityAssessmentService.assessSeverity(
            mlResponse.getPredictedFault(), 
            sensorData, 
            mlResponse.getConfidenceScore()
        );
        
        // Get enhanced maintenance recommendation
        String enhancedRecommendation = severityAssessmentService.getMaintenanceRecommendation(
            mlResponse.getPredictedFault(), 
            assessedSeverity
        );
        
        return new PredictionResult(
                sensorData.getVoltage(),
                sensorData.getCurrent(),
                sensorData.getTemperature(),
                sensorData.getIrradiance(),
                sensorData.getPower(),
                mlResponse.getPredictedFault(),
                mlResponse.getConfidence(),
                mlResponse.getConfidenceScore(),
                assessedSeverity, // Use our assessed severity
                enhancedRecommendation, // Use our enhanced recommendation
                mlResponse.getDescription()
        );
    }
    
    /**
     * Convert PredictionResult entity to PredictionResponse DTO
     */
    private PredictionResponse convertToResponse(PredictionResult result) {
        PredictionResponse response = new PredictionResponse();
        response.setId(result.getId());
        response.setPredictedFault(result.getPredictedFault());
        response.setConfidence(result.getConfidence());
        response.setConfidenceScore(result.getConfidenceScore());
        response.setSeverity(result.getSeverity());
        response.setDescription(result.getDescription());
        response.setMaintenanceRecommendation(result.getMaintenanceRecommendation());
        response.setTimestamp(result.getCreatedAt());

        // Always populate inputValues from stored entity columns
        Map<String, Object> inputValues = new HashMap<>();
        inputValues.put("voltage",     result.getVoltage());
        inputValues.put("current",     result.getCurrent());
        inputValues.put("temperature", result.getTemperature());
        inputValues.put("irradiance",  result.getIrradiance());
        inputValues.put("power",       result.getPower());
        response.setInputValues(inputValues);

        return response;
    }
    
    /**
     * Convert PredictionResult entity to PredictionResponse DTO with ML response data
     */
    private PredictionResponse convertToResponse(PredictionResult result, MLApiResponse mlResponse) {
        PredictionResponse response = convertToResponse(result);
        response.setInputValues(mlResponse.getInputValues());
        response.setAllProbabilities(mlResponse.getAllProbabilities());
        
        return response;
    }
}