package com.example.biasmeter.config; 

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http
            .authorizeRequests()
                // Allow access to all static resources and HTML files
                .antMatchers("/", "/index.html", "/css/**", "/js/**", "/images/**", 
                           "/analytics.html", "/compliance.html", "/developers.html", 
                           "/faq.html", "/learn.html", "/reports.html", "/dashboard.html").permitAll()
                // Allow API endpoints
                .antMatchers("/api/**").permitAll()
                // Require authentication for everything else
                .anyRequest().authenticated()
                .and()
            .formLogin()
                // Custom login page
                .loginPage("/login.html")
                .loginProcessingUrl("/api/auth/login")
                .defaultSuccessUrl("/dashboard.html", true)
                .failureUrl("/login.html?error=true")
                .permitAll()
                .and()
            .logout()
                .logoutUrl("/api/auth/logout")
                .logoutSuccessUrl("/")
                .permitAll()
                .and()
            // Disable CSRF for API testing (enable in production)
            .csrf().disable()
            // Enable CORS
            .cors();
    }

    @Bean
    @Override
    public UserDetailsService userDetailsService() {
        // Create demo users
        UserDetails user = User.builder()
            .username("demo@biasmeter.ai")
            .password(passwordEncoder().encode("demo123"))
            .roles("USER")
            .build();

        UserDetails admin = User.builder()
            .username("admin@biasmeter.ai")
            .password(passwordEncoder().encode("admin123"))
            .roles("ADMIN")
            .build();

        UserDetails smita = User.builder()
            .username("autosmitasahoo4@gmail.com")
            .password(passwordEncoder().encode("smita123"))
            .roles("ADMIN", "USER")
            .build();

        return new InMemoryUserDetailsManager(user, admin, smita);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
