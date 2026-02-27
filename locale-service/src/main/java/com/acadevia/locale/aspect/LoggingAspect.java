package com.acadevia.locale.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.acadevia.locale.controller..*(..))")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        log.info("🌐 Locale API: {}", method);
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        log.info("🌐 Locale API Done: {} ({}ms)", method, System.currentTimeMillis() - start);
        return result;
    }
}
