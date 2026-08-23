package com.rapidresponse.resource.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "relief_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReliefItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private double weightKg;
    private double priorityValue;
    @Enumerated(EnumType.STRING)
    private ReliefCategory category;
}
