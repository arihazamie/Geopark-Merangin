import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const prismaEdge = new PrismaClient().$extends(withAccelerate());

export default prismaEdge;
