package com.rapidresponse.resource.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "helicopters")
public class HelicopterEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String callSign;
    private double maxPayloadKg;
    private String status;

    public HelicopterEntity() {
    }

    public HelicopterEntity(Long id, String callSign, double maxPayloadKg, String status) {
        this.id = id;
        this.callSign = callSign;
        this.maxPayloadKg = maxPayloadKg;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCallSign() {
        return callSign;
    }

    public void setCallSign(String callSign) {
        this.callSign = callSign;
    }

    public double getMaxPayloadKg() {
        return maxPayloadKg;
    }

    public void setMaxPayloadKg(double maxPayloadKg) {
        this.maxPayloadKg = maxPayloadKg;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String callSign;
        private double maxPayloadKg;
        private String status;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder callSign(String callSign) {
            this.callSign = callSign;
            return this;
        }

        public Builder maxPayloadKg(double maxPayloadKg) {
            this.maxPayloadKg = maxPayloadKg;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public HelicopterEntity build() {
            return new HelicopterEntity(id, callSign, maxPayloadKg, status);
        }
    }
}
