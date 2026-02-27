package com.acadevia.admin.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class AuditAspect {

    @Around("execution(* com.acadevia.admin.controller..*(..))")
    public Object logAdminAction(ProceedingJoinPoint joinPoint) throws Throwable {
        String method = joinPoint.getSignature().toShortString();
        log.info("🛡️ ADMIN ACTION: {}", method);
        long start = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        log.info("🛡️ ADMIN ACTION COMPLETE: {} ({}ms)", method, System.currentTimeMillis() - start);
        return result;
    }
}
