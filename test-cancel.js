// Test Order Cancellation and Stock Revert
async function testOrderCancellation() {
  const BASE_URL = 'http://127.0.0.1:5000/api';
  console.log('🧪 Testing Order Cancellation & Stock Reversion...');

  // 1. Login
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'owner@cribsociety.com', password: 'password123' })
  });
  const { token } = await loginRes.json();

  // 2. Check current stock of Product 3 (Berry Charcoal Tonic)
  const pBeforeRes = await fetch(`${BASE_URL}/products/3`);
  const { data: pBefore } = await pBeforeRes.json();
  console.log(`Product 3 stock before order: ${pBefore.stock}`);

  // 3. Create Order with 5 items of Product 3
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [{ productId: 3, quantity: 5 }],
      paymentMethod: 'qris',
      customerName: 'Cancel Test'
    })
  });
  const { order } = await orderRes.json();
  console.log(`Created Order #${order.id} (${order.orderNumber}) for 5 units`);

  // 4. Check stock after order
  const pAfterOrderRes = await fetch(`${BASE_URL}/products/3`);
  const { data: pAfterOrder } = await pAfterOrderRes.json();
  console.log(`Product 3 stock after order: ${pAfterOrder.stock} (expected: ${pBefore.stock - 5})`);

  // 5. Cancel the Order
  const cancelRes = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: 'cancelled', reason: 'Customer changed mind' })
  });
  const cancelData = await cancelRes.json();
  console.log('Cancel response:', cancelData.message);

  // 6. Check stock after cancellation
  const pAfterCancelRes = await fetch(`${BASE_URL}/products/3`);
  const { data: pAfterCancel } = await pAfterCancelRes.json();
  console.log(`Product 3 stock after cancel: ${pAfterCancel.stock} (expected: ${pBefore.stock})`);

  if (pAfterCancel.stock === pBefore.stock) {
    console.log('✅ Stock restoration logic passed with flying colors!');
  } else {
    console.error('❌ Stock restoration mismatch!');
  }
}

testOrderCancellation();
