import { PrismaClient } from "@prisma/client";
import { genSaltSync, hashSync } from "bcryptjs";
import { Request, Response, Router } from "express";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const users = await prisma.user.findMany();

  res.json({ users });
});

router.get("/:id", async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params?.id,
    },
  });

  res.json({ user });
});

router.post("/", async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  const hashedPassword = await hashSync(password, genSaltSync(10));
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    },
  });

  res.json({ user });
});

export default router;
