import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  conflict,
  serverError,
} from "@/lib/utils/api";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return unauthorized();

    const { data: result, error: rpcError } = await supabase.rpc(
      "confirm_booking_atomic",
      {
        p_booking_id:      id,
        p_vendor_user_id:  user.id,
      }
    );

    if (rpcError) return serverError(rpcError.message);

    if (!result.success) {
      switch (result.code) {
        case "NOT_FOUND":
          return notFound(result.message);
        case "FORBIDDEN":
          return forbidden(result.message);
        case "INVALID_STATUS":
        case "DATE_CONFLICT":
          return conflict(result.message);
        default:
          return serverError(result.message);
      }
    }

    return ok({
      booking: result.booking,
      message:
        "Booking dikonfirmasi dan tanggal telah dikunci. User perlu mengupload bukti DP.",
    });
  } catch {
    return serverError();
  }
}