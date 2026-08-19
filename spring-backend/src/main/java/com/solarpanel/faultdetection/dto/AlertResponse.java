package com.solarpanel.faultdetection.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {
    private Long id;
    private String panelId;
    private String faultType;
    private String severity;
    private String message;
    private String confidence;
    private Double confidenceScore;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private Boolean acknowledged;
    private LocalDateTime acknowledgedAt;
    private Long acknowledgedBy;
    private String acknowledgedByName;
    private Long assignedTechnicianId;
    private String technicianNotes;
}
