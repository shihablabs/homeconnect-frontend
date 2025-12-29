

import { AppError, ValidationError } from '@/types/error.types';
import { extractErrorMessage, extractValidationErrors, getErrorCode } from '@/utils/error.utils';
import { useCallback } from 'react';
import { toast } from 'sonner';

export const useErrorHandler = () => {
  const handleError = useCallback((error: AppError, options?: {
    showToast?: boolean;
    fallbackMessage?: string;
    logError?: boolean;
    toastDuration?: number;
  }) => {
    const {
      showToast = true,
      fallbackMessage = 'An unexpected error occurred',
      logError = true,
      toastDuration = 5000
    } = options || {};

    const errorMessage = extractErrorMessage(error) || fallbackMessage;
    const validationErrors = extractValidationErrors(error);
    const errorCode = getErrorCode(error);

    if (logError) {
      console.error('Error occurred:', {
        message: errorMessage,
        code: errorCode,
        validationErrors,
        originalError: error
      });
    }

    if (showToast) {
      toast.error(errorMessage, {
        duration: toastDuration,
      });
    }

    return {
      message: errorMessage,
      code: errorCode,
      validationErrors,
      originalError: error
    };
  }, []);

  const handleMutationError = useCallback((error: AppError, context?: string) => {
    return handleError(error, {
      showToast: true,
      fallbackMessage: `Failed to ${context || 'perform action'}. Please try again.`,
      logError: true
    });
  }, [handleError]);

  const handleValidationErrors = useCallback((validationErrors: ValidationError[], formErrors: any, setFormErrors: (errors: any) => void) => {
    const newErrors: any = { ...formErrors };

    validationErrors.forEach(validationError => {
      newErrors[validationError.field] = validationError.message;
    });

    setFormErrors(newErrors);

    
    if (validationErrors.length > 0) {
      toast.error('Please check the form for errors', {
        duration: 3000,
      });
    }
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    toast.success(message, {
      duration: duration || 3000,
    });
  }, []);

  const showInfo = useCallback((message: string, duration?: number) => {
    toast.info(message, {
      duration: duration || 3000,
    });
  }, []);

  const showWarning = useCallback((message: string, duration?: number) => {
    toast.warning(message, {
      duration: duration || 4000,
    });
  }, []);

  return {
    handleError,
    handleMutationError,
    handleValidationErrors,
    showSuccess,
    showInfo,
    showWarning
  };
};