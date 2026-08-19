package com.solarpanel.faultdetection.controller;

import com.solarpanel.faultdetection.dto.SolarPlantRequest;
import com.solarpanel.faultdetection.dto.SolarPlantResponse;
import com.solarpanel.faultdetection.service.SolarPlantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plants")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SolarPlantController {
    
    private final SolarPlantService plantService;
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','VIEWER')")
    public ResponseEntity<SolarPlantResponse> createPlant(@Valid @RequestBody SolarPlantRequest request) {
        log.info("REST request to create solar plant: {}", request.getName());
        SolarPlantResponse response = plantService.createPlant(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<SolarPlantResponse>> getAllPlants() {
        log.info("REST request to get all solar plants");
        List<SolarPlantResponse> plants = plantService.getAllPlants();
        return ResponseEntity.ok(plants);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SolarPlantResponse> getPlantById(@PathVariable Long id) {
        log.info("REST request to get solar plant: {}", id);
        SolarPlantResponse response = plantService.getPlantById(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SolarPlantResponse> updatePlant(
            @PathVariable Long id,
            @Valid @RequestBody SolarPlantRequest request) {
        log.info("REST request to update solar plant: {}", id);
        SolarPlantResponse response = plantService.updatePlant(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlant(@PathVariable Long id) {
        log.info("REST request to delete solar plant: {}", id);
        plantService.deletePlant(id);
        return ResponseEntity.noContent().build();
    }
}
