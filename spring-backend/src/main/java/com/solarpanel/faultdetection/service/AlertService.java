package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.AlertResponse;
import com.solarpanel.faultdetection.entity.Alert;
import com.solarpanel.faultdetection.entity.SolarPanel;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.AlertRepository;
import com.solarpanel.faultdetection.repository.SolarPanelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final SolarPanelRepository panelRepository;
    private final UserService userService;

    private Collection<String> getUserPanelIds() {
        Optional<User> cu = userService.getCurrentUser();
        if (cu.isPresent() && cu.get().getRole() != User.Role.ADMIN) {
            return panelRepository.findByPlantUserId(cu.get().getId())
                    .stream().map(SolarPanel::getPanelId).collect(Collectors.toList());
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAllAlerts() {
        Collection<String> panelIds = getUserPanelIds();
        List<Alert> alerts = (panelIds != null)
                ? (panelIds.isEmpty() ? List.of() : alertRepository.findByPanelIdIn(panelIds))
                : alertRepository.findTop50ByOrderByCreatedAtDesc();
        return alerts.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getUnacknowledgedAlerts() {
        Collection<String> panelIds = getUserPanelIds();
        List<Alert> all = alertRepository.findByAcknowledged(false);
        if (panelIds != null) {
            final Collection<String> ids = panelIds;
            all = all.stream().filter(a -> ids.contains(a.getPanelId())).collect(Collectors.toList());
        }
        return all.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByPanel(String panelId) {
        return alertRepository.findByPanelId(panelId).stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsBySeverity(String severity) {
        Collection<String> panelIds = getUserPanelIds();
        List<Alert> all = alertRepository.findBySeverity(severity);
        if (panelIds != null) {
            final Collection<String> ids = panelIds;
            all = all.stream().filter(a -> ids.contains(a.getPanelId())).collect(Collectors.toList());
        }
        return all.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getAlertsByStatus(Alert.AlertStatus status) {
        Collection<String> panelIds = getUserPanelIds();
        List<Alert> all = alertRepository.findByStatus(status);
        if (panelIds != null) {
            final Collection<String> ids = panelIds;
            all = all.stream().filter(a -> ids.contains(a.getPanelId())).collect(Collectors.toList());
        }
        return all.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AlertResponse acknowledgeAlert(Long alertId, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
        alert.setAcknowledged(true);
        alert.setAcknowledgedAt(LocalDateTime.now());
        alert.setAcknowledgedBy(userId);
        return mapToResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse updateAlertStatus(Long alertId, Alert.AlertStatus status, Long userId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
        alert.setStatus(status);
        if (status == Alert.AlertStatus.RESOLVED) alert.setResolvedAt(LocalDateTime.now());
        return mapToResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse assignTechnician(Long alertId, Long technicianId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
        alert.setAssignedTechnicianId(technicianId);
        if (alert.getStatus() == Alert.AlertStatus.OPEN) alert.setStatus(Alert.AlertStatus.IN_PROGRESS);
        return mapToResponse(alertRepository.save(alert));
    }

    @Transactional
    public AlertResponse addTechnicianNotes(Long alertId, String notes) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found: " + alertId));
        alert.setTechnicianNotes(notes);
        return mapToResponse(alertRepository.save(alert));
    }

    @Transactional(readOnly = true)
    public long getUnacknowledgedCount() { return alertRepository.countByAcknowledged(false); }

    @Transactional(readOnly = true)
    public long getCriticalCount() { return alertRepository.countBySeverity("CRITICAL"); }

    private AlertResponse mapToResponse(Alert alert) {
        AlertResponse r = new AlertResponse();
        r.setId(alert.getId());
        r.setPanelId(alert.getPanelId());
        r.setFaultType(alert.getFaultType());
        r.setSeverity(alert.getSeverity());
        r.setMessage(alert.getMessage());
        r.setConfidence(alert.getConfidence());
        r.setConfidenceScore(alert.getConfidenceScore());
        r.setStatus(alert.getStatus().name());
        r.setCreatedAt(alert.getCreatedAt());
        r.setResolvedAt(alert.getResolvedAt());
        r.setAcknowledged(alert.getAcknowledged());
        r.setAcknowledgedAt(alert.getAcknowledgedAt());
        r.setAcknowledgedBy(alert.getAcknowledgedBy());
        r.setAssignedTechnicianId(alert.getAssignedTechnicianId());
        r.setTechnicianNotes(alert.getTechnicianNotes());
        return r;
    }
}
