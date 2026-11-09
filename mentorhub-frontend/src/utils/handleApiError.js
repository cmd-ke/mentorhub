// src/utils/handleApiError.js

/**
 * Converts backend Zod validation errors into a field-level map.
 *
 * Backend sends:
 *   { errors: [{ path: "body.email", message: "Invalid email" }] }
 *
 * Returns:
 *   { email: "Invalid email", password: "Too short" }
 */
export function extractFieldErrors(error) {
  const fields = {};
  const backendErrors = error.response?.data?.errors;

  if (Array.isArray(backendErrors)) {
    for (const err of backendErrors) {
      // Strip "body." prefix: "body.email" → "email"
      const field = (err.path || '').replace(/^body\./, '');
      if (field) {
        fields[field] = fields[field]
          ? `${fields[field]}; ${err.message}`
          : err.message;
      }
    }
  }

  return fields;
}

/**
 * Returns a user-friendly error message from any axios error.
 */
export function getErrorMessage(error) {
  // Backend sent a specific message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Network error (backend down, CORS blocked, etc.)
  if (error.message === 'Network Error') {
    return 'Cannot reach the server. Is the backend running?';
  }

  return error.message || 'Something went wrong';
}