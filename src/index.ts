import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json({ users });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
