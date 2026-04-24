export interface ApiResponse<T = undefined> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Array<{ code: string; detail: string }>;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    total: number;
    limit: number;
    currentPage: number;
    totalPages: number;
    cursor?: string;
  };
}
