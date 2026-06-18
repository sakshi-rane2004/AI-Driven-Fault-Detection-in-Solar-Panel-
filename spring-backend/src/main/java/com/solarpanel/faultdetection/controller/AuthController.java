package com.solarpanel.faultdetection.controller;

import com.solarpanel.faultdetection.dto.*;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.service.PasswordStrengthService;
import com.solarpanel.faultdetection.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PasswordStrengthService passwordStrengthService;
    
    /**
     * Get all users (admin only)
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            Optional<User> currentUser = userService.getCurrentUser();
            if (currentUser.isEmpty() || currentUser.get().getRole() != User.Role.ADMIN) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Admin access required"));
            }
            java.util.List<User> users = userService.getAllUsers();
            java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
            for (User u : users) {
                Map<String, Object> m = new HashMap<>();
                m.put("id", u.getId());
                m.put("username", u.getUsername());
                m.put("email", u.getEmail());
                m.put("firstName", u.getFirstName());
                m.put("lastName", u.getLastName());
                m.put("role", u.getRole());
                m.put("enabled", u.getEnabled());
                result.add(m);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * User login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest,
                                  BindingResult bindingResult) {
        logger.info("Login attempt for user: {}", loginRequest.getUsername());
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation failed",
                "details", errors
            ));
        }
        
        try {
            AuthResponse authResponse = userService.authenticateUser(loginRequest);
            logger.info("User logged in successfully: {}", loginRequest.getUsername());
            
            return ResponseEntity.ok(authResponse);
            
        } catch (Exception e) {
            logger.error("Login failed for user {}: {}", loginRequest.getUsername(), e.getMessage());
            
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "error", "Authentication failed",
                "message", "Invalid username or password"
            ));
        }
    }
    
    /**
     * User registration
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest,
                                    BindingResult bindingResult) {
        logger.info("Registration attempt for user: {}", registerRequest.getUsername());
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation failed",
                "details", errors
            ));
        }
        
        try {
            AuthResponse authResponse = userService.registerUser(registerRequest);
            logger.info("User registered successfully: {}", registerRequest.getUsername());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
            
        } catch (Exception e) {
            logger.error("Registration failed for user {}: {}", registerRequest.getUsername(), e.getMessage());
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Registration failed",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Admin user creation (allows ADMIN role)
     */
    @PostMapping("/admin/create-user")
    public ResponseEntity<?> createUserByAdmin(@Valid @RequestBody RegisterRequest registerRequest,
                                             BindingResult bindingResult) {
        logger.info("Admin creating user: {}", registerRequest.getUsername());
        
        // Check for validation errors
        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> 
                errors.put(error.getField(), error.getDefaultMessage())
            );
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Validation failed",
                "details", errors
            ));
        }
        
        try {
            AuthResponse authResponse = userService.createUserByAdmin(registerRequest);
            logger.info("User created by admin successfully: {}", registerRequest.getUsername());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(authResponse);
            
        } catch (Exception e) {
            logger.error("Admin user creation failed for user {}: {}", registerRequest.getUsername(), e.getMessage());
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "User creation failed",
                "message", e.getMessage()
            ));
        }
    }
    @PostMapping("/check-password")
    public ResponseEntity<PasswordStrengthResponse> checkPasswordStrength(@RequestBody Map<String, String> request) {
        String password = request.get("password");
        
        if (password == null) {
            return ResponseEntity.badRequest().body(
                new PasswordStrengthResponse(
                    PasswordStrengthResponse.StrengthLevel.VERY_WEAK,
                    0,
                    List.of("Password is required"),
                    List.of("Password cannot be empty"),
                    false
                )
            );
        }
        
        PasswordStrengthResponse response = passwordStrengthService.analyzePassword(password);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Check password strength
     */
    @GetMapping("/password-requirements")
    public ResponseEntity<Map<String, Object>> getPasswordRequirements() {
        List<String> requirements = passwordStrengthService.getPasswordRequirements();
        
        return ResponseEntity.ok(Map.of(
            "requirements", requirements,
            "minLength", 8,
            "recommendedLength", 12
        ));
    }
    
    /**
     * Get password requirements
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        try {
            Optional<User> currentUser = userService.getCurrentUser();
            
            if (currentUser.isPresent()) {
                User user = currentUser.get();
                
                Map<String, Object> profile = new HashMap<>();
                profile.put("id", user.getId());
                profile.put("username", user.getUsername());
                profile.put("email", user.getEmail());
                profile.put("role", user.getRole());
                profile.put("firstName", user.getFirstName());
                profile.put("lastName", user.getLastName());
                profile.put("enabled", user.getEnabled());
                profile.put("createdAt", user.getCreatedAt());
                profile.put("lastLogin", user.getLastLogin());
                
                return ResponseEntity.ok(profile);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "User not authenticated"
                ));
            }
            
        } catch (Exception e) {
            logger.error("Error getting user profile: {}", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "error", "Failed to get user profile",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Change password
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            Optional<User> currentUser = userService.getCurrentUser();
            
            if (currentUser.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "error", "User not authenticated"
                ));
            }
            
            String currentPassword = request.get("currentPassword");
            String newPassword = request.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Current password and new password are required"
                ));
            }
            
            userService.changePassword(currentUser.get().getId(), currentPassword, newPassword);
            
            return ResponseEntity.ok(Map.of(
                "message", "Password changed successfully"
            ));
            
        } catch (Exception e) {
            logger.error("Error changing password: {}", e.getMessage());
            
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Failed to change password",
                "message", e.getMessage()
            ));
        }
    }
    
    /**
     * Logout (client-side token removal)
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // JWT tokens are stateless, so logout is handled client-side by removing the token
        // This endpoint is mainly for consistency and potential future server-side token blacklisting
        
        return ResponseEntity.ok(Map.of(
            "message", "Logged out successfully"
        ));
    }
    
    /**
     * Validate token (for client-side token validation)
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken() {
        try {
            Optional<User> currentUser = userService.getCurrentUser();
            
            if (currentUser.isPresent()) {
                User user = currentUser.get();
                
                return ResponseEntity.ok(Map.of(
                    "valid", true,
                    "username", user.getUsername(),
                    "role", user.getRole(),
                    "message", "Token is valid"
                ));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "valid", false,
                    "message", "Token is invalid or expired"
                ));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "valid", false,
                "message", "Token validation failed"
            ));
        }
    }
}