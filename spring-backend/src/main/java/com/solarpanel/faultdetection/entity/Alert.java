package com.solarpanel.faultdetection.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String panelId;
    
    @Column(nullable = false)
    private String faultType;
    
    @Column(nullable = false)
    private String severity;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @Column(nullable = false)
    private String confidence;
    
    @Column
    private Double confidenceScore;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlertStatus status = AlertStatus.OPEN;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime resolvedAt;
    
    @Column(nullable = false)
    private Boolean acknowledged = false;
    
    @Column
    private LocalDateTime acknowledgedAt;
    
    @Column
    private Long acknowledgedBy;

    @Column(length = 150)
    private String acknowledgedByName;
    
    @Column
    private Long assignedTechnicianId;
    
    @Column(length = 2000)
    private String technicianNotes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prediction_id")
    private PredictionResult prediction;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    
    public enum AlertStatus {
        OPEN,
        IN_PROGRESS,
        RESOLVED
    }
}
