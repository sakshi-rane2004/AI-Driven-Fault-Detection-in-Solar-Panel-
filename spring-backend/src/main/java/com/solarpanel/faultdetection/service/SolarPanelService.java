package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.SolarPanelRequest;
import com.solarpanel.faultdetection.dto.SolarPanelResponse;
import com.solarpanel.faultdetection.entity.Alert;
import com.solarpanel.faultdetection.entity.SensorData;
import com.solarpanel.faultdetection.entity.SolarPanel;
import com.solarpanel.faultdetection.entity.SolarPlant;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.AlertRepository;
import com.solarpanel.faultdetection.repository.SensorDataRepository;
import com.solarpanel.faultdetection.repository.SolarPanelRepository;
import com.solarpanel.faultdetection.repository.SolarPlantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolarPanelService {

    private final SolarPanelRepository panelRepository;
    private final SolarPlantRepository plantRepository;
    private final SensorDataRepository sensorDataRepository;
    private final AlertRepository alertRepository;
    private final UserService userService;

    @Transactional
    public SolarPanelResponse createPanel(SolarPanelRequest request) {
        if (panelRepository.existsByPanelId(request.getPanelId()))
            throw new RuntimeException("Panel with ID '" + request.getPanelId() + "' already exists");
        SolarPlant plant = plantRepository.findById(request.getPlantId())
                .orElseThrow(() -> new RuntimeException("Plant not found: " + request.getPlantId()));
        SolarPanel panel = new SolarPanel();
        panel.setPanelId(request.getPanelId());
        panel.setPlant(plant);
        panel.setInstallationDate(request.getInstallationDate());
        panel.setCapacity(request.getCapacity());
        panel.setStatus(request.getStatus() != null ? request.getStatus() : SolarPanel.PanelStatus.ACTIVE);
        panel.setAssignedTechnicianId(request.getAssignedTechnicianId());
        return mapToResponse(panelRepository.save(panel));
    }

    /** ADMINs see all panels; other users see only panels from their own plants. */
    @Transactional(readOnly = true)
    public List<SolarPanelResponse> getAllPanels() {
        Optional<User> cu = userService.getCurrentUser();
        List<SolarPanel> panels;
        if (cu.isPresent()
                && cu.get().getRole() != User.Role.ADMIN
                && cu.get().getRole() != User.Role.TECHNICIAN) {
            // Viewer: only see their own plants' panels
            panels = panelRepository.findByPlantUserId(cu.get().getId());
        } else {
            // Admin and Technician: see all panels
            panels = panelRepository.findAll();
        }
        return panels.stream()
                .sorted((a, b) -> a.getId().compareTo(b.getId()))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SolarPanelResponse> getPanelsByPlant(Long plantId) {
        return panelRepository.findByPlantId(plantId).stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SolarPanelResponse getPanelById(Long id) {
        return mapToResponse(panelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Panel not found: " + id)));
    }

    @Transactional
    public SolarPanelResponse updatePanel(Long id, SolarPanelRequest request) {
        SolarPanel panel = panelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Panel not found: " + id));
        if (!panel.getPanelId().equals(request.getPanelId()) && panelRepository.existsByPanelId(request.getPanelId()))
            throw new RuntimeException("Panel ID '" + request.getPanelId() + "' already exists");
        SolarPlant plant = plantRepository.findById(request.getPlantId())
                .orElseThrow(() -> new RuntimeException("Plant not found: " + request.getPlantId()));
        panel.setPanelId(request.getPanelId());
        panel.setPlant(plant);
        panel.setInstallationDate(request.getInstallationDate());
        panel.setCapacity(request.getCapacity());
        panel.setStatus(request.getStatus() != null ? request.getStatus() : panel.getStatus());
        panel.setAssignedTechnicianId(request.getAssignedTechnicianId());
        return mapToResponse(panelRepository.save(panel));
    }

    @Transactional
    public void deletePanel(Long id) {
        if (!panelRepository.existsById(id)) throw new RuntimeException("Panel not found: " + id);
        panelRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPanelHistory(Long id) {
        SolarPanel panel = panelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Panel not found: " + id));
        List<SensorData> sensorData = sensorDataRepository.findByPanelId(panel.getPanelId());
        sensorData.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        List<Alert> alerts = alertRepository.findByPanelId(panel.getPanelId());
        alerts.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        Map<String, Object> history = new HashMap<>();
        history.put("panel", mapToResponse(panel));
        history.put("sensorData", sensorData);
        history.put("alerts", alerts);
        return history;
    }

    private SolarPanelResponse mapToResponse(SolarPanel panel) {
        SolarPanelResponse r = new SolarPanelResponse();
        r.setId(panel.getId());
        r.setPanelId(panel.getPanelId());
        r.setPlantId(panel.getPlant().getId());
        r.setPlantName(panel.getPlant().getName());
        r.setInstallationDate(panel.getInstallationDate());
        r.setCapacity(panel.getCapacity());
        r.setStatus(panel.getStatus());
        r.setAssignedTechnicianId(panel.getAssignedTechnicianId());
        return r;
    }
}
