"""
Custom exception handler for consistent API error responses.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError


def custom_exception_handler(exc, context):
    """
    Custom exception handler that ensures consistent error response format.
    
    Response format:
    {
        "success": false,
        "error": {
            "code": "ERROR_CODE",
            "message": "Human readable message",
            "details": {...}  # Optional
        }
    }
    """
    # Convert Django ValidationError to DRF ValidationError
    if isinstance(exc, DjangoValidationError):
        exc = DRFValidationError(detail=exc.messages)
    
    response = exception_handler(exc, context)
    
    if response is not None:
        error_code = exc.__class__.__name__.upper()
        
        # Handle different error structures
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                message = str(response.data['detail'])
                details = None
            else:
                message = "Validation error"
                details = response.data
        elif isinstance(response.data, list):
            message = response.data[0] if response.data else "An error occurred"
            details = response.data
        else:
            message = str(response.data)
            details = None
        
        error_response = {
            "success": False,
            "error": {
                "code": error_code,
                "message": message,
            }
        }
        
        if details:
            error_response["error"]["details"] = details
        
        response.data = error_response
    
    return response


class BusinessRuleViolation(Exception):
    """Exception raised when a business rule is violated."""
    
    def __init__(self, message, code="BUSINESS_RULE_VIOLATION"):
        self.message = message
        self.code = code
        super().__init__(self.message)
