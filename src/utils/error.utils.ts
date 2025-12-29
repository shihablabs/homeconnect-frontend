

import { ApiError, ApiErrorResponse, AppError, ValidationError } from '@/types/error.types';

export const isApiErrorResponse = (error: any): error is ApiErrorResponse => {
  return error && typeof error === 'object' && 'error' in error;
};

export const isApiError = (error: any): error is ApiError => {
  return error && typeof error === 'object' && 'message' in error;
};

export const isValidationError = (error: any): error is ValidationError[] => {
  return Array.isArray(error) && error.every(item =>
    item && typeof item === 'object' && 'field' in item && 'message' in item
  );
};

export const extractErrorMessage = (error: AppError): string => {
  if (!error) return 'An unexpected error occurred';

  
  if (isApiErrorResponse(error)) {
    return error.error.message || 'API Error occurred';
  }

  
  if (isApiError(error)) {
    return error.message;
  }

  
  if (isValidationError(error)) {
    return error.map(e => `${e.field}: ${e.message}`).join(', ');
  }

  
  if (error instanceof Error) {
    return error.message;
  }

  
  if (typeof error === 'string') {
    return error;
  }

  
  return 'An unexpected error occurred. Please try again.';
};

export const extractValidationErrors = (error: AppError): ValidationError[] => {
  if (isApiErrorResponse(error) && error.error.details) {
    return error.error.details;
  }

  if (isValidationError(error)) {
    return error;
  }

  return [];
};

export const getErrorCode = (error: AppError): string => {
  if (isApiErrorResponse(error)) {
    return error.error.code || 'UNKNOWN_ERROR';
  }

  if (isApiError(error)) {
    return error.code || 'UNKNOWN_ERROR';
  }

  return 'UNKNOWN_ERROR';
};


export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (!error) return fallback;
  
  
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } } };
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
  }
  
  
  if (error instanceof Error) {
    return error.message;
  }
  
  
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
};