package com.acadevia.auth.util;

public class ValidationConstants {
    public static final String PASSWORD_REGEX = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,50}$";
    public static final String PASSWORD_MESSAGE = "Password must contain at least one uppercase, one lowercase, one digit, and one special character";
    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final int MAX_PASSWORD_LENGTH = 50;
    public static final int MIN_NAME_LENGTH = 2;
    public static final int MAX_NAME_LENGTH = 100;
    public static final int MIN_CLASS_GRADE = 1;
    public static final int MAX_CLASS_GRADE = 12;
}
