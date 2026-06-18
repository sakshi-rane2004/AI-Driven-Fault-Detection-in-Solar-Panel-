package com.solarpanel.faultdetection.repository;

import com.solarpanel.faultdetection.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    List<Alert> findByPanelId(String panelId);
    List<Alert> findByPanelIdIn(java.util.Collection<String> panelIds);
    List<Alert> findByAcknowledged(Boolean acknowledged);
    List<Alert> findBySeverity(String severity);
    List<Alert> findByStatus(Alert.AlertStatus status);
    List<Alert> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Alert> findTop50ByOrderByCreatedAtDesc();
    long countByAcknowledged(Boolean acknowledged);
    long countBySeverity(String severity);
    long countByStatus(Alert.AlertStatus status);
}
