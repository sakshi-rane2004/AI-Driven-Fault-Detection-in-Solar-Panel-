package com.solarpanel.faultdetection.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "prediction_results")
public class PredictionResult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "voltage", nullable = false)
    private Double voltage;
    
    @Column(name = "panel_id", length = 50)
    private String panelId;
    
    @Column(name = "current", nullable = false)
    private Double current;
    
    @Column(name = "temperature", nullable = false)
    private Double temperature;
    
    @Column(name = "irradiance", nullable = false)
    private Double irradiance;
    
    @Column(name = "power", nullable = false)
    private Double power;
    
    @Column(name = "predicted_fault", nullable = false, length = 50)
    private String predictedFault;
    
    @Column(name = "confidence", nullable = false, length = 20)
    private String confidence;
    
    @Column(name = "confidence_score", nullable = false)
    private Double confidenceScore;
    
    @Column(name = "severity", nullable = false, length = 30)
    private String severity;
    
    @Column(name = "maintenance_recommendation", columnDefinition = "TEXT")
    private String maintenanceRecommendation;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Default constructor
    public PredictionResult() {}
    
    // Constructor with all fields except id and createdAt
    public PredictionResult(Double voltage, Double current, Double temperature, 
                          Double irradiance, Double power, String predictedFault, 
                          String confidence, Double confidenceScore, String severity, 
                          String maintenanceRecommendation, String description) {
        this.voltage = voltage;
        this.current = current;
        this.temperature = temperature;
        this.irradiance = irradiance;
        this.power = power;
        this.predictedFault = predictedFault;
        this.confidence = confidence;
        this.confidenceScore = confidenceScore;
        this.severity = severity;
        this.maintenanceRecommendation = maintenanceRecommendation;
        this.description = description;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPanelId() { return panelId; }
    public void setPanelId(String panelId) { this.panelId = panelId; }
    
    public Double getVoltage() {
        return voltage;
    }
    
    public void setVoltage(Double voltage) {
        this.voltage = voltage;
    }
    
    public Double getCurrent() {
        return current;
    }
    
    public void setCurrent(Double current) {
        this.current = current;
    }
    
    public Double getTemperature() {
        return temperature;
    }
    
    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
    
    public Double getIrradiance() {
        return irradiance;
    }
    
    public void setIrradiance(Double irradiance) {
        this.irradiance = irradiance;
    }
    
    public Double getPower() {
        return power;
    }
    
    public void setPower(Double power) {
        this.power = power;
    }
    
    public String getPredictedFault() {
        return predictedFault;
    }
    
    public void setPredictedFault(String predictedFault) {
        this.predictedFault = predictedFault;
    }
    
    public String getConfidence() {
        return confidence;
    }
    
    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public String getSeverity() {
        return severity;
    }
    
    public void setSeverity(String severity) {
        this.severity = severity;
    }
    
    public String getMaintenanceRecommendation() {
        return maintenanceRecommendation;
    }
    
    public void setMaintenanceRecommendation(String maintenanceRecommendation) {
        this.maintenanceRecommendation = maintenanceRecommendation;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    @Override
    public String toString() {
        return "PredictionResult{" +
                "id=" + id +
                ", voltage=" + voltage +
                ", current=" + current +
                ", temperature=" + temperature +
                ", irradiance=" + irradiance +
                ", power=" + power +
                ", predictedFault='" + predictedFault + '\'' +
                ", confidence='" + confidence + '\'' +
                ", confidenceScore=" + confidenceScore +
                ", severity='" + severity + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}