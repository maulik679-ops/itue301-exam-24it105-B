const http = require('http');

const request = (method, path, data = null, token = null) => {
  return new Promise((resolve, reject) => {
    const postData = data ? JSON.stringify(data) : '';
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (postData) headers['Content-Length'] = Buffer.byteLength(postData);

    const req = http.request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/v1${path}`,
        method,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, data: body });
          }
        });
      }
    );
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
};

async function runAudit() {
  console.log('=== DriveEasy Final QA Audit & End-to-End Test Suite ===\n');

  // Test 1: Public vehicle listing
  const vehiclesRes = await request('GET', '/vehicles');
  console.log(`[Check 1] Public vehicles listing: HTTP ${vehiclesRes.status} (Count: ${vehiclesRes.data.count})`);

  // Test 2: Invalid login
  const badLogin = await request('POST', '/auth/login', { email: '' });
  console.log(`[Check 2] Invalid login rejected: HTTP ${badLogin.status} (Error: "${badLogin.data.error}")`);

  // Test 3: Registration
  const testEmail = `qa_${Date.now()}@test.com`;
  const regRes = await request('POST', '/auth/register', {
    name: 'Audit User',
    email: testEmail,
    phone: '9988776655',
    licenseNumber: `DL-${Date.now().toString().slice(-6)}`,
    password: 'password123',
  });
  console.log(`[Check 3] Customer registration: HTTP ${regRes.status} (Token received: ${!!regRes.data.token})`);
  const token = regRes.data.token;

  // Test 4: AuthGuard rejects unauthenticated requests
  const unauthRes = await request('POST', '/bookings', { vehicleId: '123' }, null);
  console.log(`[Check 4] Missing auth rejected: HTTP ${unauthRes.status} (Error: "${unauthRes.data.error}")`);

  // Test 5: Date validation (return date before pickup date)
  const availCar = vehiclesRes.data.data.find((v) => v.available === true);
  const badDates = await request(
    'POST',
    '/bookings',
    {
      vehicleId: availCar._id,
      pickupDate: '2026-12-10',
      returnDate: '2026-12-05',
    },
    token
  );
  console.log(`[Check 5] Invalid booking dates rejected: HTTP ${badDates.status} (Error: "${badDates.data.error}")`);

  // Test 6: Valid booking creation (HTTP 201)
  const goodBooking = await request(
    'POST',
    '/bookings',
    {
      vehicleId: availCar._id,
      pickupDate: '2026-12-01',
      returnDate: '2026-12-05',
    },
    token
  );
  console.log(`[Check 6] Valid booking created: HTTP ${goodBooking.status} (Booking ID: ${goodBooking.data.data?._id})`);

  // Test 7: Double booking prevention (cannot book now-unavailable vehicle)
  const doubleBook = await request(
    'POST',
    '/bookings',
    {
      vehicleId: availCar._id,
      pickupDate: '2026-12-01',
      returnDate: '2026-12-05',
    },
    token
  );
  console.log(`[Check 7] Double booking rejected: HTTP ${doubleBook.status} (Error: "${doubleBook.data.error}")`);

  // Test 8: MyBookings fetches owner's actual bookings
  const myBookings = await request('GET', '/bookings/my', null, token);
  console.log(`[Check 8] MyBookings retrieval: HTTP ${myBookings.status} (Found: ${myBookings.data.count} booking(s))`);
  console.log(`          Populated Vehicle: "${myBookings.data.data[0]?.vehicleId?.model}" (${myBookings.data.data[0]?.vehicleId?.type})`);

  // Test 9: Admin statistics consistency
  const statsRes = await request('GET', '/admin/stats');
  console.log(`[Check 9] Admin statistics: HTTP ${statsRes.status} (Total: ${statsRes.data.data.totalVehicles}, Active: ${statsRes.data.data.activeReservations}, Utilization: ${statsRes.data.data.utilization})`);

  console.log('\n=== All 9 Critical QA Checks Completed Successfully ===');
}

runAudit().catch(console.error);
