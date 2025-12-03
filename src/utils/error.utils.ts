/* eslint-disable @typescript-eslint/no-explicit-any */

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

  // Handle ApiErrorResponse (from API)
  if (isApiErrorResponse(error)) {
    return error.error.message || 'API Error occurred';
  }

  // Handle ApiError
  if (isApiError(error)) {
    return error.message;
  }

  // Handle ValidationError array
  if (isValidationError(error)) {
    return error.map(e => `${e.field}: ${e.message}`).join(', ');
  }

  // Handle standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Handle unknown error types
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

/**
 * Extract error message from unknown error (for catch blocks)
 * Handles axios errors with response.data.message pattern
 */
export const getErrorMessage = (error: unknown, fallback = 'An unexpected error occurred'): string => {
  if (!error) return fallback;
  
  // Handle axios error response pattern: error.response.data.message
  if (error && typeof error === 'object' && 'response' in error) {
    const err = error as { response?: { data?: { message?: string } } };
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
  }
  
  // Handle standard Error
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  return fallback;
};