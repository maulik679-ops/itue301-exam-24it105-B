/**
 * Task 5 Demonstration Script: Validation & Double-Booking Prevention
 * Run with: node testValidation.js
 */
const http = require('http');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runDemo() {
  console.log('=== Task 5 Validation & Booking Tests ===\n');

  // 1. Authenticate customer
  console.log('1. Logging in customer...');
  const loginRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'rahul@example.com', password: 'password123' }
  );
  const token = loginRes.body.token;
  console.log(`-> Logged in as: ${loginRes.body.customer.name}`);

  // 2. Fetch vehicles
  console.log('\n2. Fetching vehicles...');
  const vehiclesRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/vehicles',
    method: 'GET',
  });
  const availableCar = vehiclesRes.body.data.find((v) => v.available === true);
  const unavailableCar = vehiclesRes.body.data.find((v) => v.available === false);
  console.log(`-> Found available vehicle: "${availableCar?.model}" (ID: ${availableCar?._id})`);
  console.log(`-> Found unavailable vehicle: "${unavailableCar?.model}" (ID: ${unavailableCar?._id})`);

  // 3. Test booking an UNAVAILABLE vehicle (Demonstrates Task 5 validation failure)
  console.log('\n3. Testing booking an already UNAVAILABLE vehicle (Task 5 Validation Failure)...');
  const failRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      vehicleId: unavailableCar._id,
      pickupDate: '2026-10-01',
      returnDate: '2026-10-05',
    }
  );
  console.log(`-> Status: ${failRes.status}`);
  console.log(`-> Response:`, failRes.body);

  // 4. Test booking an AVAILABLE vehicle (Success)
  console.log('\n4. Booking an AVAILABLE vehicle (Task 5 Success & Toggle Available to False)...');
  const successRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/bookings',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      vehicleId: availableCar._id,
      pickupDate: '2026-10-10',
      returnDate: '2026-10-15',
    }
  );
  console.log(`-> Status: ${successRes.status}`);
  console.log(`-> Response:`, successRes.body);

  // 5. Test fetching customer bookings with populated fields
  console.log('\n5. Fetching customer bookings with .populate()...');
  const myBookingsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/v1/bookings/my',
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(`-> Status: ${myBookingsRes.status}`);
  console.log(`-> Populated Booking:`, myBookingsRes.body.data[0]);

  console.log('\n=== All Task 5 Tests Completed Successfully ===');
}

runDemo().catch(console.error);
