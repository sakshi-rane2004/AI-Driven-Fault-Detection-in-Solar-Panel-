package com.solarpanel.faultdetection.service;

import com.solarpanel.faultdetection.dto.AuthResponse;
import com.solarpanel.faultdetection.dto.LoginRequest;
import com.solarpanel.faultdetection.dto.PasswordStrengthResponse;
import com.solarpanel.faultdetection.dto.RegisterRequest;
import com.solarpanel.faultdetection.entity.User;
import com.solarpanel.faultdetection.repository.UserRepository;
import com.solarpanel.faultdetection.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class UserService implements UserDetailsService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    @Lazy
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private PasswordStrengthService passwordStrengthService;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsernameOrEmail(username, username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        return user;
    }
    
    /**
     * Register a new user
     */
    public AuthResponse registerUser(RegisterRequest registerRequest) {
        logger.info("Registering new user: {}", registerRequest.getUsername());
        
        // Allow VIEWER and TECHNICIAN roles for public registration
        // ADMIN accounts must still be created by an existing admin
        if (registerRequest.getRole() == User.Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be self-registered. Contact an existing administrator.");
        }
        
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }
        
        // Validate password strength
        PasswordStrengthResponse passwordStrength = passwordStrengthService.analyzePassword(registerRequest.getPassword());
        if (!passwordStrength.isAcceptable()) {
            throw new RuntimeException("Password does not meet security requirements: " + 
                String.join(", ", passwordStrength.getWarnings()));
        }
        
        // Create new user
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEnabled(true);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromUsername(savedUser.getUsername());
        LocalDateTime expiresAt = jwtUtils.getExpirationFromJwtToken(jwt);
        
        logger.info("User registered successfully: {}", savedUser.getUsername());
        
        return new AuthResponse(
            jwt,
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            expiresAt
        );
    }
    
    /**
     * Authenticate user and generate JWT token
     */
    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        logger.info("Authenticating user: {}", loginRequest.getUsername());
        
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getUsername(),
                loginRequest.getPassword()
            )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);
        LocalDateTime expiresAt = jwtUtils.getExpirationFromJwtToken(jwt);
        
        // Get user details
        User user = userRepository.findByUsernameOrEmail(loginRequest.getUsername(), loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Update last login time
        userRepository.updateLastLogin(user.getId(), LocalDateTime.now());
        
        logger.info("User authenticated successfully: {}", user.getUsername());
        
        return new AuthResponse(
            jwt,
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole(),
            user.getFirstName(),
            user.getLastName(),
            expiresAt
        );
    }
    
    /**
     * Create user by ADMIN (allows ADMIN role creation)
     */
    public AuthResponse createUserByAdmin(RegisterRequest registerRequest) {
        logger.info("Admin creating new user: {}", registerRequest.getUsername());
        
        // Verify current user is ADMIN
        Optional<User> currentUser = getCurrentUser();
        if (currentUser.isEmpty() || currentUser.get().getRole() != User.Role.ADMIN) {
            throw new RuntimeException("Only ADMINs can create users with ADMIN role");
        }
        
        // Set admin created flag to bypass role validation
        registerRequest.setAdminCreated(true);
        
        // Check if username already exists
        if (userRepository.existsByUsername(registerRequest.getUsername())) {
            throw new RuntimeException("Username is already taken!");
        }
        
        // Check if email already exists
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Email is already in use!");
        }
        
        // Validate password strength
        PasswordStrengthResponse passwordStrength = passwordStrengthService.analyzePassword(registerRequest.getPassword());
        if (!passwordStrength.isAcceptable()) {
            throw new RuntimeException("Password does not meet security requirements: " + 
                String.join(", ", passwordStrength.getWarnings()));
        }
        
        // Create new user (allows any role)
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setRole(registerRequest.getRole());
        user.setFirstName(registerRequest.getFirstName());
        user.setLastName(registerRequest.getLastName());
        user.setEnabled(true);
        
        User savedUser = userRepository.save(user);
        
        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromUsername(savedUser.getUsername());
        LocalDateTime expiresAt = jwtUtils.getExpirationFromJwtToken(jwt);
        
        logger.info("User created by admin successfully: {} with role: {}", savedUser.getUsername(), savedUser.getRole());
        
        return new AuthResponse(
            jwt,
            savedUser.getId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole(),
            savedUser.getFirstName(),
            savedUser.getLastName(),
            expiresAt
        );
    }
    
    /**
     * Check password strength
     */
    public PasswordStrengthResponse checkPasswordStrength(String password) {
        return passwordStrengthService.analyzePassword(password);
    }
    public Optional<User> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            
            String username = authentication.getName();
            return userRepository.findByUsername(username);
        }
        
        return Optional.empty();
    }
    
    /**
     * Get user by ID
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    /**
     * Get user by username
     */
    @Transactional(readOnly = true)
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    /**
     * Get all users
     */
    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    /**
     * Get users by role
     */
    @Transactional(readOnly = true)
    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRole(role);
    }
    
    /**
     * Update user enabled status
     */
    public void updateUserEnabledStatus(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setEnabled(enabled);
        userRepository.save(user);
        
        logger.info("User {} status updated to: {}", user.getUsername(), enabled ? "enabled" : "disabled");
    }
    
    /**
     * Change user password
     */
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Validate new password strength
        PasswordStrengthResponse passwordStrength = passwordStrengthService.analyzePassword(newPassword);
        if (!passwordStrength.isAcceptable()) {
            throw new RuntimeException("New password does not meet security requirements: " + 
                String.join(", ", passwordStrength.getWarnings()));
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        logger.info("Password changed for user: {}", user.getUsername());
    }
    
    /**
     * Get user statistics
     */
    @Transactional(readOnly = true)
    public List<Object[]> getUserStatistics() {
        return userRepository.countByRole();
    }
    
    /**
     * Get users with recent activity
     */
    @Transactional(readOnly = true)
    public List<User> getUsersWithRecentActivity(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return userRepository.findUsersWithRecentActivity(since);
    }
}