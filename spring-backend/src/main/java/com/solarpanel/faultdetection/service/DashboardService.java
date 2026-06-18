package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.DashboardStatsResponse;
import com.solarpanel.faultdetection.entity.Alert;
import com.solarpanel.faultdetection.entity.SolarPanel;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.AlertRepository;
import com.solarpanel.faultdetection.repository.SolarPanelRepository;
import com.solarpanel.faultdetection.repository.SolarPlantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardService {

    private final SolarPlantRepository plantRepository;
    private final SolarPanelRepository panelRepository;
    private final AlertRepository alertRepository;
    private final UserService userService;

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        Optional<User> cu = userService.getCurrentUser();
        boolean isAdmin = cu.isEmpty() || cu.get().getRole() == User.Role.ADMIN;
        Long userId = cu.map(User::getId).orElse(null);

        DashboardStatsResponse stats = new DashboardStatsResponse();

        if (isAdmin) {
            stats.setTotalPlants(plantRepository.count());
            stats.setTotalPanels(panelRepository.count());
            stats.setActivePanels(panelRepository.countByStatus(SolarPanel.PanelStatus.ACTIVE));
            stats.setMaintenancePanels(panelRepository.countByStatus(SolarPanel.PanelStatus.MAINTENANCE));
            stats.setOfflinePanels(panelRepository.countByStatus(SolarPanel.PanelStatus.OFFLINE));

            List<Alert> allAlerts = alertRepository.findAll();
            stats.setTotalAlerts((long) allAlerts.size());
            stats.setOpenAlerts(alertRepository.countByStatus(Alert.AlertStatus.OPEN));
            stats.setCriticalAlerts(alertRepository.countBySeverity("CRITICAL"));
            stats.setHighAlerts(alertRepository.countBySeverity("HIGH"));
            stats.setMediumAlerts(alertRepository.countBySeverity("MEDIUM"));
            stats.setLowAlerts(alertRepository.countBySeverity("LOW"));
            stats.setUnacknowledgedAlerts(alertRepository.countByAcknowledged(false));

            Map<String, Long> faultDist = allAlerts.stream()
                    .collect(Collectors.groupingBy(Alert::getFaultType, Collectors.counting()));
            stats.setFaultDistribution(faultDist);

            Map<String, Long> byStatus = new HashMap<>();
            byStatus.put("OPEN", alertRepository.countByStatus(Alert.AlertStatus.OPEN));
            byStatus.put("IN_PROGRESS", alertRepository.countByStatus(Alert.AlertStatus.IN_PROGRESS));
            byStatus.put("RESOLVED", alertRepository.countByStatus(Alert.AlertStatus.RESOLVED));
            stats.setAlertsByStatus(byStatus);
        } else {
            // Scoped to user's plants and panels
            List<SolarPanel> myPanels = panelRepository.findByPlantUserId(userId);
            Set<String> myPanelIds = myPanels.stream().map(SolarPanel::getPanelId).collect(Collectors.toSet());

            stats.setTotalPlants((long) plantRepository.findByUserId(userId).size());
            stats.setTotalPanels((long) myPanels.size());
            stats.setActivePanels(myPanels.stream().filter(p -> p.getStatus() == SolarPanel.PanelStatus.ACTIVE).count());
            stats.setMaintenancePanels(myPanels.stream().filter(p -> p.getStatus() == SolarPanel.PanelStatus.MAINTENANCE).count());
            stats.setOfflinePanels(myPanels.stream().filter(p -> p.getStatus() == SolarPanel.PanelStatus.OFFLINE).count());

            List<Alert> myAlerts = myPanelIds.isEmpty()
                    ? List.of()
                    : alertRepository.findByPanelIdIn(myPanelIds);
            stats.setTotalAlerts((long) myAlerts.size());
            stats.setOpenAlerts(myAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.OPEN).count());
            stats.setCriticalAlerts(myAlerts.stream().filter(a -> "CRITICAL".equals(a.getSeverity())).count());
            stats.setHighAlerts(myAlerts.stream().filter(a -> "HIGH".equals(a.getSeverity())).count());
            stats.setMediumAlerts(myAlerts.stream().filter(a -> "MEDIUM".equals(a.getSeverity())).count());
            stats.setLowAlerts(myAlerts.stream().filter(a -> "LOW".equals(a.getSeverity())).count());
            stats.setUnacknowledgedAlerts(myAlerts.stream().filter(a -> !a.getAcknowledged()).count());

            Map<String, Long> faultDist = myAlerts.stream()
                    .collect(Collectors.groupingBy(Alert::getFaultType, Collectors.counting()));
            stats.setFaultDistribution(faultDist);

            Map<String, Long> byStatus = new HashMap<>();
            byStatus.put("OPEN", myAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.OPEN).count());
            byStatus.put("IN_PROGRESS", myAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.IN_PROGRESS).count());
            byStatus.put("RESOLVED", myAlerts.stream().filter(a -> a.getStatus() == Alert.AlertStatus.RESOLVED).count());
            stats.setAlertsByStatus(byStatus);
        }

        return stats;
    }
}
