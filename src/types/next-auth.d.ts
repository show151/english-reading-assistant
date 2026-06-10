import type { UserRole } from "@/lib/types";
import "next-auth";

declare module "next-auth" {
  interface User {
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    dbUserId?: string;
  }
}
