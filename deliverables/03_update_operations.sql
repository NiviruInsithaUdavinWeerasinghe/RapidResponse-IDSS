-- PostgreSQL Update & Edit Operations Script
-- File: deliverables/03_update_operations.sql

-- 1. Update Node (Edit Camp Name & Coordinates for Camp #2)
UPDATE nodes 
SET name = 'Camp A (Galle Primary Medical Base)', latitude = 6.0550, longitude = 80.2220 
WHERE id = 2;

-- 2. Update Edge (Unblock Road Segment #22 between Junction D and Junction E)
UPDATE edges 
SET blocked = FALSE, travel_time_mins = 20.0 
WHERE id = 22;

-- 3. Update Helicopter Fleet Status & Payload Capacity for Helicopter #4
UPDATE helicopters 
SET status = 'IN_MAINTENANCE', max_payload_kg = 750.0 
WHERE id = 4 OR call_sign = 'RESCUE-01';

-- 4. Update Relief Cargo Item Priority Score & Weight for Item #5
UPDATE relief_items 
SET priority_value = 98.0, weight_kg = 160.0 
WHERE id = 5 OR name = 'Medical Kits';

-- 5. Update Disaster Zone Emergency SOS Status for Zone #6
UPDATE sos_requests 
SET status = 'DISPATCHED' 
WHERE id = 6 OR camp_name = 'Alpha Shelter';
