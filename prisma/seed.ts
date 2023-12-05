import { PrismaClient } from "@prisma/client";
import { genSaltSync, hashSync } from "bcryptjs";

const prisma = new PrismaClient();

const users = [
  {
    name: "Alice",
    email: "alice@prisma.io",
    password: "12345678",
  },
  {
    name: "Bob",
    email: "bob@prisma.io",
    password: "87654321",
  },
];

async function main() {
  for (const user of users) {
    const password = await hashSync(user.password, genSaltSync(10));

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password,
      },
    });
  }

  const allUsers = await prisma.user.findMany();
  console.log(allUsers, { depth: null });
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
