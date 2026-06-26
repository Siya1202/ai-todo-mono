export interface ApiResponse<T> {
  status: 'success' | 'fail' | 'error';
  message: string;
  data?: T;
}