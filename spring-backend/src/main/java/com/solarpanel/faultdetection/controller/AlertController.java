package com.solarpanel.faultdetection.controller;

import com.solarpanel.faultdetection.dto.AlertResponse;
import com.solarpanel.faultdetection.entity.Alert;
import com.solarpanel.faultdetection.service.AlertService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/alerts")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AlertController {
    
    private final AlertService alertService;
    
    @GetMapping
    public ResponseEntity<List<AlertResponse>> getAllAlerts() {
        log.info("REST request to get all alerts");
        List<AlertResponse> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/unacknowledged")
    public ResponseEntity<List<AlertResponse>> getUnacknowledgedAlerts() {
        log.info("REST request to get unacknowledged alerts");
        List<AlertResponse> alerts = alertService.getUnacknowledgedAlerts();
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/panel/{panelId}")
    public ResponseEntity<List<AlertResponse>> getAlertsByPanel(@PathVariable String panelId) {
        log.info("REST request to get alerts for panel: {}", panelId);
        List<AlertResponse> alerts = alertService.getAlertsByPanel(panelId);
        return ResponseEntity.ok(alerts);
    }
    
    @GetMapping("/severity/{severity}")
    public ResponseEntity<List<AlertResponse>> getAlertsBySeverity(@PathVariable String severity) {
        log.info("REST request to get alerts by severity: {}", severity);
        List<AlertResponse> alerts = alertService.getAlertsBySeverity(severity);
        return ResponseEntity.ok(alerts);
    }
    
    @PostMapping("/{id}/acknowledge")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<AlertResponse> acknowledgeAlert(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        log.info("REST request to acknowledge alert: {}", id);
        AlertResponse response = alertService.acknowledgeAlert(id, userId);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats/unacknowledged-count")
    public ResponseEntity<Long> getUnacknowledgedCount() {
        log.info("REST request to get unacknowledged alert count");
        long count = alertService.getUnacknowledgedCount();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/stats/critical-count")
    public ResponseEntity<Long> getCriticalCount() {
        log.info("REST request to get critical alert count");
        long count = alertService.getCriticalCount();
        return ResponseEntity.ok(count);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<AlertResponse>> getAlertsByStatus(@PathVariable String status) {
        log.info("REST request to get alerts by status: {}", status);
        try {
            Alert.AlertStatus alertStatus = Alert.AlertStatus.valueOf(status.toUpperCase());
            List<AlertResponse> alerts = alertService.getAlertsByStatus(alertStatus);
            return ResponseEntity.ok(alerts);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<AlertResponse> updateAlertStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) Long userId) {
        log.info("REST request to update alert {} status to {}", id, status);
        try {
            Alert.AlertStatus alertStatus = Alert.AlertStatus.valueOf(status.toUpperCase());
            AlertResponse response = alertService.updateAlertStatus(id, alertStatus, userId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PutMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<AlertResponse> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        log.info("REST request to assign technician {} to alert {}", technicianId, id);
        AlertResponse response = alertService.assignTechnician(id, technicianId);
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<AlertResponse> addTechnicianNotes(
            @PathVariable Long id,
            @RequestBody String notes) {
        log.info("REST request to add notes to alert {}", id);
        AlertResponse response = alertService.addTechnicianNotes(id, notes);
        return ResponseEntity.ok(response);
    }
}
