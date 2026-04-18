# eSewa Payment Gateway Integration

## Overview

This EPOS system is fully integrated with eSewa, Nepal's leading online payment gateway. All payments can be processed through eSewa with a simple, secure, and user-friendly experience.

## ✅ Test Credentials (COMPLETELY FREE)

Use these credentials for development and testing:

```
Merchant Code: EPAYTEST
Merchant Secret: 8gBm/:&EnhH.1/q
Environment: UAT (User Acceptance Testing)
```

**These credentials are provided by eSewa for FREE testing purposes.**

### Test Payment URLs

- **Payment URL (Test)**: https://uat.esewa.com.np/epay/main
- **Verification URL (Test)**: https://uat.esewa.com.np/api/epay/transaction/status/
- **Production URLs**: Available after getting merchant account

---

## 🚀 Getting Started

### 1. No Setup Required for Testing

The system comes pre-configured with eSewa test credentials. Start testing immediately:

- Go to Billing Screen (`/cashier/billing`)
- Create an order
- Click "eSewa" payment method
- You'll be redirected to eSewa's test portal

### 2. Testing Without Real Account

eSewa provides a test environment where you can:
- Test payments with any amount (Rs. 1 - 999,999)
- Use any Nepali mobile number format
- Test success and failure scenarios

---

## 💳 How to Set Your Own Merchant Account

When you want to use production/real payments:

### Step 1: Register as Merchant

1. Visit: https://esewa.com.np/
2. Navigate to: "Business/Merchant" > "Sign Up"
3. Fill in required information:
   - Business name
   - Email address
   - Phone number
   - Business type
   - PAN number (if applicable)

### Step 2: Get Your Credentials

After approval, you'll receive:
- Merchant Code (e.g., `YOUR_MERCHANT_CODE`)
- Merchant Secret (e.g., `YOUR_SECRET_KEY`)
- Integration documentation

### Step 3: Update Your .env File

```bash
# Copy backend/.env.example to backend/.env
cp backend/.env.example backend/.env

# Update with your credentials
ESEWA_MERCHANT_CODE=YOUR_MERCHANT_CODE
ESEWA_MERCHANT_SECRET=YOUR_SECRET_KEY
ESEWA_USE_TEST=False  # Set to False for production
```

---

## 🔄 Payment Flow

### Customer Initiates Payment

```
1. Customer clicks "eSewa" payment method
2. Frontend calls: POST /api/payments/esewa_initiate/
3. Backend generates payment signature
4. Returns payment form and eSewa URL
```

### Redirect to eSewa

```
5. Frontend redirects customer to eSewa payment page
6. Customer enters payment details
7. eSewa processes payment
8. eSewa redirects back to application
```

### Payment Verification

```
9. Backend calls: POST /api/payments/esewa_verify/
10. Verifies transaction signature and status
11. Updates payment and order status
12. Redirects to success page
```

---

## 📋 API Endpoints

### Initiate Payment
```bash
POST /api/payments/esewa_initiate/
Content-Type: application/json

{
    "order_id": 123
}

Response:
{
    "success": true,
    "payment_id": 456,
    "payment_url": "https://uat.esewa.com.np/epay/main",
    "payload": {
        "amt": "1000",
        "pid": "ORDER-123",
        "scd": "EPAYTEST",
        ...
    }
}
```

### Verify Payment
```bash
POST /api/payments/esewa_verify/
Parameters: uuid, refId (from eSewa callback)

Response:
{
    "success": true,
    "message": "Payment verified successfully",
    "payment": { ... },
    "redirect_url": "/payment/success?order_id=123"
}
```

---

## 🧪 Testing Scenarios

### Test 1: Successful Payment

1. Go to `/cashier/billing`
2. Create an order
3. Select "eSewa" payment method
4. You'll be redirected to eSewa test portal
5. Complete the payment using test credentials
6. You'll be redirected to success page
7. Order is now marked as paid ✓

### Test 2: Failed Payment

1. Go to `/cashier/billing`
2. Create an order
3. Select "eSewa" payment method
4. On eSewa page, choose "Decline Payment"
5. You'll be redirected to failure page
6. Order remains unpaid

### Test 3: Quick Test (Mock Payment)

Don't want to go through eSewa UI? Use "Test Payment" option:

1. Go to `/cashier/billing`
2. Create an order
3. Select "Test Payment" method
4. Payment instantly completes ✓

---

## 🔐 Security Features

✅ **MD5 Signature Verification**
- All payments are digitally signed
- Tampering is immediately detected
- Only valid signatures are accepted

✅ **Transaction Verification**
- Backend verifies every transaction with eSewa
- Double-checks payment status and amount
- Prevents fake payment claims

✅ **PCI Compliance**
- No sensitive card data stored locally
- All payments through eSewa's secure servers
- HTTPS encryption on all endpoints

---

## 📊 Payment Status Tracking

### Payment Statuses

- `pending` - Payment initiated, awaiting eSewa verification
- `completed` - Payment successful, order is paid
- `failed` - Payment declined or verification failed
- `refunded` - Payment refunded by admin

### Order Status Updates

When payment is completed:
1. Order status changes to `closed`
2. Order is marked as `is_paid = True`
3. Kitchen receives notification
4. Customer can view in dashboard

---

## 🛠️ Integration in Code

### Backend (Django)

```python
from apps.payments.esewa import get_esewa_gateway

# Initiate payment
gateway = get_esewa_gateway(use_test=True)
payment_data = gateway.generate_payment_payload(order)

# Verify payment
verification = gateway.process_payment_callback(request_data)
```

### Frontend (React)

```javascript
import { paymentsAPI } from '../../api/payments'

// Initiate eSewa payment
const response = await paymentsAPI.esewaInitiate(orderId)
// Redirect to eSewa
window.location.href = response.data.payment_url
```

---

## 📞 Support

### eSewa Support

- **Website**: https://esewa.com.np/
- **Contact**: Feel free to reach out to eSewa for queries
- **Documentation**: https://esewa.com.np/developers

### Application Support

For issues with the EPOS integration:
1. Check the error message displayed
2. Review server logs: `backend/*.log`
3. Verify credentials in `.env` file
4. Test with mock payment first

---

## 🎯 Common Issues & Solutions

### Issue: Payment Signature Mismatch

**Cause**: Secret key is incorrect

**Solution**: Verify `ESEWA_MERCHANT_SECRET` in `.env` matches your eSewa account

### Issue: Transaction Verification Failed

**Cause**: eSewa verification service timeout

**Solution**: 
1. Check internet connection
2. Verify eSewa test portal is accessible
3. Try payment again

### Issue: Payment succeeds but order not updated

**Cause**: Callback endpoint not accessible

**Solution**: Ensure `ESEWA_RETURN_URL` is publicly accessible

---

## 📝 Sample Test Cases

| Scenario | Test Amount | Expected Result |
|----------|-------------|-----------------|
| Successful payment | Rs. 100 | Order marked as paid ✓ |
| Failed payment | (Choose decline) | Order remains unpaid ✗ |
| Very small amount | Rs. 1 | Accepted and processed |
| Large amount | Rs. 999,999 | Accepted and processed |
| Invalid amount | Rs. 1000000+ | Rejected by eSewa |

---

## 🚀 Deployment Checklist

Before going live:

- [ ] Register merchant account with eSewa
- [ ] Receive production credentials
- [ ] Update `.env` file with production credentials
- [ ] Set `ESEWA_USE_TEST=False`
- [ ] Update payment URLs to production
- [ ] Test end-to-end payment flow
- [ ] Set up error logging and monitoring
- [ ] Inform customers about payment option
- [ ] Train staff on payment processing
- [ ] Have support contact for eSewa issues

---

## 🎓 eSewa Integration Architecture

```
Frontend (React)
     ↓
Backend (Django) - /api/payments/esewa_initiate/
     ↓
Generate Signature & Payload
     ↓
Display Payment Form
     ↓
User → Redirected to eSewa Payment Portal
     ↓
eSewa processes payment
     ↓
Redirects to /api/payments/esewa_verify/
     ↓
Backend verifies with eSewa
     ↓
Order updated if successful
     ↓
Redirect to success/failure page
```

---

## 📚 Quick Reference

**Test Merchant Code**: EPAYTEST  
**Test Secret**: 8gBm/:&EnhH.1/q  
**Test Environment**: uat.esewa.com.np  
**Billing Screen**: http://localhost:8000/cashier/billing  
**Settings File**: backend/restaurant_api/settings.py  
**View Implementation**: backend/apps/payments/views.py  

---

## ✨ Features Implemented

✅ eSewa payment initiation  
✅ Payment signature generation  
✅ Transaction verification  
✅ Payment callback handling  
✅ Order status synchronization  
✅ Error handling and logging  
✅ Success/failure pages  
✅ Payment history tracking  
✅ Refund capability  
✅ Multiple payment methods (Cash, eSewa, Test)  

---

**Happy Processing! 🎉**

For questions about eSewa integration, refer to the code comments or contact eSewa support.
