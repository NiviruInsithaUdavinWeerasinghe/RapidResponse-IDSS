package com.rapidresponse.decision.dto.request;

import jakarta.validation.constraints.Positive;
import java.util.List;

/**
 * Request payload for optimizing emergency SOS rescue batches.
 */
public class DecisionRequest {

    @Positive(message = "maxDailyCapacity must be greater than 0")
    private double maxDailyCapacity;

    private double severityWeight = 0.50;
    private double populationWeight = 0.30;
    private double shortageWeight = 0.20;
    private List<Long> requestIds;
    private List<CreateSOSRequest> directRequests;

    public DecisionRequest() {
    }

    public DecisionRequest(double maxDailyCapacity, double severityWeight, double populationWeight,
                           double shortageWeight, List<Long> requestIds, List<CreateSOSRequest> directRequests) {
        this.maxDailyCapacity = maxDailyCapacity;
        this.severityWeight = severityWeight;
        this.populationWeight = populationWeight;
        this.shortageWeight = shortageWeight;
        this.requestIds = requestIds;
        this.directRequests = directRequests;
    }

    public double getMaxDailyCapacity() { return maxDailyCapacity; }
    public void setMaxDailyCapacity(double maxDailyCapacity) { this.maxDailyCapacity = maxDailyCapacity; }

    public double getSeverityWeight() { return severityWeight; }
    public void setSeverityWeight(double severityWeight) { this.severityWeight = severityWeight; }

    public double getPopulationWeight() { return populationWeight; }
    public void setPopulationWeight(double populationWeight) { this.populationWeight = populationWeight; }

    public double getShortageWeight() { return shortageWeight; }
    public void setShortageWeight(double shortageWeight) { this.shortageWeight = shortageWeight; }

    public List<Long> getRequestIds() { return requestIds; }
    public void setRequestIds(List<Long> requestIds) { this.requestIds = requestIds; }

    public List<CreateSOSRequest> getDirectRequests() { return directRequests; }
    public void setDirectRequests(List<CreateSOSRequest> directRequests) { this.directRequests = directRequests; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private double maxDailyCapacity;
        private double severityWeight = 0.50;
        private double populationWeight = 0.30;
        private double shortageWeight = 0.20;
        private List<Long> requestIds;
        private List<CreateSOSRequest> directRequests;

        public Builder maxDailyCapacity(double v) { this.maxDailyCapacity = v; return this; }
        public Builder severityWeight(double v) { this.severityWeight = v; return this; }
        public Builder populationWeight(double v) { this.populationWeight = v; return this; }
        public Builder shortageWeight(double v) { this.shortageWeight = v; return this; }
        public Builder requestIds(List<Long> v) { this.requestIds = v; return this; }
        public Builder directRequests(List<CreateSOSRequest> v) { this.directRequests = v; return this; }

        public DecisionRequest build() {
            return new DecisionRequest(maxDailyCapacity, severityWeight, populationWeight, shortageWeight, requestIds, directRequests);
        }
    }
}
