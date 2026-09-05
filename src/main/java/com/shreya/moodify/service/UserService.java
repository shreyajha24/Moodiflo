package com.shreya.moodify.service;
import com.shreya.moodify.entity.User; import com.shreya.moodify.exception.ApiExceptions.NotFound; import com.shreya.moodify.repository.UserRepository; import org.springframework.stereotype.Service;
@Service public class UserService {private final UserRepository repo; public UserService(UserRepository r){repo=r;} public User byEmail(String e){return repo.findByEmailIgnoreCase(e).orElseThrow(()->new NotFound("User not found"));}}
