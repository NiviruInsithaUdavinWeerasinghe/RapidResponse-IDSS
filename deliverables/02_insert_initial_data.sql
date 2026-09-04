-- PostgreSQL Table Seeding INSERT Script
-- File: deliverables/02_insert_initial_data.sql

INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES
(1, 'Colombo HQ Central Command', 6.9271, 79.8612, 'HQ'),
(2, 'Camp A (Galle Shelter)', 6.0535, 80.2210, 'RESCUE_CAMP'),
(3, 'Camp B (Matara Base)', 5.9485, 80.5353, 'RESCUE_CAMP'),
(4, 'Camp C (Hambantota Shelter)', 6.1241, 81.1185, 'RESCUE_CAMP'),
(5, 'Junction A (Ratnapura Intersection)', 6.6828, 80.3992, 'INTERSECTION'),
(6, 'Camp D (Kegalle Station)', 7.2513, 80.3464, 'RESCUE_CAMP'),
(7, 'Camp E (Kalutara Base)', 6.5854, 79.9607, 'RESCUE_CAMP'),
(8, 'Camp F (Avissawella Center)', 6.9538, 80.2078, 'RESCUE_CAMP'),
(9, 'Camp G (Kandy Outpost)', 7.2906, 80.6337, 'RESCUE_CAMP'),
(10, 'Camp H (Nuwara Eliya High Base)', 6.9497, 80.7891, 'RESCUE_CAMP'),
(11, 'Camp I (Badulla Emergency Base)', 6.9934, 81.0550, 'RESCUE_CAMP'),
(12, 'Camp J (Monaragala Center)', 6.8728, 81.3507, 'RESCUE_CAMP'),
(13, 'Camp K (Wellawaya Outpost)', 6.7381, 81.1030, 'RESCUE_CAMP'),
(14, 'Junction B (Maharagama Cross)', 6.8480, 79.9265, 'INTERSECTION'),
(15, 'Junction C (Piliyandala Cross)', 6.8018, 79.9227, 'INTERSECTION'),
(16, 'Junction D (Bandaragama Cross)', 6.7145, 79.9892, 'INTERSECTION'),
(17, 'Junction E (Dodangoda Cross)', 6.5492, 80.0031, 'INTERSECTION'),
(18, 'Junction F (Welipenna Cross)', 6.4350, 80.0520, 'INTERSECTION'),
(19, 'Junction G (Kadawatha Cross)', 7.0012, 79.9510, 'INTERSECTION'),
(20, 'Junction H (Kottawa Cross)', 6.8415, 79.9654, 'INTERSECTION');

INSERT INTO edges (id, source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES
(2, 1, 14, 12.3, 15.0, FALSE, FALSE),
(3, 1, 13, 14.0, 18.0, FALSE, FALSE),
(4, 1, 12, 35.2, 45.0, FALSE, FALSE),
(5, 19, 12, 28.0, 35.0, FALSE, FALSE),
(6, 19, 13, 10.5, 13.0, FALSE, FALSE),
(8, 13, 20, 9.8, 12.0, FALSE, FALSE),
(9, 13, 14, 7.5, 9.0, FALSE, FALSE),
(17, 15, 16, 15.0, 20.0, FALSE, FALSE),
(30, 17, 8, 60.0, 75.0, FALSE, FALSE),
(22, 16, 17, 22.0, 28.0, TRUE, FALSE),
(12, 20, 17, 45.0, 55.0, TRUE, FALSE),
(11, 20, 15, 8.0, 10.0, FALSE, FALSE),
(20, 3, 16, 18.0, 22.0, FALSE, FALSE),
(26, 5, 17, 10.0, 12.0, FALSE, FALSE),
(3213, 3, 8, 35.0, 42.0, FALSE, FALSE),
(321, 10, 5, 15.0, 18.0, FALSE, FALSE),
(3211, 10, 11, 25.0, 30.0, FALSE, FALSE),
(24, 4, 11, 35.0, 45.0, FALSE, FALSE),
(7, 13, 11, 26.0, 32.0, TRUE, FALSE),
(10, 20, 14, 5.2, 7.0, TRUE, FALSE),
(21, 16, 4, 5.5, 7.0, TRUE, FALSE),
(25, 5, 6, 13.0, 16.0, FALSE, FALSE),
(1, 1, 19, 8.5, 11.0, TRUE, FALSE),
(13, 14, 15, 6.5, 8.0, TRUE, FALSE),
(28, 7, 17, 12.0, 15.0, TRUE, FALSE),
(27, 6, 7, 5.5, 7.0, FALSE, FALSE),
(16, 15, 3, 10.5, 13.0, FALSE, FALSE),
(15, 15, 2, 7.8, 10.0, TRUE, FALSE),
(14, 14, 2, 9.0, 11.0, FALSE, FALSE),
(23, 4, 10, 40.0, 50.0, TRUE, FALSE),
(32, 8, 9, 45.0, 58.0, TRUE, FALSE),
(31, 18, 8, 42.0, 52.0, FALSE, FALSE),
(29, 17, 18, 20.0, 25.0, FALSE, FALSE),
(3212, 3, 9, 12.0, 15.0, FALSE, FALSE);

INSERT INTO helicopters (id, call_sign, max_payload_kg, status) VALUES
(4, 'RESCUE-01', 700.0, 'AVAILABLE'),
(5, 'HELI-COMMANDER', 1200.0, 'AVAILABLE'),
(6, 'AIR-LIFTER', 950.0, 'AVAILABLE');

INSERT INTO relief_items (id, name, weight_kg, priority_value, category) VALUES
(5, 'Medical Kits', 150.0, 90.0, 'MEDICAL'),
(6, 'Water Filtration Pack', 300.0, 160.0, 'WATER'),
(7, 'Emergency Food MREs', 200.0, 110.0, 'FOOD'),
(8, 'Tents & Tarps', 250.0, 120.0, 'SHELTER'),
(9, 'Satellite Comms', 100.0, 80.0, 'MEDICAL'),
(10, 'Flashlights & Batteries', 80.0, 45.0, 'MEDICAL'),
(11, 'Blankets Warm Blankets', 120.0, 60.0, 'SHELTER'),
(12, 'Multi-Tool Kits', 90.0, 50.0, 'SHELTER');

INSERT INTO sos_requests (id, rescue_camp_id, camp_name, injury_severity, camp_population, supply_shortage_level, resource_cost, status, received_at) VALUES
(6, 2, 'Alpha Shelter', 8.0, 250.0, 50.0, 7.0, 'PENDING', CURRENT_TIMESTAMP),
(7, 3, 'Beta Outpost', 4.0, 120.0, 50.0, 5.0, 'PENDING', CURRENT_TIMESTAMP),
(8, 5, 'Delta Camp', 9.0, 310.0, 50.0, 8.0, 'PENDING', CURRENT_TIMESTAMP),
(9, 9, 'Omega Base', 5.0, 180.0, 50.0, 6.0, 'PENDING', CURRENT_TIMESTAMP),
(10, 10, 'Zeta Center', 7.0, 450.0, 50.0, 9.0, 'PENDING', CURRENT_TIMESTAMP);
