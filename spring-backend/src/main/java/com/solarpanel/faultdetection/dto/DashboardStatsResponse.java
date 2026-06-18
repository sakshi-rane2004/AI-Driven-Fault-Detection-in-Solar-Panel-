package com.solarpanel.faultdetection.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalPlants;
    private Long totalPanels;
    private Long activePanels;
    private Long maintenancePanels;
    private Long offlinePanels;
    private Long totalAlerts;
    private Long openAlerts;
    private Long criticalAlerts;
    private Long highAlerts;
    private Long mediumAlerts;
    private Long lowAlerts;
    private Long unacknowledgedAlerts;
    private Map<String, Long> faultDistribution;
    private Map<String, Long> alertsByStatus;
}
