package com.rapidresponse.route.algorithm;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;


class HaversineHeuristicTest {

    private static final double TOLERANCE_KM = 0.1;
    @Test
    void calculate_colomboToKandy_shouldMatchKnownDistance() {
        double distance = HaversineHeuristic.calculate(6.9271, 79.8612, 7.2906, 80.6337);
        assertEquals(94.34, distance, TOLERANCE_KM, "Colombo to Kandy great-circle distance should be ~94.3 km");
    }

    @Test
    void calculate_londonToParis_shouldMatchKnownDistance() {
        double distance = HaversineHeuristic.calculate(51.5074, -0.1278, 48.8566, 2.3522);

        assertEquals(343.56, distance, TOLERANCE_KM, "London to Paris great-circle distance should be ~343.6 km");
    }

    @Test
    void calculate_newYorkToLosAngeles_shouldMatchKnownDistance() {
        double distance = HaversineHeuristic.calculate(40.7128, -74.0060, 34.0522, -118.2437);

        assertEquals(3935.75, distance, TOLERANCE_KM, "New York to Los Angeles great-circle distance should be ~3935.7 km");
    }

    @Test
    void calculate_equatorQuarterTurn_shouldEqualQuarterCircumference() {
        double distance = HaversineHeuristic.calculate(0.0, 0.0, 0.0, 90.0);
        assertEquals(10007.54, distance, TOLERANCE_KM, "Quarter of the equatorial circumference should be ~10007.5 km");
    }

    @Test
    void calculate_poleToPole_shouldEqualHalfCircumference() {
        double distance = HaversineHeuristic.calculate(90.0, 0.0, -90.0, 0.0);

        assertEquals(20015.09, distance, TOLERANCE_KM,
                "Pole-to-pole distance should be ~20015.1 km (half circumference)");
    }


    @Test
    void calculate_samePoint_shouldReturnZero() {
        double distance = HaversineHeuristic.calculate(7.2906, 80.6337, 7.2906, 80.6337);
        assertEquals(0.0, distance, 1e-9, "Distance from a point to itself must be zero");
    }

    @Test
    void calculate_shouldBeSymmetric() {
        double forward = HaversineHeuristic.calculate(6.9271, 79.8612, 7.2906, 80.6337);
        double reverse = HaversineHeuristic.calculate(7.2906, 80.6337, 6.9271, 79.8612);
        assertEquals(forward, reverse, 1e-9, "Haversine distance must be symmetric regardless of argument order");
    }

    @Test
    void calculate_shouldNeverReturnNegativeDistance() {
        double distance = HaversineHeuristic.calculate(-33.8688, 151.2093, 51.5074, -0.1278);
        assertTrue(distance > 0.0, "Distance between distinct points must be positive");
    }
}