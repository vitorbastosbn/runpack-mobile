// Mirrors Spring Data's Page<T> JSON shape. Standard paginated-list contract for the app.
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  last: boolean;
}
