# eSewa Test Account - Quick Reference

## 🎫 Test Credentials

### Merchant Account
| Field | Value |
|-------|-------|
| **Merchant Code** | `EPAYTEST` |
| **Merchant Secret** | `8gBm/:&EnhH.1/q` |
| **Environment** | eSewa UAT (Test/Free) |
| **Status** | ✅ Active & Ready to Use |

### Payment URLs
| Service | URL |
|---------|-----|
| **eSewa UAT Payment** | https://uat.esewa.com.np/epay/main |
| **eSewa Test Portal** | https://uat.esewa.com.np (Admin) |

---

## 💳 Test Payment Cards

When testing eSewa payments in UAT environment, any amount works. The system auto-approves all payments.

### Test Amounts (All work in UAT)
- **1 NPR** - Minimum test amount
- **100 NPR** - Standard test amount
- **1000 NPR** - Larger order test
- **9999.99 NPR** - Maximum practical test

> **Note**: UAT environment automatically approves all payment attempts. No specific test card numbers needed.

---

## 🚀 Quick Start

### 1. Verify Backend Has eSewa Enabled
```bash
cd backend
python manage.py shell
>>> from apps.payments.esewa import ESewaGateway
>>> gw = ESewaGateway()
>>> print(f"Merchant: {gw.MERCHANT_CODE}")
>>> print(f"Test Mode: {gw.USE_TEST}")
```

### 2. Create a Test Order
Go to `http://localhost:5173/waiter` and create an order.

### 3. Process eSewa Payment
1. Go to `http://localhost:5173/cashier/billing`
2. Click "Bill" on your test order
3. Select **eSewa** payment method
4. Click "Complete Payment"
5. You'll be redirected to eSewa UAT
6. Payment auto-approves and redirects back

### 4. Verify Payment Success
After payment, you should see:
- ✅ Order status changed to "Paid"
- ✅ Redirected to `/payment/success`
- ✅ Payment appears in database

---

## 🔍 Payment Flow Verification

### Check eSewa Payment was Processed
```bash
# In backend terminal
python manage.py shell

# Check payment record
>>> from apps.payments.models import Payment
>>> Payment.objects.latest('id')
<Payment: Payment #X - Order #Y - esewa - Rs.Z>

# Check order status
>>> from apps.orders.models import Order
>>> Order.objects.get(id=YOUR_ORDER_ID).status
'paid'
```

---

## 📱 Where to Click "Pay"

### Cashier Interface
1. **Billing Screen**: `/cashier/billing`
   - Shows all orders ready for billing
   - Click "Bill" button on any order
   - Select eSewa in modal
   - Click "Complete Payment"

### Payment Confirmation
1. **Success Page**: `/payment/success`
   - Shows after successful payment
   - Displays transaction details
   - Offers return to dashboard

2. **Failure Page**: `/payment/failure`
   - Shows if payment failed
   - Provides retry option

---

## 🐛 Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| Payment button doesn't appear | Check backend is running on port 8000 |
| eSewa page shows 404 | Check `ESEWA_MERCHANT_CODE` is set to `EPAYTEST` |
| Payment stuck on "Pending" | Check backend console for verification errors |
| Form not redirecting to eSewa | Clear browser cache (Ctrl+Shift+Del) |
| "Network Error" on billing | Restart both servers |

---

## 📞 Test Account Support

### This eSewa Account
- **Type**: Free Development/Testing Account
- **Purpose**: Testing the integration before going live
- **Transactions**: Unlimited test transactions
- **Refunds**: Auto-approved
- **Support**: eSewa UAT documentation

### When Ready for Production
1. Register live account at https://esewa.com.np
2. Get production merchant code & secret
3. Update `.env` file with production credentials
4. Change `ESEWA_USE_TEST=False`
5. Deploy and you're live!

---

## ⚡ One-Liner Test Commands

```bash
# Test backend eSewa configuration
curl -X POST http://localhost:8000/api/payments/esewa_initiate/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"order_id": 1}'

# Check if merchant code is set
python -c "import os; os.environ['DJANGO_SETTINGS_MODULE']='restaurant_api.settings'; from django.conf import settings; print(settings.ESEWA_MERCHANT_CODE)"
```

---

## 🎯 Success Indicators

After successful eSewa payment, you should see:

✅ Order moved from billing queue  
✅ Payment record created in database  
✅ Order status changed to "Paid"  
✅ Redirected to success page  
✅ Success page shows transaction details  

---

## 🔒 Security Notes

⚠️ **Test Credentials Only**
- These are EPAYTEST account (public test credentials)
- Not for production use
- Reset frequently by eSewa
- Register own account for production

⚠️ **Signature Verification**
- All requests are MD5 signed
- Backend verifies all eSewa callbacks
- Transaction amounts are validated
- Prevents tampering

⚠️ **Secure Deployment**
- Store production credentials in `.env`
- Never commit credentials to git
- Use environment variables in production
- Rotate secrets regularly

---

## 📖 More Information

For complete details, see:
- `ESEWA_PAYMENT_SETUP.md` - Full setup guide
- `ESEWA_INTEGRATION.md` - Technical documentation
- `ESEWA_QUICK_START.md` - Getting started
