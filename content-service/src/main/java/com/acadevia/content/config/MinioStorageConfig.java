package com.acadevia.content.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures AmazonS3 client for MinIO (S3-compatible object storage).
 *
 * In Docker, the compose stack injects:
 *   SPRING_CLOUD_AWS_ENDPOINT                  → spring.cloud.aws.endpoint
 *   SPRING_CLOUD_AWS_CREDENTIALS_ACCESS_KEY    → spring.cloud.aws.credentials.access-key
 *   SPRING_CLOUD_AWS_CREDENTIALS_SECRET_KEY    → spring.cloud.aws.credentials.secret-key
 *   SPRING_CLOUD_AWS_REGION_STATIC             → spring.cloud.aws.region.static
 */
@Configuration
public class MinioStorageConfig {

    @Value("${spring.cloud.aws.credentials.access-key:minioadmin}")
    private String accessKey;

    @Value("${spring.cloud.aws.credentials.secret-key:minioadmin}")
    private String secretKey;

    @Value("${spring.cloud.aws.region.static:us-east-1}")
    private String region;

    @Value("${spring.cloud.aws.endpoint:http://minio:9000}")
    private String endpoint;

    @Value("${acadevia.minio.public-url:${acadevia.minio.endpoint:http://localhost:9000}}")
    private String publicEndpoint;

    @Bean
    public AmazonS3 amazonS3() {
        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        new AwsClientBuilder.EndpointConfiguration(endpoint, region))
                .withCredentials(
                        new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey)))
                .withPathStyleAccessEnabled(true)
                .build();
    }

    @Bean(name = "publicPresignS3Client")
    public AmazonS3 publicPresignS3Client() {
        String targetEndpoint = (publicEndpoint != null && !publicEndpoint.isBlank()) ? publicEndpoint : endpoint;
        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        new AwsClientBuilder.EndpointConfiguration(targetEndpoint, region))
                .withCredentials(
                        new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey)))
                .withPathStyleAccessEnabled(true)
                .build();
    }
}
