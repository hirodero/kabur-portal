interface AuthErrorDescriptor {
    title: string;
    description: string;
  }
  
  interface AuthErrorRule {
    status: number;
    messageIncludes?: string;
    code: string;
  }
  
  export const AUTH_ERROR_MESSAGES: Record<string, AuthErrorDescriptor> = {
    "invalid-token": {
      title: "Token tidak valid",
      description:
        "Sesi Google kamu kadaluarsa atau tidak valid. Coba login ulang.",
    },
    "unverified-email": {
      title: "Email belum diverifikasi",
      description:
        "Silakan verifikasi email kamu terlebih dahulu sebelum melanjutkan.",
    },
    "inactive-account": {
      title: "Akun belum diaktifkan",
      description:
        "Tim kami belum mengaktifkan akunmu. Hubungi support untuk bantuan.",
    },
    "invalid-referral": {
      title: "Referral code tidak valid",
      description: "Kode referral yang kamu gunakan tidak valid atau sudah nonaktif.",
    },
    "auth-failed": {
      title: "Login gagal",
      description: "Terjadi kendala saat login. Coba lagi beberapa saat lagi.",
    },
  };
  
  const AUTH_ERROR_RULES: AuthErrorRule[] = [
    { status: 401, code: "invalid-token" },
    { status: 403, messageIncludes: "belum diverifikasi", code: "unverified-email" },
    { status: 403, messageIncludes: "belum diaktifkan", code: "inactive-account" },
    { status: 400, messageIncludes: "referral code", code: "invalid-referral" },
  ];
  
  export function resolveAuthErrorCode(
    status?: number,
    message?: string
  ): string {
    if (!status) {
      return "auth-failed";
    }
  
    const normalizedMessage = message?.toLowerCase() ?? "";
  
    const matchedRule = AUTH_ERROR_RULES.find((rule) => {
      if (rule.status !== status) {
        return false;
      }
      if (!rule.messageIncludes) {
        return true;
      }
      return normalizedMessage.includes(rule.messageIncludes);
    });
  
    return matchedRule?.code ?? "auth-failed";
  }
  
  
  