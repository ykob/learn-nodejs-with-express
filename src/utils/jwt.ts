import jwt from "jsonwebtoken";
import { env } from "../env";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ user: userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "5m",
  });
};

export const generateRefreshToken = (userId: string, jti: string) => {
  return jwt.sign({ user: userId, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: "8h",
  });
};

export const generateTokens = (userId: string, jti: string) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, jti);

  return { accessToken, refreshToken };
};
