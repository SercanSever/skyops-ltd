export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  details?: Record<string, unknown>;
}
