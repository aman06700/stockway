/**
 * K6 Load Testing Script for Backend Application
 *
 * This script tests all critical API endpoints with realistic load patterns.
 * Run with: k6 run load_test.js
 *
 * Test Coverage:
 * - Accounts: OTP send/verify, user profile
 * - Shopkeepers: nearby warehouses, orders, payments
 * - Warehouses: order management, assignments
 * - Riders: location updates, order status
 * - Orders: lifecycle transitions
 * - Analytics: various entity types
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

// Custom Metrics
const authFailures = new Counter('auth_failures');
const orderCreationRate = new Rate('order_creation_success');
const apiErrors = new Counter('api_errors');
const avgResponseTime = new Trend('custom_response_time');

// ============================================================================
// LOAD PROFILE - Staged Ramp Up/Down
// ============================================================================

export const options = {
  scenarios: {
    // Authentication flows - constant light load
    auth_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 10 },  // Ramp up to 10 users
        { duration: '3m', target: 10 },  // Stay at 10 users
        { duration: '1m', target: 0 },   // Ramp down
      ],
      gracefulRampDown: '30s',
      exec: 'testAuthFlow',
    },

    // Shopkeeper operations - medium load
    shopkeeper_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },  // Ramp up
        { duration: '3m', target: 50 },  // Peak load
        { duration: '2m', target: 50 },  // Sustained load
        { duration: '1m', target: 0 },   // Ramp down
      ],
      gracefulRampDown: '30s',
      exec: 'testShopkeeperFlow',
    },

    // Warehouse operations - medium load
    warehouse_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 15 },
        { duration: '3m', target: 40 },
        { duration: '2m', target: 40 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'testWarehouseFlow',
    },

    // Rider operations - high frequency location updates
    rider_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 30 },
        { duration: '3m', target: 100 }, // Peak load
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'testRiderFlow',
    },

    // Analytics - lower frequency
    analytics_flow: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 5 },
        { duration: '3m', target: 10 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'testAnalyticsFlow',
    },
  },

  // Performance Thresholds
  thresholds: {
    // 95% of requests should complete within 2s
    'http_req_duration': ['p(95)<2000', 'p(99)<5000'],

    // Error rate should be less than 5% (excluding intentional 4xx tests)
    'http_req_failed': ['rate<0.05'],

    // Custom metrics
    'order_creation_success': ['rate>0.8'],
    'custom_response_time': ['avg<1000', 'p(95)<2000'],

    // Specific endpoint checks
    'http_req_duration{endpoint:auth}': ['p(95)<1000'],
    'http_req_duration{endpoint:orders}': ['p(95)<1500'],
    'http_req_duration{endpoint:riders}': ['p(95)<800'],
  },
};

// ============================================================================
// SETUP - Prepare Mock Tokens
// ============================================================================

export function setup() {
  console.log('🚀 Starting K6 Load Test');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log('⏰ Test Duration: ~7 minutes per scenario');

  // Mock JWT tokens for different user roles
  // In production, these would be real tokens from Supabase
  const tokens = {
    shopkeeper: generateMockToken('shopkeeper'),
    warehouse: generateMockToken('warehouse_admin'),
    rider: generateMockToken('rider'),
    admin: generateMockToken('super_admin'),
  };

  // Mock entity IDs for testing
  const testData = {
    warehouseIds: [1, 2, 3, 4, 5],
    itemIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    orderIds: [1, 2, 3, 4, 5],
    riderIds: [1, 2, 3],
  };

  return { tokens, testData };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateMockToken(role) {
  // Generate a mock JWT token structure
  // NOTE: These are PLACEHOLDER tokens. The backend must accept them OR
  // you should replace with real tokens from your Supabase instance
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: `user_${role}_${Math.floor(Math.random() * 1000)}`,
    role: role,
    email: `test_${role}@example.com`,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  }));
  const signature = 'mock_signature_' + Math.random().toString(36).substring(7);

  return `${header}.${payload}.${signature}`;
}

function getHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function recordMetrics(response, endpoint) {
  avgResponseTime.add(response.timings.duration, { endpoint });

  if (response.status >= 400) {
    apiErrors.add(1);
  }
}

// ============================================================================
// TEST SCENARIOS
// ============================================================================

/**
 * Authentication Flow Tests
 * Tests OTP send/verify and user profile endpoints
 */
export function testAuthFlow(data) {
  group('Authentication Flow', () => {

    // Test 1: Send OTP - Valid Email
    group('Send OTP - Valid', () => {
      const payload = {
        email: `testuser${randomInt(1, 1000)}@example.com`,
      };

      const response = http.post(
        `${BASE_URL}/api/accounts/send-otp/`,
        JSON.stringify(payload),
        { headers: getHeaders(), tags: { endpoint: 'auth' } }
      );

      check(response, {
        'send-otp: status is 200': (r) => r.status === 200,
        'send-otp: success field present': (r) => {
          try {
            return JSON.parse(r.body).success === true;
          } catch (e) {
            return false;
          }
        },
        'send-otp: response time < 1s': (r) => r.timings.duration < 1000,
      });

      recordMetrics(response, 'auth');
    });

    sleep(0.5);

    // Test 2: Send OTP - Invalid Email (error case)
    group('Send OTP - Invalid', () => {
      const payload = {
        email: 'invalid-email',
      };

      const response = http.post(
        `${BASE_URL}/api/accounts/send-otp/`,
        JSON.stringify(payload),
        { headers: getHeaders(), tags: { endpoint: 'auth' } }
      );

      check(response, {
        'send-otp invalid: status is 400': (r) => r.status === 400,
      });

      recordMetrics(response, 'auth');
    });

    sleep(0.5);

    // Test 3: Verify OTP - Mock attempt
    group('Verify OTP', () => {
      const payload = {
        email: `testuser${randomInt(1, 1000)}@example.com`,
        token: '123456', // Mock OTP
      };

      const response = http.post(
        `${BASE_URL}/api/accounts/verify-otp/`,
        JSON.stringify(payload),
        { headers: getHeaders(), tags: { endpoint: 'auth' } }
      );

      // This will likely fail without valid OTP, which is expected
      check(response, {
        'verify-otp: response received': (r) => r.status !== 0,
        'verify-otp: status is 200 or 400': (r) =>
          r.status === 200 || r.status === 400 || r.status === 401,
      });

      if (response.status !== 200) {
        authFailures.add(1);
      }

      recordMetrics(response, 'auth');
    });

    sleep(1);

    // Test 4: Get Current User Profile
    group('Get User Profile', () => {
      const response = http.get(
        `${BASE_URL}/api/accounts/me/`,
        { headers: getHeaders(data.tokens.shopkeeper), tags: { endpoint: 'auth' } }
      );

      check(response, {
        'me: response received': (r) => r.status !== 0,
        'me: status is 200 or 401': (r) => r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'auth');
    });

  });

  sleep(randomInt(1, 3));
}

/**
 * Shopkeeper Flow Tests
 * Tests order creation, listing, warehouse browsing, payments
 */
export function testShopkeeperFlow(data) {
  const token = data.tokens.shopkeeper;

  group('Shopkeeper Flow', () => {

    // Test 1: Get Nearby Warehouses
    group('Nearby Warehouses', () => {
      const params = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        radius: 10000,
      };

      const url = `${BASE_URL}/api/shopkeepers/warehouses/nearby/?latitude=${params.latitude}&longitude=${params.longitude}&radius=${params.radius}`;

      const response = http.get(
        url,
        { headers: getHeaders(token), tags: { endpoint: 'shopkeepers' } }
      );

      check(response, {
        'nearby-warehouses: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
        'nearby-warehouses: response is array or error': (r) => {
          try {
            const body = JSON.parse(r.body);
            return Array.isArray(body) || body.detail || body.error;
          } catch (e) {
            return false;
          }
        },
      });

      recordMetrics(response, 'shopkeepers');
    });

    sleep(1);

    // Test 2: Browse Inventory
    group('Browse Inventory', () => {
      const warehouseId = randomChoice(data.testData.warehouseIds);
      const url = `${BASE_URL}/api/shopkeepers/inventory/browse/?warehouse=${warehouseId}`;

      const response = http.get(
        url,
        { headers: getHeaders(token), tags: { endpoint: 'shopkeepers' } }
      );

      check(response, {
        'browse-inventory: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'shopkeepers');
    });

    sleep(1);

    // Test 3: Create Order - Valid
    group('Create Order - Valid', () => {
      const payload = {
        warehouse: randomChoice(data.testData.warehouseIds),
        items: [
          {
            item_id: randomChoice(data.testData.itemIds),
            quantity: randomInt(1, 10),
          },
          {
            item_id: randomChoice(data.testData.itemIds),
            quantity: randomInt(1, 5),
          },
        ],
        notes: `Load test order at ${new Date().toISOString()}`,
      };

      const response = http.post(
        `${BASE_URL}/api/shopkeepers/orders/create/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      const success = check(response, {
        'create-order: status is 201 or 400/401': (r) =>
          r.status === 201 || r.status === 400 || r.status === 401,
        'create-order: response has data': (r) => r.body.length > 0,
      });

      orderCreationRate.add(success && response.status === 201);
      recordMetrics(response, 'orders');
    });

    sleep(0.5);

    // Test 4: Create Order - Invalid (duplicate items)
    group('Create Order - Invalid', () => {
      const itemId = randomChoice(data.testData.itemIds);
      const payload = {
        warehouse: randomChoice(data.testData.warehouseIds),
        items: [
          { item_id: itemId, quantity: 5 },
          { item_id: itemId, quantity: 3 }, // Duplicate item
        ],
      };

      const response = http.post(
        `${BASE_URL}/api/shopkeepers/orders/create/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'create-order-invalid: status is 400 or 401': (r) =>
          r.status === 400 || r.status === 401,
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 5: List Orders
    group('List Orders', () => {
      const response = http.get(
        `${BASE_URL}/api/shopkeepers/orders/`,
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'list-orders: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
        'list-orders: response time < 1.5s': (r) => r.timings.duration < 1500,
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 6: Get Order Details
    group('Order Details', () => {
      const orderId = randomChoice(data.testData.orderIds);

      const response = http.get(
        `${BASE_URL}/api/shopkeepers/orders/${orderId}/`,
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'order-detail: status is 200, 404, or 401': (r) =>
          r.status === 200 || r.status === 404 || r.status === 401,
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 7: Payment List
    group('Payment List', () => {
      const response = http.get(
        `${BASE_URL}/api/shopkeepers/payments/`,
        { headers: getHeaders(token), tags: { endpoint: 'shopkeepers' } }
      );

      check(response, {
        'payments: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'shopkeepers');
    });

    sleep(1);

    // Test 8: Payment Summary
    group('Payment Summary', () => {
      const response = http.get(
        `${BASE_URL}/api/shopkeepers/payments/summary/`,
        { headers: getHeaders(token), tags: { endpoint: 'shopkeepers' } }
      );

      check(response, {
        'payment-summary: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'shopkeepers');
    });

  });

  sleep(randomInt(2, 5));
}

/**
 * Warehouse Flow Tests
 * Tests order management, acceptance/rejection, rider assignment
 */
export function testWarehouseFlow(data) {
  const token = data.tokens.warehouse;

  group('Warehouse Flow', () => {

    // Test 1: List All Orders
    group('List Warehouse Orders', () => {
      const response = http.get(
        `${BASE_URL}/api/orders/warehouse/orders/`,
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'warehouse-orders: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
        'warehouse-orders: response time < 1.5s': (r) => r.timings.duration < 1500,
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 2: List Pending Orders
    group('Pending Orders', () => {
      const response = http.get(
        `${BASE_URL}/api/orders/warehouse/orders/pending/`,
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'pending-orders: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 3: Accept Order
    group('Accept Order', () => {
      const orderId = randomChoice(data.testData.orderIds);

      const response = http.post(
        `${BASE_URL}/api/orders/warehouse/orders/${orderId}/accept/`,
        JSON.stringify({}),
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'accept-order: status is 200, 400, 404, or 401': (r) =>
          [200, 400, 404, 401].includes(r.status),
      });

      recordMetrics(response, 'orders');
    });

    sleep(0.5);

    // Test 4: Reject Order
    group('Reject Order', () => {
      const orderId = randomChoice(data.testData.orderIds);
      const payload = {
        reason: 'Out of stock - load test',
      };

      const response = http.post(
        `${BASE_URL}/api/orders/warehouse/orders/${orderId}/reject/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'reject-order: status is 200, 400, 404, or 401': (r) =>
          [200, 400, 404, 401].includes(r.status),
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 5: Assign Rider
    group('Assign Rider', () => {
      const orderId = randomChoice(data.testData.orderIds);
      const riderId = randomChoice(data.testData.riderIds);
      const payload = {
        rider_id: riderId,
      };

      const response = http.post(
        `${BASE_URL}/api/orders/warehouse/orders/${orderId}/assign/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'orders' } }
      );

      check(response, {
        'assign-rider: response received': (r) => r.status !== 0,
        'assign-rider: status is 200, 400, 404, or 401': (r) =>
          [200, 400, 404, 401].includes(r.status),
      });

      recordMetrics(response, 'orders');
    });

    sleep(1);

    // Test 6: List Warehouses
    group('List Warehouses', () => {
      const response = http.get(
        `${BASE_URL}/api/warehouses/`,
        { headers: getHeaders(token), tags: { endpoint: 'warehouses' } }
      );

      check(response, {
        'list-warehouses: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'warehouses');
    });

    sleep(1);

    // Test 7: Get Warehouse Detail
    group('Warehouse Detail', () => {
      const warehouseId = randomChoice(data.testData.warehouseIds);

      const response = http.get(
        `${BASE_URL}/api/warehouses/${warehouseId}/`,
        { headers: getHeaders(token), tags: { endpoint: 'warehouses' } }
      );

      check(response, {
        'warehouse-detail: status is 200, 404, or 401': (r) =>
          [200, 404, 401].includes(r.status),
      });

      recordMetrics(response, 'warehouses');
    });

  });

  sleep(randomInt(2, 4));
}

/**
 * Rider Flow Tests
 * Tests location updates, order listing, status changes
 */
export function testRiderFlow(data) {
  const token = data.tokens.rider;

  group('Rider Flow', () => {

    // Test 1: Update Location (high frequency)
    group('Update Location', () => {
      const payload = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.05,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.05,
      };

      const response = http.post(
        `${BASE_URL}/api/riders/rider/location/update/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'location-update: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
        'location-update: response time < 800ms': (r) => r.timings.duration < 800,
      });

      recordMetrics(response, 'riders');
    });

    sleep(0.3);

    // Test 2: Get Rider Profile
    group('Rider Profile', () => {
      const response = http.get(
        `${BASE_URL}/api/riders/rider/profile/`,
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'rider-profile: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'riders');
    });

    sleep(0.5);

    // Test 3: Get Assigned Orders
    group('Rider Orders', () => {
      const response = http.get(
        `${BASE_URL}/api/riders/rider/orders/`,
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'rider-orders: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'riders');
    });

    sleep(1);

    // Test 4: Update Order Status
    group('Update Order Status', () => {
      const orderId = randomChoice(data.testData.orderIds);
      const statuses = ['picked_up', 'in_transit', 'delivered'];
      const payload = {
        order_id: orderId,
        status: randomChoice(statuses),
      };

      const response = http.post(
        `${BASE_URL}/api/riders/rider/orders/update/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'update-order-status: response received': (r) => r.status !== 0,
        'update-order-status: status is 200, 400, 404, or 401': (r) =>
          [200, 400, 404, 401].includes(r.status),
      });

      recordMetrics(response, 'riders');
    });

    sleep(0.5);

    // Test 5: Get Earnings
    group('Rider Earnings', () => {
      const response = http.get(
        `${BASE_URL}/api/riders/rider/earnings/`,
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'rider-earnings: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'riders');
    });

    sleep(0.5);

    // Test 6: Get Performance Metrics
    group('Rider Performance', () => {
      const response = http.get(
        `${BASE_URL}/api/riders/rider/performance/`,
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'rider-performance: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'riders');
    });

    sleep(0.5);

    // Test 7: Update Availability
    group('Update Availability', () => {
      const statuses = ['available', 'busy', 'offline'];
      const payload = {
        status: randomChoice(statuses),
      };

      const response = http.patch(
        `${BASE_URL}/api/riders/rider/availability/update/`,
        JSON.stringify(payload),
        { headers: getHeaders(token), tags: { endpoint: 'riders' } }
      );

      check(response, {
        'update-availability: response received': (r) => r.status !== 0,
      });

      recordMetrics(response, 'riders');
    });

  });

  sleep(randomInt(1, 3));
}

/**
 * Analytics Flow Tests
 * Tests various analytics endpoints for different entity types
 */
export function testAnalyticsFlow(data) {
  const token = data.tokens.admin;

  group('Analytics Flow', () => {

    // Test 1: System Analytics
    group('System Analytics', () => {
      const url = `${BASE_URL}/api/analytics/?ref_type=system`;

      const response = http.get(
        url,
        { headers: getHeaders(token), tags: { endpoint: 'analytics' } }
      );

      check(response, {
        'system-analytics: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
        'system-analytics: response time < 2s': (r) => r.timings.duration < 2000,
      });

      recordMetrics(response, 'analytics');
    });

    sleep(2);

    // Test 2: Warehouse Analytics
    group('Warehouse Analytics', () => {
      const warehouseId = randomChoice(data.testData.warehouseIds);
      const url = `${BASE_URL}/api/analytics/?ref_type=warehouse&ref_id=${warehouseId}`;

      const response = http.get(
        url,
        { headers: getHeaders(token), tags: { endpoint: 'analytics' } }
      );

      check(response, {
        'warehouse-analytics: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'analytics');
    });

    sleep(2);

    // Test 3: Rider Analytics
    group('Rider Analytics', () => {
      const riderId = randomChoice(data.testData.riderIds);
      const url = `${BASE_URL}/api/analytics/?ref_type=rider&ref_id=${riderId}`;

      const response = http.get(
        url,
        { headers: getHeaders(token), tags: { endpoint: 'analytics' } }
      );

      check(response, {
        'rider-analytics: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'analytics');
    });

    sleep(2);

    // Test 4: Shopkeeper Analytics
    group('Shopkeeper Analytics', () => {
      const url = `${BASE_URL}/api/analytics/?ref_type=shopkeeper`;

      const response = http.get(
        url,
        { headers: getHeaders(data.tokens.shopkeeper), tags: { endpoint: 'analytics' } }
      );

      check(response, {
        'shopkeeper-analytics: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'analytics');
    });

    sleep(2);

    // Test 5: Analytics by Date
    group('Analytics by Date', () => {
      const date = '2025-12-07';
      const url = `${BASE_URL}/api/analytics/?date=${date}`;

      const response = http.get(
        url,
        { headers: getHeaders(token), tags: { endpoint: 'analytics' } }
      );

      check(response, {
        'analytics-by-date: status is 200 or 401': (r) =>
          r.status === 200 || r.status === 401,
      });

      recordMetrics(response, 'analytics');
    });

  });

  sleep(randomInt(3, 6));
}

// ============================================================================
// TEARDOWN - Summary
// ============================================================================

export function teardown(data) {
  console.log('');
  console.log('='.repeat(60));
  console.log('📊 K6 Load Test Complete');
  console.log('='.repeat(60));
  console.log('');
  console.log('Key Metrics:');
  console.log('  - Total API Errors:', apiErrors.name);
  console.log('  - Auth Failures:', authFailures.name);
  console.log('  - Order Creation Success Rate:', 'See metrics above');
  console.log('');
  console.log('Review detailed metrics and thresholds above.');
  console.log('Check for any failed thresholds marked with ✗');
  console.log('');
}

// ============================================================================
// DEFAULT EXPORT (for single scenario testing)
// ============================================================================

/**
 * Default function for quick smoke tests
 * Run with: k6 run --iterations 10 load_test.js
 */
export default function(data) {
  // Quick smoke test of all major endpoints
  const responses = http.batch([
    ['GET', `${BASE_URL}/api/accounts/me/`, null, { headers: getHeaders() }],
    ['GET', `${BASE_URL}/api/warehouses/`, null, { headers: getHeaders() }],
    ['GET', `${BASE_URL}/api/analytics/`, null, { headers: getHeaders() }],
  ]);

  responses.forEach((response, index) => {
    check(response, {
      [`batch-${index}: status not 0`]: (r) => r.status !== 0,
    });
  });

  sleep(1);
}

