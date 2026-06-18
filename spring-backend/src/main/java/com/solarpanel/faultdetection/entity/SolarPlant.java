package com.solarpanel.faultdetection.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solar_plants")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolarPlant {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String location;
    
    @Column(nullable = false)
    private Double capacityKW;
    
    @Column
    private Long userId;   // owner — null means shared/admin-created

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "plant", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SolarPanel> panels = new ArrayList<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
