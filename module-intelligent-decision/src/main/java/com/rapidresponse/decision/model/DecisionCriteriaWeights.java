package com.rapidresponse.decision.model;

/**
 * Encapsulates the configurable weights for multi-criteria decision analysis (MCDA).
 * Criteria balanced:
 * 1. Injury severity (default: 0.5)
 * 2. Camp population (default: 0.3)
 * 3. Lack of supplies / shortage (default: 0.2)
 */
public class DecisionCriteriaWeights {

    public static final double DEFAULT_SEVERITY_WEIGHT = 0.50;
    public static final double DEFAULT_POPULATION_WEIGHT = 0.30;
    public static final double DEFAULT_SHORTAGE_WEIGHT = 0.20;

    private double severityWeight = DEFAULT_SEVERITY_WEIGHT;
    private double populationWeight = DEFAULT_POPULATION_WEIGHT;
    private double shortageWeight = DEFAULT_SHORTAGE_WEIGHT;

    public DecisionCriteriaWeights() {
    }

    public DecisionCriteriaWeights(double severityWeight, double populationWeight, double shortageWeight) {
        this.severityWeight = severityWeight;
        this.populationWeight = populationWeight;
        this.shortageWeight = shortageWeight;
    }

    public double getSeverityWeight() { return severityWeight; }
    public void setSeverityWeight(double severityWeight) { this.severityWeight = severityWeight; }

    public double getPopulationWeight() { return populationWeight; }
    public void setPopulationWeight(double populationWeight) { this.populationWeight = populationWeight; }

    public double getShortageWeight() { return shortageWeight; }
    public void setShortageWeight(double shortageWeight) { this.shortageWeight = shortageWeight; }

    public DecisionCriteriaWeights normalized() {
        double wSev = this.severityWeight > 0 ? this.severityWeight : 0.0;
        double wPop = this.populationWeight > 0 ? this.populationWeight : 0.0;
        double wShort = this.shortageWeight > 0 ? this.shortageWeight : 0.0;

        double sum = wSev + wPop + wShort;
        if (sum <= 1e-9) {
            return new DecisionCriteriaWeights(DEFAULT_SEVERITY_WEIGHT, DEFAULT_POPULATION_WEIGHT, DEFAULT_SHORTAGE_WEIGHT);
        }

        return new DecisionCriteriaWeights(wSev / sum, wPop / sum, wShort / sum);
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private double severityWeight = DEFAULT_SEVERITY_WEIGHT;
        private double populationWeight = DEFAULT_POPULATION_WEIGHT;
        private double shortageWeight = DEFAULT_SHORTAGE_WEIGHT;

        public Builder severityWeight(double v) { this.severityWeight = v; return this; }
        public Builder populationWeight(double v) { this.populationWeight = v; return this; }
        public Builder shortageWeight(double v) { this.shortageWeight = v; return this; }

        public DecisionCriteriaWeights build() {
            return new DecisionCriteriaWeights(severityWeight, populationWeight, shortageWeight);
        }
    }
}
