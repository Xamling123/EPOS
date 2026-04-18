# 🎯 eSewa Sample Account - Quick Reference

## Your Test Account Details

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
┃  eSEWA TEST CREDENTIALS (COMPLETELY FREE)           ┃
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Merchant Code:     EPAYTEST
  Merchant Secret:   8gBm/:&EnhH.1/q
  
  Environment:       UAT (User Acceptance Testing)
  Status:            Ready to use immediately
  Cost:              FREE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🚀 How to Use Right Now

### Step 1: Start the Application

```bash
# Terminal 1: Start Backend
cd backend
python manage.py runserver

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

### Step 2: Create a Test Order

1. Go to: **http://localhost:5173**
2. Login as Cashier (cashier@restaurant.com / cashier123)
3. Go to **Billing Screen** (`/cashier/billing`)
4. Create a test order with menu items
5. Click "Calculate & Continue"
6. Enter amount and click "Process Payment"

### Step 3: Test eSewa Payment

1. Select **"eSewa"** payment method
2. You'll be redirected to: **https://uat.esewa.com.np/epay/main**
3. Complete the payment using any amount (Rs. 1 - 999,999)
4. You'll be redirected back to the app
5. Payment is now verified ✓

---

## 💳 Testing Payment Flows

### Successful Payment Test

```
Payment Method: eSewa
Test Amount: Rs. 500 (or any amount)
Expected: Order marked as PAID ✓
```

Steps:
1. Enter amount < Rs. 1,000,000
2. Select "eSewa"
3. Complete on eSewa test portal
4. Success page confirms payment

### Failed Payment Test

```
Payment Method: eSewa
Action: Click "Decline" on eSewa page
Expected: Order remains UNPAID ✗
```

Steps:
1. Select "eSewa"
2. On eSewa page, choose "Decline Payment"
3. Failure page shows error
4. Can retry payment

### Instant Test (No eSewa Redirect)

```
Payment Method: Test Payment
Expected: Instant payment approval ✓
```

Steps:
1. Select "Test Payment"
2. Payment processes instantly
3. Order immediately marked as paid
4. Perfect for quick testing

---

## 📍 Key URLs in Application

| Feature | URL |
|---------|-----|
| **Billing Screen** | http://localhost:8000/cashier/billing |
| **Payment Success** | http://localhost:8000/payment/success |
| **Payment Failure** | http://localhost:8000/payment/failure |
| **Admin Dashboard** | http://localhost:8000/admin |
| **API Docs** | http://localhost:8000/api |

---

## 📋 Test Credentials Summary

### Backend Configuration

File: `backend/.env`

```env
# eSewa Settings (Already configured)
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_MERCHANT_SECRET=8gBm/:&EnhH.1/q
ESEWA_USE_TEST=True
ESEWA_RETURN_URL=http://localhost:5173/payment/success
ESEWA_FAILURE_URL=http://localhost:5173/payment/failure
```

### Demo User Accounts

```
Admin:     admin@restaurant.com / admin123
Cashier:   cashier@restaurant.com / cashier123
Waiter:    waiter@restaurant.com / waiter123
Chef:      chef@restaurant.com / chef123
Customer:  customer@example.com / customer123
```

---

## 🔄 Payment Processing Flow

```
START
  ↓
Customer creates order
  ↓
Select payment method → [Cash / eSewa / Test]
  ↓
[Cash] → Auto-approved, order closed
  ↓
[eSewa] → Redirect to eSewa portal
           ↓ Customer completes payment
           ↓ Redirected back to app
           ↓ Backend verifies with eSewa
           ↓ Order updated
  ↓
[Test] → Instant approval, order closed
  ↓
Order marked as PAID
  ↓
Kitchen receives notification
  ↓
Customer can track in dashboard
  ↓
END
```

---

## ✨ What's Implemented

### Backend Features ✓
- [x] eSewa gateway integration
- [x] MD5 signature generation
- [x] Payment initiation endpoint
- [x] Payment verification endpoint
- [x] Transaction status tracking
- [x] Order synchronization
- [x] Error handling & logging

### Frontend Features ✓
- [x] Payment method selector
- [x] eSewa payment form
- [x] Success page with order details
- [x] Failure page with retry option
- [x] Payment history tracking
- [x] Real-time status updates
- [x] Error messages and guidance

### Security Features ✓
- [x] Cryptographic signatures
- [x] Double verification
- [x] HTTPS/encrypted connections
- [x] Transaction validation
- [x] PCI compliance ready

---

## 🧪 Quick Testing Checklist

Test these scenarios to verify integration:

```
□ Create order and select Cash payment
  Expected: Order marked PAID immediately

□ Create order and select eSewa payment
  Expected: Redirected to eSewa (UAT)

□ Complete eSewa payment successfully
  Expected: Redirected to success page

□ Try eSewa with payment decline
  Expected: Redirected to failure page with retry option

□ Use Test Payment method
  Expected: Instant approval

□ Check payment history in admin dashboard
  Expected: All payments listed with status

□ Generate payment report
  Expected: Summary by payment method
```

---

## 🎓 Backend Integration Points

### Payment Service (`backend/apps/payments/esewa.py`)

```python
gateway = get_esewa_gateway(use_test=True)

# Generate payment
payload = gateway.generate_payment_payload(order)

# Verify payment
result = gateway.process_payment_callback(data)
```

### Views (`backend/apps/payments/views.py`)

```
POST /api/payments/esewa_initiate/       → Start payment
POST /api/payments/esewa_verify/         → Verify transaction
```

### Models (`backend/apps/payments/models.py`)

```python
Payment.objects.create(
    order=order,
    payment_method='esewa',
    status='completed',  # or 'pending', 'failed'
)
```

---

## 📊 Payment Database Schema

```sql
payments table:
├── id (PK)
├── order_id (FK)
├── amount (Decimal)
├── payment_method (esewa/cash/card)
├── status (pending/completed/failed/refunded)
├── transaction_id (unique)
├── gateway_response (JSON - eSewa details)
├── processed_by_id (FK to user)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## 🚀 Next Steps

### To Use eSewa TAU Environment:
1. Application is already configured ✓
2. Just start and test ✓
3. No additional setup required ✓

### When You're Ready for Production:
1. Register merchant account at https://esewa.com.np
2. Receive production credentials
3. Update `.env` file with your credentials
4. Change `ESEWA_USE_TEST=False`
5. Update payment URLs to production
6. Deploy and go live

---

## 💡 Pro Tips

✅ **Always test with Test Payment first** to ensure order flow works

✅ **Use small amounts** (Rs. 1-100) for frequent testing

✅ **Check browser console** for detailed error messages

✅ **Verify `.env` file** if payments aren't working

✅ **Check backend logs** for transaction details

✅ **Clear browser cache** if payment page doesn't load

---

## 📞 Support Resources

### For eSewa Integration Issues:
- eSewa Official: https://esewa.com.np/
- Developers: https://esewa.com.np/developers

### For Application Issues:
- Check: `ESEWA_INTEGRATION.md` (detailed guide)
- Check: Backend logs in `backend/`
- Check: Error messages in payment screens

---

## ⚠️ Important Notes

⚠️ **These test credentials are provided by eSewa for development only**

⚠️ **No real money is charged during testing**

⚠️ **All test transactions are for simulation purposes**

⚠️ **Use your own merchant account for production**

⚠️ **Keep secret key confidential in production**

---

## 🎉 You're All Set!

Everything is configured and ready to test. 

1. Start your servers
2. Create a test order
3. Try eSewa payment
4. See it work instantly

**Happy Testing! 🚀**

---

**Generated**: 2026-04-18  
**Version**: 1.0  
**Status**: Production Ready  
