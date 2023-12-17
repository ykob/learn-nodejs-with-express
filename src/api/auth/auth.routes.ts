import { compare } from "bcryptjs";
import express from "express";
import { verify } from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { hashToken } from "../../utils/hash-token";
import { generateTokens } from "../../utils/jwt";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
  findUserById,
} from "../users/users.services";
import {
  addRefreshTokenToWhitelist,
  deleteRefreshToken,
  findRefreshToken,
} from "./auth.services";

const router = express.Router();

router.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Missing fields.");
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      res.status(400);
      throw new Error("Email already in use.");
    }

    const { id } = await createUserByEmailAndPassword(email, password);
    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(id, jti);

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: id,
    });
    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("You must provide an email and a password.");
    }

    const existingUser = await findUserByEmail(email);

    if (!existingUser) {
      res.status(403);
      throw new Error("Invalid credentials.");
    }

    const validPassword = await compare(password, existingUser.password);

    if (!validPassword) {
      res.status(403);
      throw new Error("Invalid credentials.");
    }

    const jti = uuidv4();
    const { accessToken, refreshToken } = generateTokens(existingUser.id, jti);

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken,
      userId: existingUser.id,
    });

    res.json({ accessToken, refreshToken });
  } catch (error) {
    next(error);
  }
});

router.post("/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400);
      throw new Error("Missing refresh token.");
    }

    const payload = verify(refreshToken, process.env.JWT_REFRESH_SECRET!);

    if (typeof payload === "string" || payload.jti === undefined) {
      res.status(400);
      throw new Error("Invalid refresh token.");
    }

    const savedRefreshToken = await findRefreshToken(payload.jti);

    if (!savedRefreshToken || savedRefreshToken.revoked === true) {
      res.status(401);
      throw new Error("Unauthorized.");
    }

    const hashedToken = hashToken(refreshToken);

    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error("Unauthorized.");
    }

    const user = await findUserById(payload.userId);

    if (!user) {
      res.status(401);
      throw new Error("Unauthorized.");
    }

    await deleteRefreshToken(savedRefreshToken.id);

    const jti = uuidv4();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user.id,
      jti
    );

    await addRefreshTokenToWhitelist({
      jti,
      refreshToken: newRefreshToken,
      userId: user.id,
    });

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
});

export default router;
