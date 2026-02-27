package com.acadevia.auth.exception;

public class AccountLockedException extends AuthException {
    public AccountLockedException(String message) {
        super(message);
    }
}
