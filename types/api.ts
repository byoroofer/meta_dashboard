export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, string | number | boolean | null>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
}
