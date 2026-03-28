package com.example.biasmeter.controller; 

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import javax.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    // Store users in memory (in production, use database)
    private static final Map<String, String> users = new ConcurrentHashMap<>();
    private static final Map<String, Map<String, String>> userProfiles = new ConcurrentHashMap<>();
    
    static {
        // Pre-loaded demo users
        users.put("demo@biasmeter.ai", "demo123");
        users.put("admin@biasmeter.ai", "admin123");
        
        // Demo user profiles
        Map<String, String> demoProfile = new HashMap<>();
        demoProfile.put("email", "demo@biasmeter.ai");
        demoProfile.put("name", "Demo User");
        demoProfile.put("role", "user");
        demoProfile.put("company", "Demo Corp");
        userProfiles.put("demo@biasmeter.ai", demoProfile);
        
        Map<String, String> adminProfile = new HashMap<>();
        adminProfile.put("email", "admin@biasmeter.ai");
        adminProfile.put("name", "Admin User");
        adminProfile.put("role", "admin");
        adminProfile.put("company", "BiasMeter AI");
        userProfiles.put("admin@biasmeter.ai", adminProfile);
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @RequestBody Map<String, String> registrationData) {
        
        String email = registrationData.get("email");
        String password = registrationData.get("password");
        String name = registrationData.get("name");
        String company = registrationData.getOrDefault("company", "Personal"); // FIXED LINE
        
        Map<String, Object> response = new HashMap<>();
        
        // Validate input
        if (email == null || email.isEmpty() || !email.contains("@")) {
            response.put("success", false);
            response.put("message", "Valid email is required");
            return ResponseEntity.badRequest().body(response);
        }
        
        if (password == null || password.length() < 6) {
            response.put("success", false);
            response.put("message", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Check if user already exists
        if (users.containsKey(email)) {
            response.put("success", false);
            response.put("message", "User with this email already exists");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Create new user
        users.put(email, password);
        
        // Create user profile
        Map<String, String> profile = new HashMap<>();
        profile.put("email", email);
        profile.put("name", name != null ? name : "New User");
        profile.put("role", "user");
        profile.put("company", company);
        userProfiles.put(email, profile);
        
        response.put("success", true);
        response.put("message", "Account created successfully");
        response.put("user", profile);
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @RequestBody Map<String, String> credentials,
            HttpSession session) {
        
        String email = credentials.get("email");
        String password = credentials.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        // Check credentials
        if (users.containsKey(email) && users.get(email).equals(password)) {
            // Get user profile
            Map<String, String> userProfile = userProfiles.get(email);
            
            // Set user in session
            session.setAttribute("user", userProfile);
            session.setAttribute("authenticated", true);
            session.setMaxInactiveInterval(1800); // 30 minutes
            
            response.put("success", true);
            response.put("message", "Login successful");
            response.put("user", userProfile);
            response.put("redirect", "/");
            
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Invalid email or password");
            return ResponseEntity.status(401).body(response);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        session.invalidate();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkAuth(HttpSession session) {
        Object user = session.getAttribute("user");
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", user != null);
        response.put("user", user);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers() {
        Map<String, Object> response = new HashMap<>();
        response.put("totalUsers", users.size());
        response.put("userEmails", new HashMap<>(users).keySet());
        return ResponseEntity.ok(response);
    }
}
