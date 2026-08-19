package com.solarpanel.faultdetection.config;

import com.solarpanel.faultdetection.entity.SolarPlant;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.SolarPlantRepository;
import com.solarpanel.faultdetection.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SolarPlantRepository solarPlantRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeDefaultUsers();
        initializeDefaultPlants();
    }
    
    private void initializeDefaultUsers() {
        logger.info("Initializing default users...");

        // ── Migrate old demo_ usernames to clean names ──────────────────
        try {
            migrateUsername("demo_admin",      "admin");
            migrateUsername("demo_technician", "technician");
            migrateUsername("demo_viewer",     "viewer");
        } catch (Exception e) {
            logger.warn("Migration step failed: {}", e.getMessage());
        }
        
        try {
            // Create default admin user
            if (!userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@solarpanel.com");
                admin.setPassword(passwordEncoder.encode("Admin123!@#"));
                admin.setRole(User.Role.ADMIN);
                admin.setFirstName("System");
                admin.setLastName("Administrator");
                admin.setEnabled(true);
                
                userRepository.save(admin);
                logger.info("Created default admin user: admin");
            }
        } catch (Exception e) {
            logger.warn("Could not check/create admin user: {}", e.getMessage());
        }
        
        try {
            // Create default technician user
            if (!userRepository.existsByUsername("technician")) {
                User technician = new User();
                technician.setUsername("technician");
                technician.setEmail("technician@solarpanel.com");
                technician.setPassword(passwordEncoder.encode("Technician123!@#"));
                technician.setRole(User.Role.TECHNICIAN);
                technician.setFirstName("System");
                technician.setLastName("Technician");
                technician.setEnabled(true);
                
                userRepository.save(technician);
                logger.info("Created default technician user: technician");
            }
        } catch (Exception e) {
            logger.warn("Could not check/create technician user: {}", e.getMessage());
        }
        
        try {
            // Create default viewer user
            if (!userRepository.existsByUsername("viewer")) {
                User viewer = new User();
                viewer.setUsername("viewer");
                viewer.setEmail("viewer@solarpanel.com");
                viewer.setPassword(passwordEncoder.encode("Viewer123!@#"));
                viewer.setRole(User.Role.VIEWER);
                viewer.setFirstName("System");
                viewer.setLastName("Viewer");
                viewer.setEnabled(true);
                
                userRepository.save(viewer);
                logger.info("Created default viewer user: viewer");
            }
        } catch (Exception e) {
            logger.warn("Could not check/create viewer user: {}", e.getMessage());
        }
        
        try {
            if (!userRepository.existsByUsername("admin")) {
                User demoAdmin = new User();
                demoAdmin.setUsername("admin");
                demoAdmin.setEmail("demo.admin@solarpanel.com");
                demoAdmin.setPassword(passwordEncoder.encode("DemoAdmin123"));
                demoAdmin.setRole(User.Role.ADMIN);
                demoAdmin.setFirstName("Admin");
                demoAdmin.setLastName("User");
                demoAdmin.setEnabled(true);
                userRepository.save(demoAdmin);
                logger.info("Created admin user: admin");
            } else if (userRepository.existsByUsername("demo_admin")) {
                // rename demo_admin -> admin if admin doesn't exist but demo_admin does
                userRepository.findByUsername("demo_admin").ifPresent(u -> {
                    u.setUsername("admin");
                    userRepository.save(u);
                });
            }
        } catch (Exception e) {
            logger.warn("Could not check/create admin user: {}", e.getMessage());
        }

        try {
            if (!userRepository.existsByUsername("technician")) {
                User demoTech = new User();
                demoTech.setUsername("technician");
                demoTech.setEmail("demo.technician@solarpanel.com");
                demoTech.setPassword(passwordEncoder.encode("DemoTech123"));
                demoTech.setRole(User.Role.TECHNICIAN);
                demoTech.setFirstName("Technician");
                demoTech.setLastName("User");
                demoTech.setEnabled(true);
                userRepository.save(demoTech);
                logger.info("Created technician user: technician");
            }
        } catch (Exception e) {
            logger.warn("Could not check/create technician user: {}", e.getMessage());
        }

        try {
            if (!userRepository.existsByUsername("viewer")) {
                User demoViewer = new User();
                demoViewer.setUsername("viewer");
                demoViewer.setEmail("demo.viewer@solarpanel.com");
                demoViewer.setPassword(passwordEncoder.encode("DemoViewer123"));
                demoViewer.setRole(User.Role.VIEWER);
                demoViewer.setFirstName("Viewer");
                demoViewer.setLastName("User");
                demoViewer.setEnabled(true);
                
                userRepository.save(demoViewer);
                logger.info("Created viewer user: viewer");
            }
        } catch (Exception e) {
            logger.warn("Could not check/create viewer user: {}", e.getMessage());
        }
        
        logger.info("Default users initialization completed");
        
        try {
            // Log user statistics
            long totalUsers = userRepository.count();
            long adminCount = userRepository.findByRole(User.Role.ADMIN).size();
            long technicianCount = userRepository.findByRole(User.Role.TECHNICIAN).size();
            long viewerCount = userRepository.findByRole(User.Role.VIEWER).size();
            
            logger.info("User statistics - Total: {}, Admins: {}, Technicians: {}, Viewers: {}", 
                       totalUsers, adminCount, technicianCount, viewerCount);
        } catch (Exception e) {
            logger.warn("Could not get user statistics: {}", e.getMessage());
        }
    }
    
    /** Rename oldName → newName only if oldName exists and newName does NOT exist yet. */
    private void migrateUsername(String oldName, String newName) {
        if (userRepository.existsByUsername(oldName) && !userRepository.existsByUsername(newName)) {
            userRepository.findByUsername(oldName).ifPresent(u -> {
                u.setUsername(newName);
                userRepository.save(u);
                logger.info("Renamed user '{}' → '{}'", oldName, newName);
            });
        }
    }

    private void initializeDefaultPlants() {
        logger.info("Initializing default solar plants...");
        
        try {
            if (solarPlantRepository.count() == 0) {
                SolarPlant plant1 = new SolarPlant();
                plant1.setName("North Valley Solar Farm");
                plant1.setLocation("California, USA");
                plant1.setCapacityKW(500.0);
                solarPlantRepository.save(plant1);
                logger.info("Created solar plant: North Valley Solar Farm");
                
                SolarPlant plant2 = new SolarPlant();
                plant2.setName("Desert Sun Power Station");
                plant2.setLocation("Arizona, USA");
                plant2.setCapacityKW(750.0);
                solarPlantRepository.save(plant2);
                logger.info("Created solar plant: Desert Sun Power Station");
                
                SolarPlant plant3 = new SolarPlant();
                plant3.setName("Coastal Energy Park");
                plant3.setLocation("Florida, USA");
                plant3.setCapacityKW(300.0);
                solarPlantRepository.save(plant3);
                logger.info("Created solar plant: Coastal Energy Park");
                
                logger.info("Default solar plants initialization completed");
            } else {
                logger.info("Solar plants already exist, skipping initialization");
            }
        } catch (Exception e) {
            logger.warn("Could not initialize solar plants: {}", e.getMessage());
        }
    }
}