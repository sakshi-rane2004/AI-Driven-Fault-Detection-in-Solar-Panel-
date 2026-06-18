package com.solarpanel.faultdetection.controller;

import com.solarpanel.faultdetection.dto.SolarPanelRequest;
import com.solarpanel.faultdetection.dto.SolarPanelResponse;
import com.solarpanel.faultdetection.service.SolarPanelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/panels")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SolarPanelController {
    
    private final SolarPanelService panelService;
    
    @PostMapping
    public ResponseEntity<SolarPanelResponse> createPanel(@Valid @RequestBody SolarPanelRequest request) {
        log.info("REST request to create solar panel: {}", request.getPanelId());
        SolarPanelResponse response = panelService.createPanel(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping
    public ResponseEntity<List<SolarPanelResponse>> getAllPanels() {
        log.info("REST request to get all solar panels");
        List<SolarPanelResponse> panels = panelService.getAllPanels();
        return ResponseEntity.ok(panels);
    }
    
    @GetMapping("/plant/{plantId}")
    public ResponseEntity<List<SolarPanelResponse>> getPanelsByPlant(@PathVariable Long plantId) {
        log.info("REST request to get panels for plant: {}", plantId);
        List<SolarPanelResponse> panels = panelService.getPanelsByPlant(plantId);
        return ResponseEntity.ok(panels);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SolarPanelResponse> getPanelById(@PathVariable Long id) {
        log.info("REST request to get solar panel: {}", id);
        SolarPanelResponse response = panelService.getPanelById(id);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<SolarPanelResponse> updatePanel(
            @PathVariable Long id,
            @Valid @RequestBody SolarPanelRequest request) {
        log.info("REST request to update solar panel: {}", id);
        SolarPanelResponse response = panelService.updatePanel(id, request);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePanel(@PathVariable Long id) {
        log.info("REST request to delete solar panel: {}", id);
        panelService.deletePanel(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/{id}/history")
    public ResponseEntity<?> getPanelHistory(@PathVariable Long id) {
        log.info("REST request to get history for panel: {}", id);
        return ResponseEntity.ok(panelService.getPanelHistory(id));
    }
}
