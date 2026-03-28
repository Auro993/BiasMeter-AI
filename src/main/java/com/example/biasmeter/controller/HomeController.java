package com.example.biasmeter.controller; 

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import javax.servlet.http.HttpSession;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(HttpSession session) {
        // Check if user is logged in
        Object user = session.getAttribute("user");
        if (user == null) {
            return "redirect:/login.html";
        }
        return "forward:/index.html";
    }
}
