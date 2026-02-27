package com.acadevia.sync.entity;

import com.acadevia.sync.enums.NetworkType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "bandwidth_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BandwidthLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String deviceId;

    @Enumerated(EnumType.STRING)
    private NetworkType networkType;

    private Long bytesTransferred;
    private Long durationMs;
    private Double throughputKbps;

    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;
}
