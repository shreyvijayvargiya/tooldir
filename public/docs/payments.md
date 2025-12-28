# Payments

SAAS starter boilerplate integrates with Polar for subscription and payment management. This document covers payment setup, checkout flow, webhooks, and subscription management.

## Payment Provider: Polar

Polar is a comprehensive payment platform designed for SaaS applications, handling subscriptions, one-time payments, and customer management.

### Setup

1. **Create Polar Account**
   - Visit [polar.sh](https://polar.sh)
   - Sign up for an account
   - Complete business verification

2. **Create Products and Plans**
   - Navigate to Products section
   - Create products (e.g., "Basic Plan", "Pro Plan")
   - Set pricing and billing intervals
   - Note the Product IDs

3. **Get API Credentials**
   - Navigate to Settings → API
   - Generate Access Token
   - Copy Webhook Secret
   - Add to `.env.local`:

   ```env
   POLAR_ACCESS_TOKEN=your_access_token
   POLAR_API_URL=https://api.polar.sh
   POLAR_WEBHOOK_SECRET=your_webhook_secret
   ```

4. **Configure Webhook**
   
   **For Production:**
   - Set webhook URL: `https://yourdomain.com/api/polar/webhook`
   - Select events to receive
   - Save webhook configuration
   
   **For Local Testing:**
   - Install ngrok: `npm install -g ngrok` or download from [ngrok.com](https://ngrok.com)
   - Start your local server: `npm run dev` (runs on port 3000)
   - In a new terminal, run: `ngrok http 3000`
   - Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
   - In Polar dashboard, set webhook URL: `https://abc123.ngrok.io/api/polar/webhook`
   - Select events to receive
   - Save webhook configuration
   - Now webhooks from Polar will be forwarded to your local server

## Checkout Flow

### Creating Checkout Session

**API Endpoint**: `POST /api/polar/checkout`

**Request**:
```javascript
const response = await fetch('/api/polar/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    planId: 'polar_product_id',
    customerId: 'optional_customer_id'
  })
});
```

**Response**:
```json
{
  "checkoutUrl": "https://polar.sh/checkout/...",
  "checkoutId": "checkout_session_id"
}
```

**Process**:
1. Client calls checkout API
2. Server creates Polar checkout session
3. Checkout record saved to Firestore
4. Returns checkout URL
5. Client redirects user to Polar checkout
6. User completes payment
7. Polar redirects back with success status

### Frontend Implementation

```javascript
const handleCheckout = async (planId) => {
  try {
    const response = await fetch('/api/polar/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId })
    });
    
    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl;
  } catch (error) {
    console.error('Checkout error:', error);
  }
};
```

## Webhooks

Polar sends webhook events for payment and subscription changes.

### Webhook Endpoint

**Location**: `pages/api/polar/webhook.js`

**Security**: Webhook signature verification

```javascript
// Signature verification
const signature = req.headers['polar-signature'];
const expectedSignature = crypto
  .createHmac('sha256', POLAR_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### Webhook Events

#### Subscription Events

**`subscription.created`**: New subscription created
- Store customer and subscription data
- Send confirmation email

**`subscription.updated`**: Subscription updated
- Update subscription status
- Update customer record
- Send update email if needed

**`subscription.canceled`**: Subscription canceled
- Update subscription status
- Set expiration date
- Send cancellation email

#### Payment Events

**`payment.created`**: Payment initiated
- Create payment record
- Update subscription status

**`payment.succeeded`**: Payment completed
- Update payment status
- Activate subscription
- Send confirmation email

**`payment.failed`**: Payment failed
- Update payment status
- Notify customer
- Handle retry logic

#### Customer Events

**`customer.created`**: New customer created
- Store customer data
- Link to user account if applicable

**`customer.updated`**: Customer updated
- Update customer record
- Sync with user data

### Webhook Handler

```javascript
export default async function handler(req, res) {
  // Verify signature
  // Handle event type
  switch (event.type) {
    case 'subscription.created':
      await handleSubscriptionEvent(event);
      break;
    case 'payment.succeeded':
      await handlePaymentEvent(event);
      break;
    // ... other events
  }
  return res.status(200).json({ received: true });
}
```

## Subscription Management

### Customer Data Structure

**Firestore Collection**: `customers`

```javascript
{
  id: "document_id",
  customerId: "polar_customer_id",
  subscriptionId: "polar_subscription_id",
  email: "customer@example.com",
  name: "Customer Name",
  planId: "polar_product_id",
  planName: "Pro Plan",
  status: "active" | "canceled" | "past_due",
  amount: 29.99,
  currency: "usd",
  expiresAt: "Timestamp",
  createdAt: "Timestamp",
  updatedAt: "Timestamp"
}
```

### Payment Records

**Firestore Collection**: `payments`

```javascript
{
  id: "polar_payment_id",
  paymentId: "polar_payment_id",
  customerId: "polar_customer_id",
  customerEmail: "customer@example.com",
  customerName: "Customer Name",
  amount: 29.99,
  currency: "usd",
  status: "succeeded" | "pending" | "failed",
  planId: "polar_product_id",
  planName: "Pro Plan",
  subscriptionId: "polar_subscription_id",
  paymentType: "subscription" | "payment",
  eventType: "payment.succeeded",
  createdAt: "Timestamp",
  updatedAt: "Timestamp"
}
```

## Canceling Subscriptions

### Cancel Subscription API

**Endpoint**: `POST /api/polar/cancel-subscription`

**Request**:
```javascript
const response = await fetch('/api/polar/cancel-subscription', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptionId: 'polar_subscription_id',
    customerId: 'polar_customer_id'
  })
});
```

**Process**:
1. Cancel subscription via Polar API
2. Update subscription status in Firestore
3. Set expiration date
4. Send cancellation email
5. Return success status

## Payment Utilities

### Location: `lib/utils/polar/`

#### Payment Utils (`paymentUtils.js`)

```javascript
// Store payment record
storePaymentRecord(paymentData)

// Validate payment data
validatePaymentData(payment)

// Get payment status from subscription
getPaymentStatusFromSubscription(status)

// Verify payment status
verifyPaymentStatus(status, customerId, subscriptionId)
```

#### Customer Utils (`customerUtils.js`)

```javascript
// Enrich customer data
enrichCustomerData(customerId, customerData)

// Store customer record
storeCustomerRecord(customerData)
```

#### Plan Utils (`planUtils.js`)

```javascript
// Enrich plan data
enrichPlanData(customerId, product, subscription)

// Get plan information
getPlanInfo(planId)
```

#### Date Utils (`dateUtils.js`)

```javascript
// Normalize date
normalizeDate(timestamp)

// Get Firestore date
getFirestoreDate(timestamp)
```

## Admin Panel Integration

### Payments Tab

**Location**: `app/admin/components/PaymentsTab.jsx`

**Features**:
- View all payments
- Filter by status, customer, plan
- View payment details
- Export payment data

### Customers Tab

**Location**: `app/admin/components/CustomersTab.jsx`

**Features**:
- View all customers
- View subscription details
- Cancel subscriptions
- View payment history

## Subscription Emails

Automated emails sent for subscription events:

1. **Confirmation Email**: Sent on subscription creation
2. **Cancellation Email**: Sent on subscription cancellation
3. **Upgrade Email**: Sent on plan upgrade

See the **Emailing** section for details.

## Testing Payments

### Test Mode

1. Use Polar test mode
2. Use test card numbers from Polar docs
3. Test webhook locally with ngrok
4. Verify data in Firestore

### Test Cards

Polar provides test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: Check Polar docs

### Local Webhook Testing

```bash
# Install ngrok
ngrok http 3000

# Update webhook URL in Polar dashboard
# Use ngrok URL: https://your-ngrok-url.ngrok.io/api/polar/webhook
```

## Error Handling

### Common Errors

1. **Invalid API Key**: Check `POLAR_ACCESS_TOKEN`
2. **Webhook Verification Failed**: Check `POLAR_WEBHOOK_SECRET`
3. **Product Not Found**: Verify `planId` exists in Polar
4. **Payment Failed**: Check customer payment method

### Error Responses

```javascript
// API errors
{
  error: "Error message",
  details: "Additional information"
}

// Webhook errors
// Logged to console, return 200 to prevent retries
```

## Security Considerations

1. **API Key Security**: Never commit API keys
2. **Webhook Verification**: Always verify signatures
3. **HTTPS**: Use HTTPS for webhook endpoints
4. **Data Validation**: Validate all webhook data
5. **Idempotency**: Handle duplicate webhook events

## Environment Variables

```env
POLAR_ACCESS_TOKEN=your_access_token
POLAR_API_URL=https://api.polar.sh
POLAR_WEBHOOK_SECRET=your_webhook_secret
```

## Payment Analytics

Track payment metrics:
- Total revenue
- Active subscriptions
- Churn rate
- Average revenue per user (ARPU)
- Payment success rate

Use Firestore queries or analytics tools to generate reports.

## Best Practices

1. **Webhook Reliability**: Always return 200 to acknowledge receipt
2. **Idempotency**: Check if event already processed
3. **Error Logging**: Log all errors for debugging
4. **Customer Communication**: Send emails for all events
5. **Data Sync**: Keep Firestore in sync with Polar
6. **Testing**: Test all payment flows thoroughly
7. **Monitoring**: Monitor webhook delivery and errors

