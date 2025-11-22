export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = <T>(data: T, message?: string): SuccessResponse<T> => ({
  success: true,
  data,
  ...(message && { message }),
});

export const errorResponse = (code: string, message: string, details?: any): ErrorResponse => ({
  success: false,
  error: {
    code,
    message,
    ...(details && { details }),
  },
});

export const paginatedResponse = <T>(
  items: T[],
  page: number,
  limit: number,
  total: number
): SuccessResponse<PaginatedData<T>> => ({
  success: true,
  data: {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  },
});
