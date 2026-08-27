DELETE FROM edges;
DELETE FROM nodes;

-- Insert nodes
INSERT INTO nodes (id, name, latitude, longitude, node_type) VALUES
(1, 'Source', 0.0, 0.0, 'RESCUE_CAMP'),
(2, 'Middle', 0.1, 0.1, 'RESCUE_CAMP'),
(3, 'Target', 0.2, 0.2, 'RESCUE_CAMP');

-- Insert edges
INSERT INTO edges (id, source_node_id, target_node_id, distance_km, travel_time_mins, blocked, one_way) VALUES
(1, 1, 2, 20.0, 30.0, false, false),
(2, 2, 3, 20.0, 30.0, false, false),
(3, 1, 3, 50.0, 60.0, false, false);
