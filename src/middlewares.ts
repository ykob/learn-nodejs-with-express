import { NextFunction, Request, Response } from "express";
import { TokenExpiredError, verify } from "jsonwebtoken";
import { env } from "./env";

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { authorization } = req.headers;

  if (!authorization) {
    res.status(401);
    throw new Error("🚫 Un-Authorized 🚫");
  }

  try {
    const token = authorization.split(" ")[1];
    const payload = verify(token, env.JWT_ACCESS_SECRET);

    console.log(payload);
  } catch (err) {
    res.status(401);
    if (err instanceof TokenExpiredError) {
      throw new Error(err.name);
    }
    throw new Error("🚫 Un-Authorized 🚫");
  }

  return next();
};
