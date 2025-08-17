import { PrismaClient } from "@prisma/client/edge";
import * as accelerate from "@prisma/extension-accelerate";

export const prismaEdge = new PrismaClient({
  datasourceUrl: process.env.PRISMA_DATABASE_URL,
}).$extends(accelerate.withAccelerate());
