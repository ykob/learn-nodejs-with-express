import express from "express";
import { v4 as uuidv4 } from "uuid";
import { generateTokens } from "../../utils/jwt";
import {
  createUserByEmailAndPassword,
  findUserByEmail,
} from "../users/users.services";
import { addRefreshTokenToWhitelist } from "./auth.services";

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

export default router;
