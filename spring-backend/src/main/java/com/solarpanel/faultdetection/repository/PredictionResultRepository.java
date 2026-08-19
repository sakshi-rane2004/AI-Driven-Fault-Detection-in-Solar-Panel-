package com.solarpanel.faultdetection.repository;

import com.solarpanel.faultdetection.entity.PredictionResult;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PredictionResultRepository extends JpaRepository<PredictionResult, Long> {
    
    /**
     * Find all predictions ordered by creation date (most recent first)
     */
    List<PredictionResult> findAllByOrderByCreatedAtDesc();

    List<PredictionResult> findByPanelIdInOrderByCreatedAtDesc(java.util.Collection<String> panelIds);

    @Query("SELECT p FROM PredictionResult p WHERE p.panelId IN :panelIds ORDER BY p.createdAt DESC")
    org.springframework.data.domain.Page<PredictionResult> findByPanelIdIn(
            @Param("panelIds") java.util.Collection<String> panelIds,
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p.predictedFault, COUNT(p) FROM PredictionResult p WHERE p.panelId IN :ids GROUP BY p.predictedFault")
    List<Object[]> countByFaultTypeForPanels(@Param("ids") java.util.Collection<String> ids);

    @Query("SELECT p.severity, COUNT(p) FROM PredictionResult p WHERE p.panelId IN :ids GROUP BY p.severity")
    List<Object[]> countBySeverityForPanels(@Param("ids") java.util.Collection<String> ids);

    @Query("SELECT p FROM PredictionResult p WHERE p.panelId IN :ids AND p.createdAt BETWEEN :start AND :end ORDER BY p.createdAt DESC")
    List<PredictionResult> findByPanelIdsAndDateRange(
            @Param("ids") java.util.Collection<String> ids,
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end);
    
    /**
     * Find predictions by fault type
     */
    List<PredictionResult> findByPredictedFaultOrderByCreatedAtDesc(String predictedFault);
    
    /**
     * Find predictions by severity level
     */
    List<PredictionResult> findBySeverityOrderByCreatedAtDesc(String severity);
    
    /**
     * Find predictions within a date range
     */
    List<PredictionResult> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Find predictions with confidence score above threshold
     */
    @Query("SELECT p FROM PredictionResult p WHERE p.confidenceScore >= :threshold ORDER BY p.createdAt DESC")
    List<PredictionResult> findByConfidenceScoreGreaterThanEqual(@Param("threshold") Double threshold);
    
    /**
     * Get paginated results ordered by creation date
     */
    Page<PredictionResult> findAllByOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * Count predictions by fault type
     */
    @Query("SELECT p.predictedFault, COUNT(p) FROM PredictionResult p GROUP BY p.predictedFault")
    List<Object[]> countByFaultType();
    
    /**
     * Count predictions by severity
     */
    @Query("SELECT p.severity, COUNT(p) FROM PredictionResult p GROUP BY p.severity")
    List<Object[]> countBySeverity();
    
    /**
     * Find recent predictions (last N hours)
     */
    @Query("SELECT p FROM PredictionResult p WHERE p.createdAt >= :since ORDER BY p.createdAt DESC")
    List<PredictionResult> findRecentPredictions(@Param("since") LocalDateTime since);
    
    /**
     * Find predictions by multiple criteria
     */
    @Query("SELECT p FROM PredictionResult p WHERE " +
           "(:faultType IS NULL OR p.predictedFault = :faultType) AND " +
           "(:severity IS NULL OR p.severity = :severity) AND " +
           "(:minConfidence IS NULL OR p.confidenceScore >= :minConfidence) " +
           "ORDER BY p.createdAt DESC")
    List<PredictionResult> findByCriteria(
            @Param("faultType") String faultType,
            @Param("severity") String severity,
            @Param("minConfidence") Double minConfidence);
}