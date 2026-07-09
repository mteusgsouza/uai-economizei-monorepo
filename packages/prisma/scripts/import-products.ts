import "dotenv/config";
import { createPrismaClient } from "../src/index";
import { Genre } from "../generated";
import * as fs from "fs";
import * as path from "path";

interface JsonProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  authors: string[];
  categories: string[];
  tags: string[];
  genre: string | null;
  label: string;
  publication_date: string;
  url: string;
  publisher: {
    id: number;
    name: string;
    category: string;
  };
}

const VALID_GENRES = new Set<string>(Object.values(Genre));
const BATCH_SIZE = 50;

function toGenre(value: string | null): Genre | null {
  if (!value) return null;
  if (VALID_GENRES.has(value)) return value as Genre;
  console.warn(`  ⚠ Genre "${value}" not in enum, setting null`);
  return null;
}

async function main() {
  const prisma = createPrismaClient();

  const jsonPath = path.resolve(process.cwd(), "products.json");
  console.log(`📄 Reading ${jsonPath}...`);

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const products: JsonProduct[] = JSON.parse(raw);

  console.log(`📦 ${products.length} products to import\n`);

  let created = 0;
  let updated = 0;
  let errors = 0;
  let processed = 0;

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);

    for (const item of batch) {
      try {
        // Ensure publisher exists
        const publisher = await prisma.publisher.upsert({
          where: { id: item.publisher.id },
          create: {
            id: item.publisher.id,
            name: item.publisher.name,
            category: item.publisher.category,
          },
          update: {
            name: item.publisher.name,
            category: item.publisher.category,
          },
        });

        // Upsert product by URL (unique natural key)
        const result = await prisma.product.upsert({
          where: { url: item.url },
          create: {
            name: item.name,
            price: item.price,
            image: item.image,
            authors: item.authors,
            categories: item.categories.filter((c) => c !== ""),
            tags: item.tags,
            genre: toGenre(item.genre),
            label: item.label,
            publication_date: new Date(item.publication_date),
            url: item.url,
            publisherId: publisher.id,
            circle: null,
            type_of_work: null,
            description: null,
            preview_images: [],
          },
          update: {
            name: item.name,
            price: item.price,
            image: item.image,
            authors: item.authors,
            categories: item.categories.filter((c) => c !== ""),
            tags: item.tags,
            genre: toGenre(item.genre),
            label: item.label,
            publication_date: new Date(item.publication_date),
            publisherId: publisher.id,
          },
        });

        if (result.createdAt.getTime() === result.updatedAt?.getTime() || !result.updatedAt) {
          created++;
        } else {
          updated++;
        }
      } catch (err: any) {
        errors++;
        console.error(`  ❌ Error on "${item.name}" (id=${item.id}): ${err.message}`);
      }
    }

    processed += batch.length;
    console.log(`  ⏳ ${processed}/${products.length} processed...`);
  }

  console.log(`\n✅ Done! Created: ${created}, Updated: ${updated}, Errors: ${errors}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
