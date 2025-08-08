package com.example.communityblog.dto;

import com.example.communityblog.model.User;
import lombok.Data;

@Data
public class LoginResponse {
    private User user;
    private String message;
}
