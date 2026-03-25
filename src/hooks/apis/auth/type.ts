import { User } from "@/hooks/store/auth/type";

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: "bearer";
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
  gotrue_meta_security?: {
    captcha_token: string | null;
  };
};

