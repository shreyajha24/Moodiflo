package com.shreya.moodify.exception;
public final class ApiExceptions { private ApiExceptions(){} public static class NotFound extends RuntimeException{public NotFound(String m){super(m);}} public static class BadRequest extends RuntimeException{public BadRequest(String m){super(m);}} public static class Forbidden extends RuntimeException{public Forbidden(String m){super(m);}} }
