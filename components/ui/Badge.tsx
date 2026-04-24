type BadgeVariant =
  | "pending" | "confirmed" | "waiting_payment" | "dp_verified"
  | "completed" | "rejected" | "cancelled"
  | "verified" | "unverified"
  | "admin" | "vendor" | "user"
  | "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  pending:         "bg-yellow-100 text-yellow-800",
  confirmed:       "bg-blue-100 text-blue-800",
  waiting_payment: "bg-orange-100 text-orange-800",
  dp_verified:     "bg-indigo-100 text-indigo-800",
  completed:       "bg-green-100 text-green-800",
  rejected:        "bg-red-100 text-red-800",
  cancelled:       "bg-gray-100 text-gray-600",
  verified:        "bg-green-100 text-green-700",
  unverified:      "bg-gray-100 text-gray-600",
  admin:           "bg-purple-100 text-purple-800",
  vendor:          "bg-indigo-100 text-indigo-800",
  user:            "bg-gray-100 text-gray-700",
  success:         "bg-green-100 text-green-800",
  warning:         "bg-yellow-100 text-yellow-800",
  danger:          "bg-red-100 text-red-800",
  info:            "bg-blue-100 text-blue-800",
  neutral:         "bg-gray-100 text-gray-600",
};

const LABEL_MAP: Partial<Record<BadgeVariant, string>> = {
  pending:         "Menunggu",
  confirmed:       "Dikonfirmasi",
  waiting_payment: "Menunggu DP",
  dp_verified:     "DP Terverifikasi",
  completed:       "Selesai",
  rejected:        "Ditolak",
  cancelled:       "Dibatalkan",
  verified:        "Terverifikasi",
  unverified:      "Belum Verifikasi",
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export default function Badge({ variant, label, className = "" }: BadgeProps) {
  const text = label ?? LABEL_MAP[variant] ?? variant;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {text}
    </span>
  );
}