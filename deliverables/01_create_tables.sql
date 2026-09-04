-- PostgreSQL Table Creation DDL Script
-- File: deliverables/01_create_tables.sql

DROP TABLE IF EXISTS sos_requests CASCADE;
DROP TABLE IF EXISTS relief_items CASCADE;
DROP TABLE IF EXISTS helicopters CASCADE;
DROP TABLE IF EXISTS edges CASCADE;
DROP TABLE IF EXISTS nodes CASCADE;

CREATE TABLE nodes (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    node_type VARCHAR(50) NOT NULL
);

CREATE TABLE edges (
    id BIGSERIAL PRIMARY KEY,
    source_node_id BIGINT NOT NULL,
    target_node_id BIGINT NOT NULL,
    distance_km DOUBLE PRECISION NOT NULL,
    travel_time_mins DOUBLE PRECISION NOT NULL,
    blocked BOOLEAN NOT NULL DEFAULT FALSE,
    one_way BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_edges_source FOREIGN KEY (source_node_id) REFERENCES nodes(id) ON DELETE CASCADE,
    CONSTRAINT fk_edges_target FOREIGN KEY (target_node_id) REFERENCES nodes(id) ON DELETE CASCADE
);

CREATE TABLE helicopters (
    id BIGSERIAL PRIMARY KEY,
    call_sign VARCHAR(100) NOT NULL,
    max_payload_kg DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE'
);

CREATE TABLE relief_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    priority_value DOUBLE PRECISION NOT NULL,
    category VARCHAR(50) NOT NULL
);

CREATE TABLE sos_requests (
    id BIGSERIAL PRIMARY KEY,
    rescue_camp_id BIGINT NOT NULL,
    camp_name VARCHAR(255) NOT NULL,
    injury_severity DOUBLE PRECISION NOT NULL,
    camp_population DOUBLE PRECISION NOT NULL,
    supply_shortage_level DOUBLE PRECISION NOT NULL,
    resource_cost DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sos_camp FOREIGN KEY (rescue_camp_id) REFERENCES nodes(id) ON DELETE CASCADE
);
