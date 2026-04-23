export type BookingStatus =
  | "pending"
  | "confirmed"
  | "waiting_payment"
  | "dp_verified"
  | "completed"
  | "rejected"
  | "cancelled";

export type AvailabilityStatus = "available" | "full" | "off";

export type UserRole = "guest" | "user" | "vendor" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  is_email_verified: boolean;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  store_name: string;
  slug: string;
  category: string;
  description: string | null;
  whatsapp_number: string;
  city: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  ktp_url: string | null;
  selfie_url: string | null;
  is_verified: boolean;
  is_active: boolean;
  rating_avg: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  vendor_id: string;
  name: string;
  category: string;
  description: string | null;
  price_min: number;
  price_max: number | null;
  unit: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  vendor_id: string;
  user_id: string;
  service_id: string;
  event_date: string;
  event_name: string;
  event_location: string;
  setup_time: string | null;
  notes: string | null;
  status: BookingStatus;
  rejection_reason: string | null;
  dp_proof_url: string | null;
  dp_verified_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  vendor_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityBlock {
  id: string;
  vendor_id: string;
  date: string;
  status: AvailabilityStatus;
  booking_id: string | null;
  created_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  vendor_id: string;
  created_at: string;
}

export interface ApiResponse<T = null> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface VendorWithDetails extends VendorProfile {
  services: Service[];
  reviews: ReviewWithUser[];
}

export interface BookingWithDetails extends Booking {
  vendor: Pick<VendorProfile, "id" | "store_name" | "whatsapp_number">;
  service: Pick<Service, "id" | "name" | "category">;
  user: Pick<UserProfile, "id" | "full_name" | "email">;
}

export interface ReviewWithUser extends Review {
  user: Pick<UserProfile, "id" | "full_name" | "avatar_url">;
}

export interface VendorSearchParams {
  q?: string;
  category?: string;
  city?: string;
  price_min?: number;
  price_max?: number;
  rating_min?: number;
  date?: string; // YYYY-MM-DD — hanya tampil vendor yang available
  sort?: "rating" | "price_asc" | "price_desc" | "newest";
  page?: number;
  per_page?: number;
}
