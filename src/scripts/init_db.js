const fs = require('fs');
const path = require('path');
const readline = require('readline');
const Database = require('better-sqlite3');

const DATA_DIR = path.join(process.cwd(), 'sap-o2c-data');
const DB_PATH = path.join(process.cwd(), 'sap-o2c.db');

// Map table names to their primary keys to set them correctly
const PRIMARY_KEYS = {
    'sales_order_headers': 'salesOrder',
    'sales_order_items': 'salesOrder, salesOrderItem',
    'billing_document_headers': 'billingDocument',
    'billing_document_items': 'billingDocument, billingDocumentItem',
    'outbound_delivery_headers': 'deliveryDocument',
    'outbound_delivery_items': 'deliveryDocument, deliveryDocumentItem',
    'business_partners': 'businessPartner',
    'business_partner_addresses': 'businessPartner, addressID',
    'plants': 'plant',
    'products': 'product',
    'journal_entry_items_accounts_receivable': 'companyCode, accountingDocument, fiscalYear, accountingDocumentItem',
    'payments_accounts_receivable': 'companyCode, accountingDocument, fiscalYear',
};

async function processFile(db, tableName, filePath) {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;
    let insertStmt;

    db.exec(`BEGIN TRANSACTION`);

    for await (const line of rl) {
        if (!line.trim()) continue;
        const record = JSON.parse(line);

        if (isFirstLine) {
            // Create table based on keys
            const columns = Object.keys(record);
            const pkDef = PRIMARY_KEYS[tableName] ? `, PRIMARY KEY (${PRIMARY_KEYS[tableName]})` : '';
            const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.map(c => `"${c}" TEXT`).join(', ')}${pkDef})`;
            
            try {
                db.exec(createTableSql);
            } catch (e) {
                // Table might already exist and that's fine
            }

            const placeholders = columns.map(() => '?').join(', ');
            insertStmt = db.prepare(`INSERT OR REPLACE INTO ${tableName} ("${columns.join('", "')}") VALUES (${placeholders})`);
            isFirstLine = false;
        }

        try {
            insertStmt.run(Object.values(record).map(v => v !== null && v !== undefined ? String(v) : null));
        } catch (e) {
            console.error(`Error inserting into ${tableName}:`, e.message);
        }
    }

    db.exec(`COMMIT`);
}

async function main() {
    if (fs.existsSync(DB_PATH)) {
        console.log('Removing old database...');
        fs.unlinkSync(DB_PATH);
    }

    const db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');

    const tables = fs.readdirSync(DATA_DIR);

    for (const tableName of tables) {
        const tableDirPath = path.join(DATA_DIR, tableName);
        if (!fs.statSync(tableDirPath).isDirectory()) continue;

        const files = fs.readdirSync(tableDirPath).filter(f => f.endsWith('.jsonl'));
        console.log(`Processing table: ${tableName} (${files.length} files)`);

        for (const file of files) {
            await processFile(db, tableName, path.join(tableDirPath, file));
        }
    }

    console.log('Database initialization complete!');
    db.close();
}

main().catch(console.error);
