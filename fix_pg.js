const fs = require('fs');
let file = 'e:/desktop/IHRR/Feed/Website/backend/migrations/008_unified_latest_schema.js';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(/const createUpdateTimestampFunction[\s\S]*?};\n\n/g, '');
c = c.replace(/const createUpdatedAtTrigger[\s\S]*?};\n\n/g, '');
c = c.replace(/await createUpdateTimestampFunction\(\);\n/g, '');
c = c.replace(/const tablesWithUpdatedAt = \[[\s\S]*?}\n\n/g, '');
c = c.replace(/ON CONFLICT \(id\) DO NOTHING/g, 'ON DUPLICATE KEY UPDATE id=id');
c = c.replace(/JSONB/g, 'JSON');
c = c.replace(/CURRENT_DATETIME/g, 'CURRENT_TIMESTAMP');
c = c.replace(/TIMESTAMP WITH TIME ZONE/g, 'DATETIME');
c = c.replace(/CREATE INDEX .* USING gin\(to_tsvector\('english', (.*)\)\);/g, 'CREATE FULLTEXT INDEX idx_services_long_description ON services($1);');
c = c.replace(/CREATE INDEX.*USING gin\(.*\);\n/g, '');

fs.writeFileSync(file, c);

const teamRoute = 'e:/desktop/IHRR/Feed/Website/backend/routes/team.js';
if (fs.existsSync(teamRoute)) {
  let tc = fs.readFileSync(teamRoute, 'utf8');
  fs.writeFileSync(teamRoute, tc);
}
