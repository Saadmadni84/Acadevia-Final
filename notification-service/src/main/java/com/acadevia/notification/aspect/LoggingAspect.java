package com.acadevia.notification.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class LoggingAspect {

    @Around("execution(* com.acadevia.notification.service..*(..))")
    public Object logServiceMethods(ProceedingJoinPoint joinPoint) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        
        log.debug("Entering {}.{}", className, methodName);
        
        long start = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long executionTime = System.currentTimeMillis() - start;
            log.debug("Exiting {}.{} - Execution time: {} ms", className, methodName, executionTime);
            return result;
        } catch (Throwable e) {
            log.error("Exception in {}.{}: {}", className, methodName, e.getMessage());
            throw e;
        }
    }
}
