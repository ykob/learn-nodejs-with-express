import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { env } from "./env";

export const generateAccessToken = (user: Prisma.UserSelect) => {
  return jwt.sign({ user: user.id }, env.JWT_ACCESS_SECRET, {
    expiresIn: "5m",
  });
};

export const generateRefreshToken = (user: Prisma.UserSelect, jti: string) => {
  return jwt.sign({ user: user.id, jti }, env.JWT_REFRESH_SECRET, {
    expiresIn: "8h",
  });
};

export const generateTokens = (user: Prisma.UserSelect, jti: string) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);

  return { accessToken, refreshToken };
};
