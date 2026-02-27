package com.acadevia.content.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Value("${server.port:8084}")
    private String serverPort;

    @Bean
    public OpenAPI contentServiceOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Acadevia Content Service API")
                        .description("API for managing video content, pop-up questions, subtitles, downloads, bookmarks, notes, and translations")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Acadevia Team")
                                .email("support@acadevia.com"))
                        .license(new License()
                                .name("Proprietary")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort)
                                .description("Local Development Server")));
    }
}
