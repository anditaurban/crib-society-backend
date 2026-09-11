import { pool } from '../config/db.js';

/**
 * Fetch dynamic financial settings (Tax rate & Service charge) from store_settings
 */
export async function getFinancialSettings(connection = pool) {
  try {
    const [rows] = await connection.query(
      'SELECT setting_key, setting_value FROM store_settings WHERE setting_key IN ("tax_rate_percent", "service_charge_percent")'
    );

    let taxRatePercent = 10.0; // Default PB1 10%
    let serviceChargePercent = 0.0;

    for (const row of rows) {
      if (row.setting_key === 'tax_rate_percent') {
        taxRatePercent = parseFloat(row.setting_value) || 0.0;
      } else if (row.setting_key === 'service_charge_percent') {
        serviceChargePercent = parseFloat(row.setting_value) || 0.0;
      }
    }

    return { taxRatePercent, serviceChargePercent };
  } catch (error) {
    console.warn('⚠️ Warning: Failed to fetch financial settings, falling back to defaults:', error.message);
    return { taxRatePercent: 10.0, serviceChargePercent: 0.0 };
  }
}

/**
 * Calculate totals according to Crib Society Business Rules (Section 4)
 * @param {Array<{ price: number, quantity: number }>} items
 * @param {number} discountAmount
 * @param {{ taxRatePercent: number, serviceChargePercent: number }} settings
 */
export function calculateOrderTotals(items, discountAmount = 0, settings = { taxRatePercent: 10, serviceChargePercent: 0 }) {
  // 1. Line Item Subtotals & Subtotal
  let subtotal = 0;
  for (const item of items) {
    const lineSubtotal = Math.round(Number(item.price) * Number(item.quantity));
    subtotal += lineSubtotal;
  }

  // 2. Discount validation
  const discount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal);

  // 3. Service Charge
  const serviceRate = (settings.serviceChargePercent || 0) / 100;
  const serviceAmount = Math.round((subtotal - discount) * serviceRate);

  // 4. Tax (PB1 - 10%)
  const taxableBase = (subtotal - discount) + serviceAmount;
  const taxRate = (settings.taxRatePercent || 10) / 100;
  const taxAmount = Math.round(taxableBase * taxRate);

  // 5. Grand Total
  const totalAmount = (subtotal - discount) + serviceAmount + taxAmount;

  return {
    subtotal,
    discountAmount: discount,
    serviceAmount,
    taxAmount,
    totalAmount,
    taxRatePercent: settings.taxRatePercent,
    serviceChargePercent: settings.serviceChargePercent
  };
}

/**
 * Generate unique Order Number format: ORD-YYYYMMDD-XXXX
 */
export async function generateOrderNumber(connection = pool) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;

  const [rows] = await connection.query(
    'SELECT order_number FROM orders WHERE order_number LIKE ? ORDER BY id DESC LIMIT 1',
    [`${prefix}%`]
  );

  let nextSequence = 1;
  if (rows.length > 0) {
    const lastNumber = rows[0].order_number;
    const parts = lastNumber.split('-');
    if (parts.length === 3) {
      const seq = parseInt(parts[2], 10);
      if (!isNaN(seq)) {
        nextSequence = seq + 1;
      }
    }
  }

  const paddedSequence = String(nextSequence).padStart(4, '0');
  return `${prefix}${paddedSequence}`;
}
