const db = require('better-sqlite3')('sap-o2c.db'); 
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all(); 
for(const t of tables){ 
    const cols = db.prepare(`PRAGMA table_info('${t.name}')`).all(); 
    console.log(t.name + ': ' + cols.map(c=>c.name).join(', ')); 
}
