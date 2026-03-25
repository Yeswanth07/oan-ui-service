import { useMutation } from "@tanstack/react-query";
import { request } from "@/config/request";
import { useAuthStore } from "@/hooks/store/auth";
import { LoginPayload, LoginResponse } from "./type";

const login = (payload: LoginPayload) =>
  request<LoginResponse>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      gotrue_meta_security: payload.gotrue_meta_security ?? { captcha_token: null },
    }),
    skipAuth: true,
  });

export const useLogin = () =>
  useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      useAuthStore
        .getState()
        .setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: data.expires_at || Math.floor(Date.now() / 1000) + data.expires_in,
          user: data.user,
        });
    },
  });
