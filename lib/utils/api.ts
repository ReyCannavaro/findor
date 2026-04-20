import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

// ============================================================
// API RESPONSE HELPERS
// ============================================================

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ success: true, data } satisfies ApiResponse<T>, { status });
}

export function created<T>(data: T): NextResponse {
  return ok(data, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function badRequest(error: string): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 400 }
  );
}

export function unauthorized(error = "Unauthorized"): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 401 }
  );
}

export function forbidden(error = "Forbidden"): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 403 }
  );
}

export function notFound(error = "Not found"): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 404 }
  );
}

export function conflict(error: string): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 409 }
  );
}

export function unprocessable(error: string): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 422 }
  );
}

export function serverError(error = "Internal server error"): NextResponse {
  return NextResponse.json(
    { success: false, error } satisfies ApiResponse,
    { status: 500 }
  );
}

// ============================================================
// MISC HELPERS
// ============================================================

/** Ambil user dari Supabase session, return null jika tidak login */
export function formatZodErrors(errors: Record<string, string[]>): string {
  return Object.entries(errors)
    .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
    .join("; ");
}

/** Cek apakah file upload valid */
export function validateFileUpload(
  file: File,
  opts: { maxSizeMB?: number; allowedTypes?: string[] } = {}
): string | null {
  const { maxSizeMB = 5, allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"] } = opts;

  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Ukuran file maksimal ${maxSizeMB}MB`;
  }

  if (!allowedTypes.includes(file.type)) {
    return `Format file tidak didukung. Gunakan: ${allowedTypes.join(", ")}`;
  }

  return null;
}

/** Generate slug dari string */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
