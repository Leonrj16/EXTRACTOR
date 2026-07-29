export const ACCESS_TOKEN_COOKIE = "bio_access_token";
export const REFRESH_TOKEN_COOKIE = "bio_refresh_token";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};
