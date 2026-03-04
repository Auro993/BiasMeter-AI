package com.example.biasmeter.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class CustomErrorController implements ErrorController {
    
    @RequestMapping("/error")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        Object message = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        Object exception = request.getAttribute(RequestDispatcher.ERROR_EXCEPTION);
        
        Map<String, Object> response = new HashMap<>();
        response.put("status", status != null ? status : "500");
        response.put("error", message != null ? message : "Internal Server Error");
        response.put("timestamp", System.currentTimeMillis());
        response.put("path", request.getRequestURI());
        
        // Add exception details for debugging
        if (exception != null) {
            response.put("exception", exception.getClass().getName());
            response.put("message", ((Exception) exception).getMessage());
        }
        
        HttpStatus httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        if (status != null) {
            try {
                httpStatus = HttpStatus.valueOf(Integer.parseInt(status.toString()));
            } catch (Exception e) {
                // Use default status
            }
        }
        
        return new ResponseEntity<>(response, httpStatus);
    }
}