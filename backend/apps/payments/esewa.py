"""
eSewa Payment Gateway Integration Service
"""

import hashlib
import json
import requests
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)


class ESewaGateway:
    """eSewa payment gateway integration"""
    
    # Test/Demo credentials
    MERCHANT_CODE = "EPAYTEST"
    MERCHANT_SECRET = "8gBm/:&EnhH.1/q"
    
    # Environment URLs
    TEST_PAYMENT_URL = "https://uat.esewa.com.np/epay/main"
    TEST_VERIFY_URL = "https://uat.esewa.com.np/api/epay/transaction/status/"
    
    PROD_PAYMENT_URL = "https://esewa.com.np/epay/main"
    PROD_VERIFY_URL = "https://esewa.com.np/api/epay/transaction/status/"
    
    def __init__(self, use_test=True):
        """Initialize eSewa gateway"""
        self.use_test = use_test
        self.merchant_code = settings.ESEWA_MERCHANT_CODE or self.MERCHANT_CODE
        self.merchant_secret = settings.ESEWA_MERCHANT_SECRET or self.MERCHANT_SECRET
        self.return_url = settings.ESEWA_RETURN_URL
        self.failure_url = settings.ESEWA_FAILURE_URL
        
        if use_test:
            self.payment_url = self.TEST_PAYMENT_URL
            self.verify_url = self.TEST_VERIFY_URL
        else:
            self.payment_url = self.PROD_PAYMENT_URL
            self.verify_url = self.PROD_VERIFY_URL
    
    def generate_signature(self, total_amount, transaction_uuid):
        """
        Generate eSewa signature for payment initiation
        Signature: MD5(merchantCode + merchantSecret + totalAmount + transactionUuid)
        """
        message = f"{self.merchant_code}{self.merchant_secret}{total_amount}{transaction_uuid}"
        signature = hashlib.md5(message.encode()).hexdigest()
        return signature
    
    def generate_payment_payload(self, order):
        """
        Generate payment payload for eSewa
        
        Args:
            order: Order object
            
        Returns:
            dict: Payment payload
        """
        from apps.orders.models import Order
        import uuid
        
        # Convert to string and remove decimal
        total_amount = str(int(order.total_amount))
        transaction_uuid = str(uuid.uuid4())
        
        signature = self.generate_signature(total_amount, transaction_uuid)
        
        payload = {
            'amt': total_amount,
            'psc': '0',
            'pdc': '0',
            'txAmt': total_amount,
            'tAmt': total_amount,
            'pid': f"ORDER-{order.id}",
            'scd': self.merchant_code,
            'su': self.return_url,
            'fu': self.failure_url,
            'uuid': transaction_uuid,
            'sign': signature,
        }
        
        return {
            'payload': payload,
            'transaction_uuid': transaction_uuid,
            'signature': signature,
            'payment_url': self.payment_url,
        }
    
    def verify_transaction(self, transaction_uuid):
        """
        Verify transaction with eSewa
        
        Args:
            transaction_uuid: UUID from eSewa response
            
        Returns:
            dict: Verification response
        """
        try:
            response = requests.post(
                self.verify_url,
                data={'uuid': transaction_uuid},
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"eSewa verification response: {data}")
            
            return data
        except requests.exceptions.RequestException as e:
            logger.error(f"eSewa verification failed: {str(e)}")
            return {
                'status': 'FAILED',
                'error': str(e)
            }
    
    def process_payment_callback(self, data):
        """
        Process eSewa payment callback
        
        Args:
            data: Callback data from eSewa
            
        Returns:
            dict: Processing result
        """
        try:
            # Extract data
            transaction_uuid = data.get('uuid')
            transaction_code = data.get('oid')
            status = data.get('refId') or data.get('status')  # eSewa returns refId on success
            
            # Verify with eSewa
            verification = self.verify_transaction(transaction_uuid)
            
            if verification.get('status') == 'COMPLETE':
                return {
                    'success': True,
                    'transaction_uuid': transaction_uuid,
                    'transaction_code': transaction_code,
                    'status': 'completed',
                    'verification_data': verification
                }
            else:
                return {
                    'success': False,
                    'error': 'Transaction verification failed',
                    'verification_data': verification
                }
        except Exception as e:
            logger.error(f"Payment callback processing failed: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }


def get_esewa_gateway(use_test=True):
    """Get eSewa gateway instance"""
    return ESewaGateway(use_test=use_test)
