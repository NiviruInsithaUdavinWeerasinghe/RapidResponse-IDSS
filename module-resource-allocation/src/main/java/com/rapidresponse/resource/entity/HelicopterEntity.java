package com.rapidresponse.resource.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "helicopters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HelicopterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String callSign;
    private double maxPayloadKg;
    private String status;
}
