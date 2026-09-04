package com.acadevia.sync.config;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configures the AWS SDK v1 AmazonS3 client to connect to MinIO.
 *
 * MinIO is S3-compatible but requires:
 *  1. A custom endpoint (http://minio:9000 inside Docker, or the configured MINIO_ENDPOINT)
 *  2. Path-style bucket access (virtual-hosted style is the AWS default and doesn't work with MinIO)
 *
 * In Docker, the compose stack injects:
 *   SPRING_CLOUD_AWS_ENDPOINT=http://minio:9000
 *   SPRING_CLOUD_AWS_CREDENTIALS_ACCESS_KEY=<value>
 *   SPRING_CLOUD_AWS_CREDENTIALS_SECRET_KEY=<value>
 *   SPRING_CLOUD_AWS_REGION_STATIC=us-east-1
 */
@Configuration
public class S3Config {

    @Value("${spring.cloud.aws.credentials.access-key}")
    private String accessKey;

    @Value("${spring.cloud.aws.credentials.secret-key}")
    private String secretKey;

    @Value("${spring.cloud.aws.region.static:us-east-1}")
    private String region;

    /** MinIO S3-API endpoint, e.g. http://minio:9000 (Docker) or http://localhost:9000 (host). */
    @Value("${spring.cloud.aws.endpoint:http://minio:9000}")
    private String endpoint;

    @Bean
    public AmazonS3 amazonS3() {
        return AmazonS3ClientBuilder.standard()
                .withEndpointConfiguration(
                        new AwsClientBuilder.EndpointConfiguration(endpoint, region))
                .withCredentials(
                        new AWSStaticCredentialsProvider(new BasicAWSCredentials(accessKey, secretKey)))
                .withPathStyleAccessEnabled(true)   // Required for MinIO
                .build();
    }
}
