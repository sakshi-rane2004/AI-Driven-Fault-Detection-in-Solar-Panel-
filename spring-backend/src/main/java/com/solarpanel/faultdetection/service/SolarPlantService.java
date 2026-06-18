package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.SolarPlantRequest;
import com.solarpanel.faultdetection.dto.SolarPlantResponse;
import com.solarpanel.faultdetection.entity.SolarPlant;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.SolarPanelRepository;
import com.solarpanel.faultdetection.repository.SolarPlantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolarPlantService {

    private final SolarPlantRepository plantRepository;
    private final SolarPanelRepository panelRepository;
    private final UserService userService;

    @Transactional
    public SolarPlantResponse createPlant(SolarPlantRequest request) {
        log.info("Creating new solar plant: {}", request.getName());

        SolarPlant plant = new SolarPlant();
        plant.setName(request.getName());
        plant.setLocation(request.getLocation());
        plant.setCapacityKW(request.getCapacityKW());

        // Attach to the current logged-in user (null for unauthenticated/admin-global)
        Optional<User> currentUser = userService.getCurrentUser();
        currentUser.ifPresent(u -> plant.setUserId(u.getId()));

        SolarPlant savedPlant = plantRepository.save(plant);
        log.info("Solar plant created with ID: {}, userId: {}", savedPlant.getId(), savedPlant.getUserId());
        return mapToResponse(savedPlant);
    }

    /**
     * Returns plants scoped to the current user.
     * ADMINs see all plants; other roles see only their own.
     */
    @Transactional(readOnly = true)
    public List<SolarPlantResponse> getAllPlants() {
        Optional<User> currentUser = userService.getCurrentUser();

        if (currentUser.isPresent()) {
            User u = currentUser.get();
            if (u.getRole() == User.Role.ADMIN) {
                // Admin sees everything
                return plantRepository.findAll().stream()
                        .map(this::mapToResponse).collect(Collectors.toList());
            } else {
                // Regular users see only their own plants
                return plantRepository.findByUserId(u.getId()).stream()
                        .map(this::mapToResponse).collect(Collectors.toList());
            }
        }
        // Unauthenticated — return all (shouldn't happen with JWT guard)
        return plantRepository.findAll().stream()
                .map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SolarPlantResponse getPlantById(Long id) {
        SolarPlant plant = plantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plant not found with ID: " + id));
        return mapToResponse(plant);
    }

    @Transactional
    public SolarPlantResponse updatePlant(Long id, SolarPlantRequest request) {
        SolarPlant plant = plantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plant not found with ID: " + id));
        plant.setName(request.getName());
        plant.setLocation(request.getLocation());
        plant.setCapacityKW(request.getCapacityKW());
        return mapToResponse(plantRepository.save(plant));
    }

    @Transactional
    public void deletePlant(Long id) {
        if (!plantRepository.existsById(id)) throw new RuntimeException("Plant not found with ID: " + id);
        plantRepository.deleteById(id);
    }

    private SolarPlantResponse mapToResponse(SolarPlant plant) {
        SolarPlantResponse response = new SolarPlantResponse();
        response.setId(plant.getId());
        response.setName(plant.getName());
        response.setLocation(plant.getLocation());
        response.setCapacityKW(plant.getCapacityKW());
        response.setCreatedAt(plant.getCreatedAt());
        response.setPanelCount(panelRepository.countByPlantId(plant.getId()));
        return response;
    }
}
