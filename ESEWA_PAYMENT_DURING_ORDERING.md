# eSewa Payment During Food Ordering - Complete Guide

## 🎯 Overview

Your EPOS system now supports **eSewa payment directly during the ordering process**. Customers can pay immediately after placing their order without waiting for the cashier.

---

## 📍 Where Payment Options Are Available

### 1. **Waiter/Staff Order Entry** (During Order Creation)
- **URL**: `/waiter/order-entry/:tableId`
- **Who**: Waiters creating orders for dine-in customers
- **When**: After selecting menu items and reviewing cart
- **Flow**: 
  1. Waiter adds items to cart
  2. Clicks "Send for Preparation"
  3. **Payment modal appears** with 4 payment options
  4. Waiter can select eSewa
  5. Customer is redirected to eSewa to pay

### 2. **Customer Self-Checkout** (For Direct Orders)
- **URL**: `/checkout?order_id=123`
- **Who**: Customers checking out their own orders
- **When**: After order is created or ready for payment
- **Flow**:
  1. Customer navigates to checkout
  2. Sees order summary with total
  3. **Selects payment method** (Cash, eSewa, Card, Khalti)
  4. If eSewa → Redirected to eSewa payment
  5. After payment → Confirmation page

### 3. **Cashier Billing Screen** (Traditional Billing)
- **URL**: `/cashier/billing`
- **Who**: Cashier staff
- **When**: When collecting payment at counter
- **Methods Available**: Cash, Card, eSewa, Khalti
- **Status**: Already integrated (see ESEWA_PAYMENT_SETUP.md)

---

## 🧪 Test Scenario: Paying During Order

### Step 1: Waiter Creates Order
```
1. Log in as: waiter@restaurant.com / waiter123
2. Go to: http://localhost:5173/waiter
3. Click on a table
4. Select menu items and add to cart
```

### Step 2: Waiter Triggers Payment Option
```
5. Click "Send for Preparation"
6. Payment modal appears with 4 options:
   - 💵 Cash
   - 📱 eSewa ← SELECT THIS
   - 💳 Card
   - 📲 Khalti
```

### Step 3: eSewa Payment Redirect
```
7. Select eSewa payment method
8. Blue info box appears: "eSewa Payment"
9. Click "Pay via eSewa" button
10. ✅ REDIRECTED to eSewa UAT payment page
```

### Step 4: Complete eSewa Payment
```
11. On eSewa page, payment auto-approves in UAT
12. Redirects back to: /payment/pending (verification)
13. Backend verifies transaction with eSewa server
14. ✅ Success page shows: Payment Confirmed
15. Order marked as PAID in system
```

---

## 🔄 Complete Payment Flow During Ordering

```
┌──────────────────────────────────┐
│ Waiter Creating Order             │
│ - Selects items                   │
│ - Adds to cart                    │
│ - Reviews total                   │
└──────────────┬────────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│ Waiter clicks:                    │
│ "Send for Preparation"            │
└──────────────┬────────────────────┘
               │
               ▼
        ┌──────────────┐
        │ PAYMENT      │
        │ MODAL OPENS  │
        │              │
        │ 4 options:   │
        │ - Cash       │
        │ - eSewa    ◄──── SELECT THIS
        │ - Card       │
        │ - Khalti     │
        └──────┬───────┘
               │
               ▼
      ┌─────────────────┐
      │ eSewa Selected  │
      │                 │
      │ Click:          │
      │ "Pay via eSewa" │
      └────────┬────────┘
               │
               ▼
  ┌────────────────────────┐
  │ Frontend Creates Form  │
  │ (Hidden, MD5 signed)   │
  └────────────┬───────────┘
               │
               ▼
  ┌────────────────────────┐
  │ Submits to eSewa UAT   │
  │ https://uat.esewa...   │
  │ (Customer sees eSewa)  │
  └────────────┬───────────┘
               │
               ▼
  ┌────────────────────────┐
  │ UAT Auto-Approves      │
  │ (Test env feature)     │
  │                        │
  │ Redirects to:          │
  │ /payment/pending       │
  └────────────┬───────────┘
               │
               ▼
  ┌────────────────────────┐
  │ Backend Verifies       │
  │ - MD5 signature check  │
  │ - Amount verification  │
  │ - eSewa API call       │
  │ - Mark order PAID      │
  │ - Create payment record│
  └────────────┬───────────┘
               │
    ┌──────────┴──────────┐
    │                     │
   ✅                    ❌
 SUCCESS              FAILURE
    │                     │
    ▼                     ▼
/payment/success    /payment/failure
Order: PAID         Order: UNPAID
```

---

## 💳 eSewa Test Credentials

```
Merchant Code: EPAYTEST
Merchant Secret: 8gBm/:&EnhH.1/q
Environment: eSewa UAT (Test – NO charges)
```

**Key Features in Test Mode:**
- ✅ Unlimited test transactions
- ✅ Auto-approve all payments
- ✅ No actual money deducted
- ✅ Instant success confirmation
- ✅ Perfect for testing payment flow

---

## 🎯 All Payment Methods During Ordering

### 💵 **Cash Payment**
- Method: `cash`
- Flow: Order confirmed, payment collected at counter
- Status: Not immediately marked as paid

### 📱 **eSewa Payment** (NEW!)
- Method: `esewa`
- Flow: **Redirects to eSewa → Payment → Verification → Order Marked Paid**
- Status: Immediately marked as paid after verification
- Badge: Primary action button
- Test Mode: Uses EPAYTEST account

### 💳 **Card Payment*
- Method: `card`
- Flow: Currently in mock mode (for testing)
- Status: Marks order as paid when confirmed
- Test Mode: Auto-approves

### 📲 **Khalti Payment**
- Method: `khalti`
- Flow: Currently in mock mode (for future integration)
- Status: Marks order as paid when confirmed
- Test Mode: Auto-approves

---

## 📋 Implementation Details

### Frontend Components Updated

#### 1. **OrderEntry.jsx** (Waiter Interface)
- Added payment method selector modal
- Added eSewa form generation
- Session storage for pending payments
- Better error handling and logging

**Key Functions:**
```javascript
processPayment() // Handles all payment methods
esewaInitiate() // Calls backend to start eSewa
esewaVerify() // Verifies eSewa callback
```

#### 2. **Checkout.jsx** (Customer Self-Checkout)
- New customer-facing checkout page
- Order summary display
- Payment method selector
- Direct eSewa integration
- Success/failure handling

**Routes:**
```
/checkout?order_id=123  // Customer checkout
/payment/success        // After successful payment
/payment/failure        // After failed payment
/payment/pending        // During verification
```

### Backend Integration

#### eSewa API Endpoints (Already Implemented)
- `POST /api/payments/esewa_initiate/`
  - Input: `order_id`
  - Output: payment form data + eSewa URL
  
- `POST /api/payments/esewa_verify/`
  - Input: eSewa callback data
  - Output: payment status + order status update

---

## 🚀 How to Test Now

### Option 1: Waiter Creates Order with Payment

1. **Login as Waiter**
   ```
   Email: waiter@restaurant.com
   Password: waiter123
   ```

2. **Navigate to Waiter Interface**
   ```
   URL: http://localhost:5173/waiter
   ```

3. **Create Order**
   - Click on a table
   - Add menu items
   - Review cart with total

4. **Select eSewa Payment**
   - Click "Send for Preparation"
   - Modal: Select eSewa option
   - Click "Pay via eSewa"
   - Redirected to eSewa (auto-approves)
   - Success confirmation

### Option 2: Direct Customer Checkout

1. **Login as Customer or Staff**

2. **Navigate to Checkout**
   ```
   URL: http://localhost:5173/checkout?order_id=1
   ```

3. **Select eSewa Payment**
   - See order summary
   - Select eSewa payment method
   - Click "Pay via eSewa"
   - Complete payment on eSewa
   - Back to success page

---

## 📊 Order Status After Payment

### Before Payment
```
Order Status: 'confirmed' or 'pending'
Payment Status: 'unpaid'
Badge: ⚠️ Pending
```

### After eSewa Payment
```
Order Status: 'paid'
Payment Status: 'completed'
Badge: ✅ Paid
```

---

## 🔒 Security Features

### Form Submission
- ✅ MD5 signature encryption
- ✅ Hidden form fields
- ✅ HTTPS redirect to eSewa
- ✅ Session tracking

### Verification
- ✅ Backend signature validation
- ✅ Amount verification
- ✅ eSewa API confirmation call
- ✅ Transaction UUID tracking

### Data Protection
- ✅ No sensitive data in logs
- ✅ Payment sent directly to eSewa
- ✅ Secure callback verification
- ✅ Session storage for pending orders

---

## ⚠️ Troubleshooting

### Issue: Payment Modal Doesn't Appear
**Solution:**
- Ensure backend is running
- Check browser console (F12) for errors
- Verify order was created successfully

### Issue: eSewa Page Shows 404
**Solution:**
- Check ESEWA_MERCHANT_CODE = "EPAYTEST"
- Verify eSewa configuration in settings.py
- Check backend logs for errors

### Issue: Payment Stuck on "Pending"
**Solution:**
- Check backend logs for verification errors
- Verify transaction UUID matches
- Check eSewa UAT status
- Restart backend server

### Issue: Redirected But Nothing Happens
**Solution:**
- Clear browser cache (Ctrl+Shift+Del)
- Check browser console for JS errors
- Verify API endpoints are accessible
- Check network requests in DevTools

---

## 📱 User Experience Flow

### For Waiter
1. ➕ Add items to cart (quick + intuitive)
2. 💰 Click "Send for Preparation"
3. 🎯 Select payment method instantly
4. 📱 Click "Pay via eSewa"
5. ✅ eSewa redirects back automatically
6. 🎉 Order marked as PAID immediately

### For Customer
1. 🛒 Checkout page shows order summary
2. 💳 4 payment method options
3. 📱 Select eSewa
4. 🔐 Click "Pay via eSewa"
5. 🎫 eSewa payment page (auto-approves in test)
6. ✅ Redirected to success page
7. 📧 Order confirmation

---

## 💰 Revenue Benefits

### Before This Update
- ❌ Payment only at cashier counter
- ❌ Delayed payment processing
- ❌ Limited payment methods
- ❌ Waiter had to wait for billing

### After This Update
- ✅ Instant payment during ordering
- ✅ Multiple payment methods (4 options)
- ✅ Real eSewa integration with UAT testing
- ✅ Waiter can complete transaction flow
- ✅ Reduced counter congestion
- ✅ Faster table turnover

---

## 🌍 Production Deployment

### Switch to Live eSewa

1. **Get Production Account**
   - Register at: https://esewa.com.np
   - Receive: Production merchant code + secret

2. **Update Configuration**
   ```python
   # .env file
   ESEWA_MERCHANT_CODE=YOUR_LIVE_CODE
   ESEWA_MERCHANT_SECRET=YOUR_LIVE_SECRET
   ESEWA_USE_TEST=False
   ```

3. **Deploy**
   ```bash
   git commit -m "Switch to production eSewa"
   git push
   # Deploy to production
   ```

4. **You're LIVE!** 🚀
   - Real payments processed
   - Money transferred to your account
   - Production security enabled

---

## 📞 Support & Next Steps

1. **Test the payment flow** with EPAYTEST credentials
2. **Report any issues** in browser console
3. **When ready**, register production eSewa account
4. **Update .env** with live credentials
5. **Deploy to production**

---

## ✨ Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| eSewa Test Account | ✅ Ready | EPAYTEST / 8gBm/:&EnhH.1/q |
| Waiter Payment | ✅ Live | /waiter/order-entry/:tableId |
| Customer Checkout | ✅ Live | /checkout?order_id=123 |
| Cashier Billing | ✅ Live | /cashier/billing |
| eSewa Verification | ✅ Live | Backend auto-verification |
| Order Auto-Update | ✅ Live | After payment confirmation |
| Success Pages | ✅ Live | /payment/success/failure |
| Production Ready | ✅ Easy | Update .env + deploy |

---

**Start accepting eSewa payments now!** 🎉
