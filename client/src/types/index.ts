export type UserRole = 0 | 1; // 0 = User, 1 = Admin

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string | null;
  price: number;
  totalTickets: number;
  availableTickets: number;
  createdAt: string;
  categoryId: number;
  categoryName: string;
  organizerId: string;
  organizerName: string;
  isOwner: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface EventFormData {
  title: string;
  description: string;
  categoryId: number;
  location: string;
  startDate: string;
  endDate: string;
  imageUrl: string;
  price: number;
  totalTickets: number;
}

export type BookingStatus = 0 | 1; // 0 = Confirmed, 1 = Cancelled

export interface Booking {
  id: string;
  ticketCode: string;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  bookingDate: string;
  eventId: string;
  eventTitle: string;
  eventImageUrl: string | null;
  eventStartDate: string;
  eventLocation: string;
}

export interface ApiError {
  message: string;
}

export interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalBookings: number;
  ticketsSold: number;
  totalRevenue: number;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  eventsCount: number;
  bookingsCount: number;
}

export interface AdminBooking {
  id: string;
  ticketCode: string;
  quantity: number;
  totalPrice: number;
  status: BookingStatus;
  bookingDate: string;
  eventTitle: string;
  userFullName: string;
  userEmail: string;
}
