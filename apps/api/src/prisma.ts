import "dotenv/config"; //Carga las variables del .env en process.env; así DATABASE_URL no queda undefined y Prisma sabe a qué base conectarse
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg"; //adaptador específico para PostgreSQL
import { Pool } from "pg"; //es el driver clásico de Postgres para Node

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL missing. Revisa tu .env"); //lee el string de conexión desde el .env
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter }); //crea el cliente Prisma usando ese adapter



