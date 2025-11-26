import { PrismaClient, Products } from "@/generated/prisma/client";

export default async function productsQuery(
  query: string
): Promise<Products[]> {
  const prisma = new PrismaClient();

  const products = await prisma.products.findMany({
    where: {
      name: {
        contains: query,
      },
    },
  });

  return products;
}
