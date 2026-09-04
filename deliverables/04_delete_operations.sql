-- PostgreSQL Delete & Removal Operations Script
-- File: deliverables/04_delete_operations.sql

-- 1. Delete Specific Road Connection (#3213 between Camp B and Camp F)
DELETE FROM edges 
WHERE id = 3213 OR (source_node_id = 3 AND target_node_id = 8);

-- 2. Delete Specific Relief Cargo Item (#12 Multi-Tool Kits)
DELETE FROM relief_items 
WHERE id = 12 OR name = 'Multi-Tool Kits';

-- 3. Delete Specific Helicopter from Fleet (#6 AIR-LIFTER)
DELETE FROM helicopters 
WHERE id = 6 OR call_sign = 'AIR-LIFTER';

-- 4. Delete Resolved Disaster Zone SOS Request (#7 Beta Outpost)
DELETE FROM sos_requests 
WHERE id = 7 OR camp_name = 'Beta Outpost';

-- 5. Delete Emergency Junction Node (#20 Junction H - Cascade removes dependent edges & SOS requests)
DELETE FROM nodes 
WHERE id = 20;
