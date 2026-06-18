package com.solarpanel.faultdetection.repository;

import com.solarpanel.faultdetection.entity.SolarPanel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolarPanelRepository extends JpaRepository<SolarPanel, Long> {
    Optional<SolarPanel> findByPanelId(String panelId);
    List<SolarPanel> findByPlantId(Long plantId);
    boolean existsByPanelId(String panelId);
    long countByPlantId(Long plantId);
    long countByStatus(SolarPanel.PanelStatus status);

    /** All panels belonging to plants owned by a specific user */
    @Query("SELECT p FROM SolarPanel p WHERE p.plant.userId = :userId")
    List<SolarPanel> findByPlantUserId(@Param("userId") Long userId);

    /** Count panels by status for a specific user's plants */
    @Query("SELECT COUNT(p) FROM SolarPanel p WHERE p.plant.userId = :userId AND p.status = :status")
    long countByPlantUserIdAndStatus(@Param("userId") Long userId, @Param("status") SolarPanel.PanelStatus status);
}
