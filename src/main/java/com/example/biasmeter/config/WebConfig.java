package com.example.biasmeter.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            .allowedHeaders("*")
            .allowCredentials(false)
            .maxAge(3600);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Map URLs to your HTML files (clean URLs without .html)
        registry.addViewController("/").setViewName("forward:/index.html");
        registry.addViewController("/dashboard").setViewName("forward:/dashboard.html");
        registry.addViewController("/analytics").setViewName("forward:/analytics.html");
        registry.addViewController("/learn").setViewName("forward:/learn.html");
        registry.addViewController("/compliance").setViewName("forward:/compliance.html");
        registry.addViewController("/developers").setViewName("forward:/developers.html");
        registry.addViewController("/reports").setViewName("forward:/reports.html");
        registry.addViewController("/faq").setViewName("forward:/faq.html");
        registry.addViewController("/login").setViewName("forward:/login.html");
        
        // Add any other mappings you need
        registry.addViewController("/upload").setViewName("forward:/dashboard.html");
        registry.addViewController("/monitoring").setViewName("forward:/dashboard.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Explicitly map static resources
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .setCachePeriod(0);
    }
}