// prismaLocal.ts
import { PrismaClient } from "@prisma/client";

// Instance untuk lingkungan lokal tanpa ekstensi tambahan
const prisma = new PrismaClient();
export default prisma;
