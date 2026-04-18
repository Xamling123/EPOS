/**
 * Common error handling utilities
 * Provides consistent error message extraction and formatting
 */

/**
 * Extract error message from API response
 * Handles various error response formats
 */
export function getErrorMessage(error) {
    if (!error) {
        return 'An unknown error occurred'
    }

    // Network error or no response
    if (!error.response) {
        return error.message || 'Network error. Please check your connection.'
    }

    const { data, status, statusText } = error.response

    // Handle structured error response with error.message
    if (data?.error?.message) {
        return data.error.message
    }

    // Handle validation errors with details
    if (data?.error?.details && typeof data.error.details === 'object') {
        const errorLines = Object.entries(data.error.details)
            .map(([field, messages]) => {
                const msgs = Array.isArray(messages) ? messages : [messages]
                return `${field}: ${msgs.join(', ')}`
            })
        return errorLines.join(' | ')
    }

    // Handle simple message field
    if (data?.message) {
        return data.message
    }

    // Handle DRF default error responses
    if (typeof data === 'object' && Object.keys(data).length > 0) {
        // If data has a non_field_errors or other field with errors
        const firstError = Object.values(data)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
            return firstError[0]
        }
        if (typeof firstError === 'string') {
            return firstError
        }
    }

    // Handle plain text responses
    if (typeof data === 'string' && data.trim()) {
        return data
    }

    // Fallback to HTTP status
    if (status && statusText) {
        return `${statusText} (${status})`
    }

    return 'Failed to process request'
}

/**
 * Log error details for debugging
 * Safe to call, won't break even with weird error objects
 */
export function logError(context, error) {
    const errorLog = {
        context,
        message: error?.message,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        url: error?.config?.url
    }
    
    if (process.env.NODE_ENV === 'development') {
        console.error(`[${context}]`, errorLog)
    }
}

/**
 * Combine logging and getting error message
 */
export function handleApiError(context, error) {
    logError(context, error)
    return getErrorMessage(error)
}
