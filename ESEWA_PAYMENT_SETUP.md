# eSewa Payment Integration - Complete Setup Guide

## 📱 Test Account Details

### Your Free eSewa Test Account
```
Merchant Code: EPAYTEST
Merchant Secret: 8gBm/:&EnhH.1/q
Environment: eSewa UAT (Free Test Environment)
```

⚠️ **IMPORTANT**: These are free test credentials for Nepal's eSewa payment system. Use only for testing/development.

---

## 🎯 Where Payment Buttons Available

### 1. **Cashier Billing Screen** (Main Payment Interface)
- **Location**: `/cashier/billing`
- **Who uses it**: Billing staff at payment counter
- **Payment methods available**:
  - 💵 **Cash** - Direct cash payment
  - 💳 **Card** - Credit/Debit card (mock)
  - 📱 **eSewa** - Real eSewa payment integration (redirects to eSewa)
  - 📲 **Khalti** - Khalti payment (mock)

**How it works:**
1. Order appears in billing queue
2. Cashier clicks "Bill" button
3. Invoice modal opens with payment method selector
4. Cashier selects **eSewa**
5. Clicks "Complete Payment"
6. Redirects to eSewa UAT environment
7. After payment, redirects back with status

### 2. **Payment Status Pages** (After Payment)
- **Success**: `/payment/success` - Shows payment confirmation
- **Failure**: `/payment/failure` - Shows error and retry option
- **Pending**: `/payment/pending` - Loading state during verification

---

## 🧪 How to Test eSewa Payment

### Prerequisites
- Backend running: `http://localhost:8000`
- Frontend running: `http://localhost:5173`
- Demo order ready for billing

### Step-by-Step Test

#### 1. Create a Test Order (as Waiter)
```
1. Go to http://localhost:5173/waiter
2. Select a table
3. Add menu items
4. Create order
```

#### 2. Navigate to Billing
```
1. Go to http://localhost:5173/cashier/billing
2. You should see the order in the queue
```

#### 3. Process Payment with eSewa
```
1. Click "Bill" on the order card
2. Invoice modal opens
3. Select **eSewa** payment method
4. Click "Complete Payment"
5. Form submits to eSewa UAT
```

#### 4. eSewa Test Payment
```
**On eSewa UAT page:**
- You'll see order details and amount
- Click "Pay" or "Proceed"
- Test payment automatically succeeds in UAT environment
```

#### 5. Payment Confirmation
```
After successful eSewa payment:
- Redirects to /payment/success
- Order marked as "Paid"
- Order status updated to "Completed"
- Billing queue refreshed
```

---

## 🔄 Complete Payment Flow

```
┌─────────────────────────────────────────────────────────┐
│ Cashier Selects eSewa in Billing Screen                 │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend calls: paymentsAPI.esewaInitiate(orderId)       │
│ (Sends order ID to backend)                             │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Backend processes: /api/payments/esewa_initiate/         │
│ - Generates MD5 signature                               │
│ - Creates payment payload                               │
│ - Returns eSewa form data and URL                        │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend creates payment form & redirects to eSewa       │
│ URL: https://uat.esewa.com.np/epay/main                 │
│ (Hidden form with encrypted data)                       │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ User Completes Payment on eSewa UAT                      │
│ (Test environment auto-approves payments)               │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ eSewa redirects back to: /payment/pending               │
│ (with transaction UUID, refId, status)                  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend calls: paymentsAPI.esewaVerify(txnData)         │
│ (Sends eSewa response to backend for verification)      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│ Backend processes: /api/payments/esewa_verify/           │
│ - Verifies MD5 signature from eSewa                      │
│ - Confirms payment with eSewa server                     │
│ - Updates Order status to "Paid"                         │
│ - Creates Payment record                                │
└──────────────────┬──────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    SUCCESS            FAILURE
         │                   │
         ▼                   ▼
  /payment/success     /payment/failure
  ✓ Order Paid        ✗ Try Again
```

---

## 🛠️ Backend Implementation Details

### Payment Gateway Service (`backend/apps/payments/esewa.py`)

**Key Functions:**

#### 1. Generate Payment Payload
```python
gateway.generate_payment_payload(order)
```
Returns:
- `form_data`: Payment form fields
- `esewa_url`: eSewa payment URL
- `total_amount`: Amount to charge
- `transaction_uuid`: Unique transaction ID

#### 2. Verify Transaction
```python
gateway.verify_transaction(transaction_uuid)
```
Verification steps:
- Calls eSewa UAT API
- Verifies amount matches
- Confirms transaction status
- Returns success/failure

#### 3. Process Callback
```python
gateway.process_payment_callback(callback_data)
```
Handles eSewa redirect response:
- Validates MD5 signature
- Marks order as paid
- Creates payment record
- Updates order status

### API Endpoints

#### Initiate Payment
```
POST /api/payments/esewa_initiate/
Body: { "order_id": 123 }
Response: {
    "success": true,
    "form_data": {...payment params...},
    "esewa_url": "https://uat.esewa.com.np/epay/main"
}
```

#### Verify Payment
```
POST /api/payments/esewa_verify/
Body: { 
    "oid": "order_id",
    "refId": "transaction_id",
    "amount": 1000,
    "status": "COMPLETE"
}
Response: {
    "success": true,
    "order": {...updated order...},
    "payment": {...payment record...}
}
```

---

## 🔐 Security Features

### MD5 Signature Generation
```
Signature = MD5(MERCHANT_CODE + SECRET + AMOUNT + TRANSACTION_UUID)
```

### Verification
1. **Client-side**: Validates form before submission
2. **Server-side**: 
   - Verifies MD5 signature
   - Calls eSewa UAT API
   - Confirms amount matches
   - Checks transaction status

### Data Encrypted
- Form data encrypted in hidden fields
- Sent securely over HTTPS to eSewa
- Response verified with signature

---

## 📊 Test Scenarios

### ✅ Successful Payment
```
Merchant Code: EPAYTEST
Amount: Any value
Status: EPAYTEST environment auto-approves
Result: /payment/success
```

### ❌ Failed Payment
```
Test case in browser console:
- Open DevTools (F12)
- Go to Network tab
- Make payment and watch requests
- If error: Check browser console for details
```

### 🔄 Transaction Tracking
```
Order → Payment Table
- Order ID linked to Payment
- Transaction UUID tracked
- Timestamp recorded
- Status: Pending → Paid
```

---

## 🚀 Production Deployment

### Switch to Live eSewa

**Step 1: Get Production Credentials**
- Visit: https://esewa.com.np/
- Register business account
- Receive: Merchant Code + Secret

**Step 2: Update Configuration**
```python
# backend/restaurant_api/settings.py

import os
from decouple import config

ESEWA_MERCHANT_CODE = config('ESEWA_MERCHANT_CODE', 'EPAYTEST')
ESEWA_MERCHANT_SECRET = config('ESEWA_MERCHANT_SECRET', '8gBm/:&EnhH.1/q')
ESEWA_USE_TEST = config('ESEWA_USE_TEST', 'True').lower() == 'true'

# For production, set in .env:
# ESEWA_MERCHANT_CODE=YOUR_LIVE_CODE
# ESEWA_MERCHANT_SECRET=YOUR_LIVE_SECRET
# ESEWA_USE_TEST=False
```

**Step 3: Update .env**
```bash
# .env.example
ESEWA_MERCHANT_CODE=YOUR_MERCHANT_CODE
ESEWA_MERCHANT_SECRET=YOUR_MERCHANT_SECRET
ESEWA_USE_TEST=False  # Set to False for production
```

**Step 4: Deploy**
```bash
git commit -m "Switch to production eSewa"
git push
# Deploy to production server
```

---

## 📋 Troubleshooting

### Issue: "Network Error" on Payment
**Solution:**
- Ensure backend is running
- Check `VITE_API_URL` in frontend/.env
- Restart both servers

### Issue: eSewa Form Not Submitting
**Solution:**
- Check browser console (F12) for errors
- Verify merchant code in backend settings
- Clear browser cache (Ctrl+Shift+Del)

### Issue: Payment Shows "Pending" Forever
**Solution:**
- Check backend logs for verification errors
- Verify transaction UUID matches
- Check eSewa UAT status

### Issue: "Invalid Signature"
**Solution:**
- Verify merchant secret is correct
- Check amount hasn't changed
- Verify transaction UUID format

---

## 📞 Support

### For eSewa Issues
- eSewa Support: https://esewa.com.np/support
- eSewa UAT Docs: Technical documentation on eSewa portal

### For System Issues
- Check browser console (F12)
- Check backend logs: `python manage.py runserver`
- Check network requests in DevTools Network tab

---

## ✨ Summary

Your EPOS system now has **complete eSewa payment integration**:

✅ Test Account Ready: `EPAYTEST` / `8gBm/:&EnhH.1/q`  
✅ Payment Methods: Cash, Card, eSewa, Khalti  
✅ Cashier Interface: Full billing screen with payment options  
✅ Security: MD5 signature verification, encrypted transfers  
✅ User Feedback: Success/Failure/Pending pages  
✅ Order Management: Automatic status updates after payment  
✅ Production Ready: Easy upgrade to live eSewa credentials  

Start testing now! 🎉
