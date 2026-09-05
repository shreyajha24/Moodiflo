package com.shreya.moodify.exception;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException e, WebRequest r) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .map(x -> x.getField() + ": " + x.getDefaultMessage())
                .findFirst()
                .orElse("Invalid request");
        return body(400, "VALIDATION_ERROR", msg, r);
    }

    @ExceptionHandler({ApiExceptions.NotFound.class, org.springframework.web.servlet.resource.NoResourceFoundException.class})
    public ResponseEntity<Map<String, Object>> notFound(Exception e, WebRequest r) {
        return body(404, "NOT_FOUND", e.getMessage(), r);
    }

    @ExceptionHandler(org.springframework.web.HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> methodNotSupported(org.springframework.web.HttpRequestMethodNotSupportedException e, WebRequest r) {
        return body(405, "METHOD_NOT_ALLOWED", e.getMessage(), r);
    }

    @ExceptionHandler({ApiExceptions.BadRequest.class, IllegalArgumentException.class})
    public ResponseEntity<Map<String, Object>> badRequest(RuntimeException e, WebRequest r) {
        return body(400, "BAD_REQUEST", e.getMessage(), r);
    }

    @ExceptionHandler({ApiExceptions.Forbidden.class, AccessDeniedException.class})
    public ResponseEntity<Map<String, Object>> forbidden(Exception e, WebRequest r) {
        return body(403, "FORBIDDEN", e.getMessage() != null ? e.getMessage() : "Access is denied", r);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> unauthorized(AuthenticationException e, WebRequest r) {
        return body(401, "UNAUTHORIZED", e.getMessage() != null ? e.getMessage() : "Full authentication is required", r);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> internalError(Exception e, WebRequest r) {
        return body(500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred: " + e.getMessage(), r);
    }

    private ResponseEntity<Map<String, Object>> body(int status, String code, String msg, WebRequest r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("timestamp", Instant.now().toString());
        map.put("status", status);
        map.put("error", code);
        map.put("message", msg);
        map.put("path", r.getDescription(false).replace("uri=", ""));
        return ResponseEntity.status(status).body(map);
    }
}
