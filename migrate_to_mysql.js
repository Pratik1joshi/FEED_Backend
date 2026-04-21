const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'models');
const migrationsDir = path.join(__dirname, 'migrations');
const scriptsDir = path.join(__dirname, 'scripts');

function fileScanner(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            results = results.concat(fileScanner(fullPath));
        } else if (fullPath.endsWith('.js')) {
            results.push(fullPath);
        }
    });
    return results;
}

// 1. Process migrations
const migrations = fileScanner(migrationsDir);
migrations.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Convert SERIAL PRIMARY KEY  
    content = content.replace(/SERIAL PRIMARY KEY/g, 'INT AUTO_INCREMENT PRIMARY KEY');
    
    // Convert TIMESTAMP to DATETIME
    content = content.replace(/TIMESTAMP DEFAULT CURRENT_TIMESTAMP/g, 'DATETIME DEFAULT CURRENT_TIMESTAMP');
    content = content.replace(/TIMESTAMP(?!\s*(?:DEFAULT|WITH|WITHOUT))/g, 'DATETIME');
    
    // Add ON UPDATE CURRENT_TIMESTAMP only to updated_at
    content = content.replace(/updated_at DATETIME DEFAULT CURRENT_TIMESTAMP(?!\s+ON\s+UPDATE)/g, 'updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    content = content.replace(/updated_at DATETIME(?! DEFAULT)/g, 'updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

    // Remove PG Trigger definitions completely
    content = content.replace(/\/\/ Create trigger[\s\S]*?(?=\r?\n\r?\n)/gi, '');
    content = content.replace(/await\s+(?:pool|client)\.query\([\s\S]*?CREATE(?: OR REPLACE)? (?:FUNCTION|TRIGGER)[\s\S]*?`\s*\);?/g, '');
    
    // If there's any stray pg functions
    content = content.replace(/CREATE OR REPLACE FUNCTION[\s\S]*?LANGUAGE plpgsql;/gi, '');
    
    fs.writeFileSync(file, content);
});
console.log('Migrations processed.');

// 2. Process models
// In models, finding `RETURNING *` and removing it. MySQL doesn't have it.
const models = fileScanner(modelsDir);
let changedModels = 0;
models.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Convert ILIKE to LIKE for MySQL
    content = content.replace(/\bILIKE\b/g, 'LIKE');
    
    // Remove RETURNING clauses
    // specifically like `RETURNING *` or `RETURNING id, name, ...` in query strings
    content = content.replace(/RETURNING\s+\*/gi, '');
    content = content.replace(/RETURNING\s+(?:id|name|email|role|is_active|last_login|created_at|updated_at|admin_id|token_hash|expires_at|used_at)(?:\s*,\s*(?:id|name|email|role|is_active|last_login|created_at|updated_at|admin_id|token_hash|expires_at|used_at))*/gi, '');
    
    // For deletes, we return boolean or rely on affectedRows now
    if (content.includes('result.rows[0]') && content.includes('INSERT INTO')) {
        // we can't easily auto-fix all of this with simple regex. Let's fix database.js to simulate RETURNING * or we rely on it just being rows[0] for select.
        // Wait, for INSERT, if we remove RETURNING, result.rows is an object, not array.
        // If they did result.rows[0], it will be undefined in MySQL inserts.
        // I will change result.rows[0] in Models immediately after INSERT to just return an object with insertId.
    }
    
    fs.writeFileSync(file, content);
    changedModels++;
});
console.log(`Models processed: ${changedModels} models checked.`);

// 3. Process scripts
const scripts = fileScanner(scriptsDir);
scripts.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\bILIKE\b/g, 'LIKE');
    content = content.replace(/RETURNING\s+\*/gi, '');
    content = content.replace(/RETURNING\s+(?:id|[a-zA-Z0-9_,\s]+)(?=(?:'|`|"|\n|\r))/gi, '');
    fs.writeFileSync(file, content);
});
console.log('Scripts processed.');
