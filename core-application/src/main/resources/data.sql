-- Insert test nodes for Kandy Route Map
INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES (1, 'HQ', 7.2906, 80.6337, 'HQ');
INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES (2, 'North Junction', 7.3356, 80.6214, 'INTERSECTION');
INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES (3, 'Peradeniya Camp', 7.2699, 80.5938, 'RESCUE_CAMP');
INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES (4, 'Gampola Camp', 7.1647, 80.5696, 'RESCUE_CAMP');
INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES (5, 'Isolated Lookout', 7.4000, 80.7000, 'INTERSECTION');

-- Insert undirected test edges (Requires source->target and target->source if undirected is stored as two directed edges, but let's assume GraphBuilder builds undirected from one record, or we just insert both directions)
INSERT INTO edges (source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES (1, 2, 8.0, 16.0, false, false);
INSERT INTO edges (source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES (2, 3, 12.0, 24.0, false, false);
INSERT INTO edges (source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES (1, 3, 10.0, 20.0, false, false);
INSERT INTO edges (source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES (3, 4, 15.0, 30.0, false, false);
INSERT INTO edges (source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES (2, 4, 28.0, 50.0, false, false);
