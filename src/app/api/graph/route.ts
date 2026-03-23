import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const nodes = [];
    const links = [];
    const nodeIds = new Set();

    function addNode(id: string, group: string, label: string, details: any = {}) {
      if (!id || nodeIds.has(id)) return;
      nodeIds.add(id);
      nodes.push({ id, group, label, ...details });
    }

    function addLink(source: string, target: string, label: string = '') {
      if (!source || !target) return;
      links.push({ source, target, label });
    }

    // 1. Customers
    const customers = db.prepare('SELECT businessPartner, businessPartnerName FROM business_partners LIMIT 500').all();
    for (const c of customers) {
      addNode(c.businessPartner, 'Customer', c.businessPartnerName || `Customer ${c.businessPartner}`);
    }

    // 2. Products
    const products = db.prepare('SELECT product, productGroup FROM products LIMIT 500').all();
    for (const p of products) {
      addNode(p.product, 'Product', `Product ${p.product}`);
    }

    // 3. Sales Orders
    const orders = db.prepare('SELECT salesOrder, soldToParty, totalNetAmount, transactionCurrency FROM sales_order_headers LIMIT 1000').all();
    for (const o of orders) {
      addNode(o.salesOrder, 'SalesOrder', `Order ${o.salesOrder}`, { amount: o.totalNetAmount, currency: o.transactionCurrency });
      if (o.soldToParty) {
        // Ensure customer node exists if not in the bp limit
        addNode(o.soldToParty, 'Customer', `Customer ${o.soldToParty}`);
        addLink(o.soldToParty, o.salesOrder, 'Places');
      }
    }

    // Order Items -> Products
    const orderItems = db.prepare('SELECT salesOrder, material FROM sales_order_items LIMIT 2000').all();
    for (const item of orderItems) {
      if (item.material) {
        addNode(item.material, 'Product', `Product ${item.material}`);
        addLink(item.salesOrder, item.material, 'Contains');
      }
    }

    // 4. Deliveries
    const deliveries = db.prepare('SELECT deliveryDocument FROM outbound_delivery_headers LIMIT 1000').all();
    for (const d of deliveries) {
      addNode(d.deliveryDocument, 'Delivery', `Delivery ${d.deliveryDocument}`);
    }
    const deliveryItems = db.prepare('SELECT deliveryDocument, referenceSdDocument FROM outbound_delivery_items LIMIT 2000').all();
    for (const d of deliveryItems) {
      if (d.referenceSdDocument) {
        addLink(d.referenceSdDocument, d.deliveryDocument, 'Delivered In');
      }
    }

    // 5. Billing Documents
    const billings = db.prepare('SELECT billingDocument, accountingDocument FROM billing_document_headers LIMIT 1000').all();
    for (const b of billings) {
      addNode(b.billingDocument, 'Billing', `Invoice ${b.billingDocument}`);
      if (b.accountingDocument) {
        addNode(b.accountingDocument, 'JournalEntry', `JE ${b.accountingDocument}`);
        addLink(b.billingDocument, b.accountingDocument, 'Posts To');
      }
    }
    const billingItems = db.prepare('SELECT billingDocument, referenceSdDocument FROM billing_document_items LIMIT 2000').all();
    for (const b of billingItems) {
      if (b.referenceSdDocument) {
        addLink(b.referenceSdDocument, b.billingDocument, 'Billed In');
      }
    }

    // 6. Payments
    const payments = db.prepare('SELECT accountingDocument, clearingAccountingDocument FROM journal_entry_items_accounts_receivable WHERE clearingAccountingDocument IS NOT NULL AND clearingAccountingDocument != "" LIMIT 1000').all();
    for (const p of payments) {
      addNode(p.clearingAccountingDocument, 'Payment', `Payment ${p.clearingAccountingDocument}`);
      addLink(p.accountingDocument, p.clearingAccountingDocument, 'Cleared By');
    }

    // Filter out links where source or target doesn't exist in nodes
    const validLinks = links.filter(l => nodeIds.has(l.source) && nodeIds.has(l.target));

    return NextResponse.json({ nodes, links: validLinks });
  } catch (error: any) {
    console.error('Graph API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
