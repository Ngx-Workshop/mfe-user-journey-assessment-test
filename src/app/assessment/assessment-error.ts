import { HttpErrorResponse } from '@angular/common/http';

export function apiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401)
      return 'Your session has expired. Sign in again to continue.';
    if (error.status === 403)
      return 'Your account does not have access to this assessment.';
    if (error.status === 0)
      return 'We couldn’t reach the assessment service. Check your connection and try again.';
    const message: unknown = error.error?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message)) return message.join('. ');
  }
  return 'Something went wrong. Please try again.';
}
