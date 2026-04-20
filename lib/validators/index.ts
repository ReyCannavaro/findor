import { z } from "zod";

// ============================================================
// AUTH
// ============================================================

export const RegisterSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  full_name: z.string().min(2, "Nama minimal 2 karakter").max(100),
});

export const LoginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

// ============================================================
// BOOKING
// ============================================================

export const CreateBookingSchema = z.object({
  vendor_id: z.string().uuid("vendor_id tidak valid"),
  service_id: z.string().uuid("service_id tidak valid"),
  event_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal: YYYY-MM-DD")
    .refine((date) => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return new Date(date) >= tomorrow;
    }, "Tanggal minimal H+1 dari hari ini"),
  event_name: z.string().min(1, "Nama event wajib diisi").max(100),
  event_location: z.string().min(1, "Lokasi event wajib diisi").max(200),
  setup_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Format waktu: HH:MM")
    .optional()
    .nullable(),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional().nullable(),
});

export const RejectBookingSchema = z.object({
  reason: z.string().min(1, "Alasan penolakan wajib diisi").max(500),
});

export const VerifyPaymentSchema = z.object({
  action: z.enum(["verify", "clarify"]),
  message: z.string().max(500).optional().nullable(),
});

// ============================================================
// REVIEW
// ============================================================

export const CreateReviewSchema = z.object({
  booking_id: z.string().uuid("booking_id tidak valid"),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .max(300, "Komentar maksimal 300 karakter")
    .optional()
    .nullable(),
});

export const UpdateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  comment: z
    .string()
    .max(300, "Komentar maksimal 300 karakter")
    .optional()
    .nullable(),
});

// ============================================================
// VENDOR ONBOARDING
// ============================================================

export const VendorOnboardingSchema = z.object({
  store_name: z.string().min(2, "Nama toko minimal 2 karakter").max(100),
  category: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().max(1000).optional().nullable(),
  whatsapp_number: z
    .string()
    .regex(/^\+62\d{8,13}$/, "Format nomor WA: +62xxxxxxxxxx"),
  city: z.string().min(1, "Kota wajib diisi"),
  address: z.string().max(300).optional().nullable(),
});

// ============================================================
// SERVICE
// ============================================================

export const ServiceSchema = z.object({
  name: z.string().min(1, "Nama layanan wajib diisi").max(100),
  category: z.string().min(1, "Kategori wajib dipilih"),
  description: z.string().max(500).optional().nullable(),
  price_min: z.number().int().positive("Harga minimal harus > 0"),
  price_max: z.number().int().positive().optional().nullable(),
  unit: z.string().max(50).optional().nullable(),
});

// ============================================================
// AVAILABILITY
// ============================================================

export const SetAvailabilitySchema = z.object({
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  status: z.enum(["available", "off"]),
});

// ============================================================
// SEARCH
// ============================================================

export const SearchParamsSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  price_min: z.coerce.number().optional(),
  price_max: z.coerce.number().optional(),
  rating_min: z.coerce.number().min(1).max(5).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  sort: z.enum(["rating", "price_asc", "price_desc", "newest"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  per_page: z.coerce.number().int().positive().max(50).default(12),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
export type CreateReviewInput = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewInput = z.infer<typeof UpdateReviewSchema>;
export type VendorOnboardingInput = z.infer<typeof VendorOnboardingSchema>;
export type ServiceInput = z.infer<typeof ServiceSchema>;
export type SearchParamsInput = z.infer<typeof SearchParamsSchema>;
