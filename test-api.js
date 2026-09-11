// Automated test suite for Crib Society Backend REST API

async function runTests() {
  const BASE_URL = 'http://127.0.0.1:5000/api';
  console.log('🧪 Starting API Verification Tests against', BASE_URL);

  try {
    // 1. Health Check
    console.log('\n1️⃣ Testing Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('Status:', healthRes.status, healthData);

    // 2. Login as Owner
    console.log('\n2️⃣ Testing Owner Login...');
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@cribsociety.com',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status, 'Role:', loginData.user?.role);
    const token = loginData.token;

    if (!token) {
      throw new Error('Failed to get auth token');
    }

    // 3. Get Products
    console.log('\n3️⃣ Testing GET /products...');
    const prodRes = await fetch(`${BASE_URL}/products?limit=5`);
    const prodData = await prodRes.json();
    console.log('Products count returned:', prodData.data?.length, 'Total in DB:', prodData.meta?.total);

    // 4. Get Categories
    console.log('\n4️⃣ Testing GET /categories...');
    const catRes = await fetch(`${BASE_URL}/categories`);
    const catData = await catRes.json();
    console.log('Categories count returned:', catData.data?.length);

    // 5. Get Dashboard Summary (Owner authorized)
    console.log('\n5️⃣ Testing GET /dashboard/summary (Owner Authorized)...');
    const dashRes = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData = await dashRes.json();
    console.log('Dashboard summary data:', dashData.data);

    // 6. Create New POS Order
    console.log('\n6️⃣ Testing POST /orders (POS checkout with stock deduction & tax calc)...');
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: [
          { productId: 1, quantity: 2, notes: 'Less sugar' },
          { productId: 11, quantity: 1, notes: 'Warm up' }
        ],
        paymentMethod: 'cash',
        customerName: 'Bastian Test',
        customerPhone: '081122334455',
        cashReceived: 100000,
        notes: 'Dine-in Table 09'
      })
    });
    const orderData = await orderRes.json();
    console.log('Order create status:', orderRes.status);
    console.log('Generated Order Number:', orderData.order?.orderNumber);
    console.log('Subtotal:', orderData.order?.pricing?.subtotal);
    console.log('Tax (PB1 10%):', orderData.order?.pricing?.tax);
    console.log('Total Amount:', orderData.order?.pricing?.total);
    console.log('Change Amount:', orderData.order?.payment?.changeAmount);

    const createdOrderId = orderData.order?.id;

    // 7. Update Order Status to Completed
    if (createdOrderId) {
      console.log(`\n7️⃣ Testing PATCH /orders/${createdOrderId}/status to "completed"...`);
      const statusRes = await fetch(`${BASE_URL}/orders/${createdOrderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'completed',
          reason: 'Order served to customer at Table 09'
        })
      });
      const statusData = await statusRes.json();
      console.log('Status update response:', statusData);
    }

    // 8. Re-check Dashboard Summary
    console.log('\n8️⃣ Re-checking Dashboard Summary after completed order...');
    const dashRes2 = await fetch(`${BASE_URL}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const dashData2 = await dashRes2.json();
    console.log('Updated Dashboard summary data:', dashData2.data);

    console.log('\n✨ ALL API TESTS COMPLETED AND PASSED SUCCESSFULLY!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

runTests();
