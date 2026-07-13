import "dotenv/config";
import { createPrismaClient } from "../src/index";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BATCH_SIZE = 50;
const DRY_RUN = process.argv.includes("--dry-run");
const ORDERS_ONLY = process.argv.includes("--orders-only");
const DELETE_ORDERS = process.argv.includes("--delete-orders");

// Find service account JSON: check env vars, then look at project root
function loadServiceAccount(): Record<string, unknown> {
  // 1. FIREBASE_SERVICE_ACCOUNT env var (raw JSON string)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  // 2. GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON file)
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const filePath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
  }

  // 3. Look for service account JSON at monorepo root
  const rootDir = path.resolve(__dirname, "..", "..", "..");
  const candidates = fs
    .readdirSync(rootDir)
    .filter(
      (f) =>
        f.startsWith("uai-economizei") &&
        f.endsWith(".json") &&
        f.includes("firebase")
    );

  for (const file of candidates) {
    const filePath = path.join(rootDir, file);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      if (content.type === "service_account") {
        console.log(`🔑 Using service account: ${filePath}`);
        return content;
      }
    } catch {
      // skip unreadable files
    }
  }

  throw new Error(
    "❌ No service account found. Set FIREBASE_SERVICE_ACCOUNT env var or place the JSON at project root."
  );
}

const serviceAccount = loadServiceAccount();

const firebaseApp = initializeApp({
  credential: cert(serviceAccount as any),
  projectId: (serviceAccount.project_id as string) ?? "uai-economizei",
});

const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);
const prisma = createPrismaClient();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fromTimestamp(ts: Timestamp): Date {
  return ts.toDate();
}

function log(msg: string) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function dryLog(msg: string) {
  if (DRY_RUN) console.log(`  🏷 DRY-RUN: ${msg}`);
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

const stats = {
  brands: { created: 0, skipped: 0, errors: 0 },
  categories: { created: 0, skipped: 0, errors: 0 },
  subcategories: { created: 0, skipped: 0, errors: 0 },
  cep: { created: 0, skipped: 0, errors: 0 },
  banners: { created: 0, skipped: 0, errors: 0 },
  products: { created: 0, skipped: 0, errors: 0 },
  customers: { created: 0, skipped: 0, errors: 0 },
  addresses: { created: 0, skipped: 0, errors: 0 },
  orders: { created: 0, skipped: 0, errors: 0 },
  orderItems: { created: 0, skipped: 0, errors: 0 },
  payments: { created: 0, skipped: 0, errors: 0 },
};

function printStats() {
  console.log("\n📊 Import Summary:");
  for (const [entity, s] of Object.entries(stats)) {
    if (s.created > 0 || s.errors > 0 || s.skipped > 0) {
      console.log(
        `  ${entity}: created=${s.created}, skipped=${s.skipped}, errors=${s.errors}`
      );
    }
  }
}

async function deleteAllOrders() {
  if (DRY_RUN) {
    log("🏷  DRY-RUN: Would delete all existing orders, order items, and payments");
    return;
  }

  log("🗑  Deleting existing orders...");

  // Delete in correct order due to foreign key constraints
  const deletedPayments = await prisma.payment.deleteMany();
  log(`  Deleted ${deletedPayments.count} payments`);

  const deletedItems = await prisma.orderItem.deleteMany();
  log(`  Deleted ${deletedItems.count} order items`);

  const deletedOrders = await prisma.order.deleteMany();
  log(`  Deleted ${deletedOrders.count} orders`);

  log("✅ All existing orders cleared");
}

// ---------------------------------------------------------------------------
// Phase 1: Independent lookup tables
// ---------------------------------------------------------------------------

async function importBrands() {
  log("🏷  Importing brands...");
  const snapshot = await db.collection("brands").get();

  if (DRY_RUN) {
    console.log(`  Found ${snapshot.size} brands (dry-run, skipping insert)`);
    // Return a map for dry-run
    const map = new Map<string, number>();
    snapshot.forEach((doc) => {
      const data = doc.data();
      map.set(data.name, 0); // placeholder id
    });
    return map;
  }

  const brandMap = new Map<string, number>();
  let batch: any[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const name = data.name as string;

    try {
      const brand = await prisma.brand.upsert({
        where: { name },
        create: { name },
        update: { name },
      });
      brandMap.set(name, brand.id);
      stats.brands.created++;
    } catch (err: any) {
      stats.brands.errors++;
      console.error(`  ❌ Brand "${name}": ${err.message}`);
    }
  }

  log(`✅ Brands: ${brandMap.size} imported`);
  return brandMap;
}

async function importCategories() {
  log("📁 Importing categories...");
  const snapshot = await db.collection("categories").get();

  if (DRY_RUN) {
    console.log(
      `  Found ${snapshot.size} categories (dry-run, skipping insert)`
    );
    const catMap = new Map<string, number>();
    const titleMap = new Map<string, number>();
    snapshot.forEach((doc) => {
      const data = doc.data();
      catMap.set(data.categorySlug, 0);
      titleMap.set(data.title, 0);
    });
    return { categoryMap: catMap, categoryTitleMap: titleMap };
  }

  const categoryMap = new Map<string, number>(); // categorySlug → categoryId
  const categoryTitleMap = new Map<string, number>(); // title → categoryId

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const title = data.title as string;
    const categorySlug = data.categorySlug as string;
    const subcategories = (data.subcategory ?? []) as {
      title: string;
      subcatSlug: string;
    }[];

    try {
      const category = await prisma.category.upsert({
        where: { categorySlug },
        create: {
          title,
          categorySlug,
        },
        update: { title },
      });
      categoryMap.set(categorySlug, category.id);
      categoryTitleMap.set(title, category.id);
      stats.categories.created++;

      // Subcategories
      for (const sub of subcategories) {
        // Skip empty subcategories
        if (!sub.title || sub.title.trim() === "") continue;
        // Generate subcatSlug from title if missing
        const subcatSlug =
          sub.subcatSlug ||
          sub.title
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

        try {
          await prisma.subcategory.upsert({
            where: {
              subcatSlug_categoryId: {
                subcatSlug: subcatSlug,
                categoryId: category.id,
              },
            },
            create: {
              title: sub.title,
              subcatSlug: subcatSlug,
              categoryId: category.id,
            },
            update: { title: sub.title },
          });
          stats.subcategories.created++;
        } catch (err: any) {
          stats.subcategories.errors++;
          console.error(
            `  ❌ Subcategory "${sub.title}": ${err.message}`
          );
        }
      }
    } catch (err: any) {
      stats.categories.errors++;
      console.error(`  ❌ Category "${title}": ${err.message}`);
    }
  }

  log(
    `✅ Categories: ${categoryMap.size} imported, ${stats.subcategories.created} subcategories`
  );
  return { categoryMap, categoryTitleMap };
}

async function importCep() {
  log("🚚 Importing CEP shipping rates...");
  const snapshot = await db.collection("cep").get();

  if (DRY_RUN) {
    console.log(
      `  Found ${snapshot.size} CEP entries (dry-run, skipping insert)`
    );
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    try {
      await prisma.cepShipping.create({
        data: {
          cepInicial: Number(data.cepInicial),
          cepFinal: Number(data.cepFinal),
          descricao: data.descricao as string,
          valor: Number(data.valor),
        },
      });
      stats.cep.created++;
    } catch (err: any) {
      stats.cep.errors++;
      console.error(
        `  ❌ CEP ${data.cepInicial}-${data.cepFinal}: ${err.message}`
      );
    }
  }

  log(`✅ CEP: ${stats.cep.created} imported`);
}

async function importBanners() {
  log("🖼  Importing banners...");
  const snapshot = await db.collection("banners").get();

  if (DRY_RUN) {
    console.log(
      `  Found ${snapshot.size} banners (dry-run, skipping insert)`
    );
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    try {
      // bannerImg is an object { name, url } in Firebase
      const bannerImg =
        typeof data.bannerImg === "object" && data.bannerImg !== null
          ? (data.bannerImg as any).url ?? ""
          : (data.bannerImg ?? "") as string;

      await prisma.banner.create({
        data: {
          bannerImg,
          url: (data.url ?? "") as string,
        },
      });
      stats.banners.created++;
    } catch (err: any) {
      stats.banners.errors++;
      console.error(`  ❌ Banner: ${err.message}`);
    }
  }

  log(`✅ Banners: ${stats.banners.created} imported`);
}

// ---------------------------------------------------------------------------
// Phase 2: Products
// ---------------------------------------------------------------------------

async function importProducts(
  brandMap: Map<string, number>,
  categoryMap: Map<string, number>,
  categoryTitleMap: Map<string, number>
) {
  log("📦 Importing products...");
  const snapshot = await db.collection("products").get();
  const total = snapshot.size;

  if (DRY_RUN) {
    console.log(`  Found ${total} products (dry-run, skipping insert)`);
    return new Map<string, number>();
  }

  const productMap = new Map<string, number>();
  const docs = snapshot.docs;
  let processed = 0;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE);

    for (const doc of batch) {
      const data = doc.data();
      const name = data.name as string;
      const brandName = ((data.brand as string) ?? "").trim();
      // Assign empty brands to "Sem marca"
      const effectiveBrand = brandName || "Sem marca";
      let brandId = brandMap.get(effectiveBrand);
      if (!brandId) {
        // Create the brand on the fly if missing
        try {
          const brand = await prisma.brand.upsert({
            where: { name: effectiveBrand },
            create: { name: effectiveBrand },
            update: {},
          });
          brandMap.set(effectiveBrand, brand.id);
          brandId = brand.id;
        } catch (err: any) {
          stats.products.errors++;
          continue;
        }
      }
      const categoryData = data.category as { category?: string; id?: string; subcategory?: string } | undefined;
      // Try matching by title first, then by slug
      const categoryTitle = categoryData?.category ?? "";
      const catId = categoryTitleMap.get(categoryTitle) ?? categoryMap.get(categoryTitle);
      const mainImg =
        typeof data.productMainImg === "object" && data.productMainImg !== null
          ? (data.productMainImg as any).url ?? ""
          : (data.productMainImg ?? "") as string;

      if (!brandId) {
        // This shouldn't happen now, but just in case
        stats.products.errors++;
        console.error(
          `  ❌ Product "${name}": brand resolution failed`
        );
        continue;
      }

      if (!catId) {
        stats.products.errors++;
        console.error(
          `  ❌ Product "${name}": category "${categoryTitle}" not found`
        );
        continue;
      }

      try {
        const product = await prisma.product.create({
          data: {
            name,
            description: (data.description ?? "") as string,
            active: (data.active as boolean) ?? true,
            isNew: (data.isNew as string) ?? "false",
            brandId,
            categoryId: catId,
            paidPrice: Number(data.paidPrice ?? 0),
            value: Number(data.value ?? 0),
            stock: Number(data.stock ?? 0),
            productMainImg: mainImg,
            productImages: (data.productImages ?? []) as any,
            createdAt: data.createdAt
              ? fromTimestamp(data.createdAt)
              : new Date(),
          },
        });
        productMap.set(name, product.id);
        stats.products.created++;
      } catch (err: any) {
        stats.products.errors++;
        console.error(`  ❌ Product "${name}": ${err.message}`);
      }
    }

    processed += batch.length;
    if (processed % BATCH_SIZE === 0 || processed === total) {
      console.log(`  ⏳ ${processed}/${total} products processed...`);
    }
  }

  log(`✅ Products: ${stats.products.created} imported`);
  return productMap;
}

// ---------------------------------------------------------------------------
// Phase 3: Customers
// ---------------------------------------------------------------------------

async function importCustomers() {
  log("👤 Importing customers (users)...");
  const snapshot = await db.collection("users").get();

  if (DRY_RUN) {
    console.log(
      `  Found ${snapshot.size} users (dry-run, skipping insert)`
    );
    return new Map<string, string>(); // email → customerId
  }

  const customerMap = new Map<string, string>(); // email → customerId

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const email = data.emailAddress as string;
    const addresses = (data.address ?? []) as any[];

    try {
      // Check if customer already exists by email
      const existing = await prisma.customer.findUnique({
        where: { email },
      });

      if (existing) {
        customerMap.set(email, existing.id);
        stats.customers.skipped++;
      } else {
        const customer = await prisma.customer.create({
          data: {
            email,
            firstName: (data.firstName ?? "") as string,
            username: (data.username ?? "") as string,
            phone: (data.phone ?? "") as string,
            verifiedUser: (data.verifiedUser as boolean) ?? false,
            theme: (data.theme ?? null) as any,
          },
        });
        customerMap.set(email, customer.id);
        stats.customers.created++;
      }

      // Import addresses
      const customerId =
        existing?.id ??
        (
          await prisma.customer.findUnique({ where: { email } })
        )!.id;

      for (const addr of addresses) {
        try {
          await prisma.address.create({
            data: {
              customerId,
              street: (addr.logradouro ?? "") as string,
              number: (addr.numero ?? "") as string,
              complement: (addr.complemento ?? "") as string,
              neighborhood: (addr.bairro ?? "") as string,
              city: (addr.localidade ?? "") as string,
              state: (addr.uf ?? "") as string,
              postalCode: (addr.cep ?? "") as string,
            },
          });
          stats.addresses.created++;
        } catch (err: any) {
          stats.addresses.errors++;
          console.error(`  ❌ Address for ${email}: ${err.message}`);
        }
      }
    } catch (err: any) {
      stats.customers.errors++;
      console.error(`  ❌ Customer "${email}": ${err.message}`);
    }
  }

  log(
    `✅ Customers: ${stats.customers.created} created, ${stats.customers.skipped} existing`
  );
  return customerMap;
}

// ---------------------------------------------------------------------------
// Phase 4: Orders
// ---------------------------------------------------------------------------

async function buildCustomerMapFromDb(): Promise<Map<string, string>> {
  const customers = await prisma.customer.findMany({
    select: { id: true, email: true },
  });
  const map = new Map<string, string>();
  for (const c of customers) {
    map.set(c.email, c.id);
  }
  return map;
}

async function buildProductMapFromDb(): Promise<Map<string, number>> {
  const products = await prisma.product.findMany({
    select: { id: true, name: true },
  });
  const map = new Map<string, number>();
  for (const p of products) {
    map.set(p.name, p.id);
  }
  return map;
}

async function buildBrandMapFromDb(): Promise<Map<string, number>> {
  const brands = await prisma.brand.findMany({
    select: { id: true, name: true },
  });
  const map = new Map<string, number>();
  for (const b of brands) {
    map.set(b.name, b.id);
  }
  return map;
}

async function buildCategoryMapsFromDb(): Promise<{
  categoryMap: Map<string, number>;
  categoryTitleMap: Map<string, number>;
}> {
  const categories = await prisma.category.findMany({
    select: { id: true, title: true, categorySlug: true },
  });
  const categoryMap = new Map<string, number>(); // categorySlug → id
  const categoryTitleMap = new Map<string, number>(); // title → id
  for (const c of categories) {
    categoryMap.set(c.categorySlug, c.id);
    categoryTitleMap.set(c.title, c.id);
  }
  return { categoryMap, categoryTitleMap };
}

async function importOrders(
  customerMap: Map<string, string>,
  productMap: Map<string, number>,
  brandMap: Map<string, number>,
  categoryTitleMap: Map<string, number>,
  categorySlugMap: Map<string, number>
) {
  log("🛒 Importing orders...");
  const snapshot = await db.collection("orders").get();

  if (DRY_RUN) {
    console.log(
      `  Found ${snapshot.size} orders (dry-run, skipping insert)`
    );
    return;
  }

  // Firebase orders: status is a number, nested order object
  const STATUS_MAP: Record<number, string> = {
    0: "PENDING",
    1: "CONFIRMED",
    2: "SHIPPED",
    3: "DELIVERED",
    4: "CANCELLED",
    5: "PREORDER",
  };

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const orderData = data.order as any;
    // Try multiple possible field names for user email
    const userEmail =
      orderData?.user?.emailAddress ??
      orderData?.user?.email ??
      orderData?.email ??
      "";
    const customerId = customerMap.get(userEmail);

    // Debug first few failures to understand the structure
    if (!customerId && stats.orders.errors < 3) {
      console.error(
        `  🔍 Debug Order ${doc.id}: user fields available: ${JSON.stringify(Object.keys(orderData?.user ?? {}))}, user data: ${JSON.stringify(orderData?.user)}`
      );
    }

    if (!customerId) {
      stats.orders.errors++;
      console.error(
        `  ❌ Order ${doc.id}: customer "${userEmail}" not found`
      );
      continue;
    }

    const cart = orderData?.cart as any;
    const cartProducts = (cart?.products ?? []) as any[];

    try {
      const statusEnum =
        STATUS_MAP[data.status as number] ?? "PENDING";

      // Calculate subtotal from cart items
      let subtotal = 0;
      let totalProducts = 0;
      const orderItemsData: { productId: number; quantity: number; unitPrice: number }[] = [];

      for (const item of cartProducts) {
        // Try to find product by name
        const productName = item.name as string;
        let productId = productMap.get(productName);

        if (!productId) {
          // Fallback: create the product from cart item data
          const itemValue = Math.round(Number(item.value ?? 0) * 100);
          const itemPaidPrice =
            item.paidPrice != null
              ? Math.round(Number(item.paidPrice) * 100)
              : itemValue;
          const imgObj = item.productMainImg as
            | { url?: string }
            | undefined;
          const mainImg =
            typeof imgObj === "object" && imgObj !== null
              ? (imgObj.url ?? "")
              : "";
          const brandName =
            (item.brand as string)?.trim() || "Sem marca";
          const catInfo = item.category as
            | { category?: string; categorySlug?: string }
            | undefined;

          // Resolve/create brand
          let brandId = brandMap.get(brandName);
          if (!brandId) {
            try {
              const brand = await prisma.brand.upsert({
                where: { name: brandName },
                create: { name: brandName },
                update: {},
              });
              brandMap.set(brandName, brand.id);
              brandId = brand.id;
            } catch (err: any) {
              console.error(
                `  ❌ Could not create brand "${brandName}": ${err.message}`
              );
            }
          }

          // Resolve category (try categorySlug first, then title)
          let catId = catInfo?.categorySlug
            ? categorySlugMap.get(catInfo.categorySlug)
            : undefined;
          if (!catId && catInfo?.category) {
            catId = categoryTitleMap.get(catInfo.category);
          }
          // Fallback: use first available category
          if (!catId) {
            catId = categorySlugMap.values().next().value ?? 1;
          }

          try {
            const product = await prisma.product.create({
              data: {
                name: productName,
                brandId: brandId ?? 1,
                categoryId: catId ?? 1,
                paidPrice: itemPaidPrice,
                value: itemValue,
                stock: Number(item.stock ?? 0),
                productMainImg: mainImg,
                productImages: Array.isArray(item.productImages)
                  ? item.productImages
                  : [],
                active: false, // flag for review
                isNew: (item.isNew as string) ?? "false",
                description: (item.description as string) ?? "",
              },
            });
            productMap.set(productName, product.id);
            productId = product.id;
            stats.products.created++;
            console.log(
              `  🆕 Created product "${productName}" (id=${product.id}) from order data`
            );
          } catch (err: any) {
            console.warn(
              `  ⚠ Order ${doc.id}: could not create product "${productName}": ${err.message}`
            );
            continue;
          }
        }

        const quantity = Number(item.quantity ?? 1);
        const unitPrice = Math.round(Number(item.price ?? item.value ?? 0) * 100);
        subtotal += unitPrice * quantity;
        totalProducts += quantity;

        orderItemsData.push({ productId, quantity, unitPrice });
      }

      if (orderItemsData.length === 0) {
        stats.orders.errors++;
        console.error(
          `  ❌ Order ${doc.id}: no valid products found in cart`
        );
        continue;
      }

      // Try to match the order's address to an existing Prisma address
      const orderAddress = orderData?.address as any;
      let addressId: number | null = null;
      if (orderAddress?.cep && customerId) {
        const existingAddress = await prisma.address.findFirst({
          where: {
            customerId,
            postalCode: (orderAddress.cep ?? "") as string,
          },
        });
        if (existingAddress) {
          addressId = existingAddress.id;
        } else {
          // Create address on the fly if not found
          try {
            const newAddress = await prisma.address.create({
              data: {
                customerId,
                street: (orderAddress.logradouro ?? "") as string,
                number: (orderAddress.numero ?? "") as string,
                complement: (orderAddress.complemento ?? "") as string,
                neighborhood: (orderAddress.bairro ?? "") as string,
                city: (orderAddress.localidade ?? "") as string,
                state: (orderAddress.uf ?? "") as string,
                postalCode: (orderAddress.cep ?? "") as string,
              },
            });
            addressId = newAddress.id;
            stats.addresses.created++;
          } catch (err: any) {
            console.warn(
              `  ⚠ Order ${doc.id}: could not create address: ${err.message}`
            );
          }
        }
      }

      const cepValueInCents = Math.round(Number(orderData?.cepValue ?? 0) * 100);
      const paymentAmount = subtotal + cepValueInCents;

      const orderDates = {
        createdAt: data.createdAt
          ? fromTimestamp(data.createdAt as Timestamp)
          : undefined,
        updatedAt: data.updatedAt
          ? fromTimestamp(data.updatedAt as Timestamp)
          : undefined,
      };

      const order = await prisma.order.create({
        data: {
          customerId,
          status: statusEnum as any,
          cepValue: cepValueInCents,
          retiraBalcao: Boolean(orderData?.retiraBalcao ?? false),
          totalProducts,
          subtotal,
          ...(addressId ? { addressId } : {}),
          ...(orderDates.createdAt ? { createdAt: orderDates.createdAt } : {}),
          ...(orderDates.updatedAt ? { updatedAt: orderDates.updatedAt } : {}),
          items: {
            create: orderItemsData.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          payments: {
            create: {
              method: "PIX", // default, adjust based on actual data
              status: "COMPLETED",
              amount: paymentAmount,
              ...(orderDates.createdAt
                ? { createdAt: orderDates.createdAt }
                : {}),
              ...(orderDates.updatedAt
                ? { updatedAt: orderDates.updatedAt }
                : {}),
            },
          },
        },
      });

      stats.orders.created++;
      stats.orderItems.created += orderItemsData.length;
      stats.payments.created++;
    } catch (err: any) {
      stats.orders.errors++;
      console.error(`  ❌ Order ${doc.id}: ${err.message}`);
    }
  }

  log(
    `✅ Orders: ${stats.orders.created} imported (${stats.orderItems.created} items, ${stats.payments.created} payments)`
  );
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  log("🔥 Firebase → Neon Import Script");
  log(
    `Mode: ${DRY_RUN ? "DRY RUN (no writes)" : "LIVE"}, ${ORDERS_ONLY ? "ORDERS ONLY" : "FULL IMPORT"}`
  );
  log("");

  let brandMap: Map<string, number>;
  let categoryMap: Map<string, number>;
  let categoryTitleMap: Map<string, number>;
  let productMap: Map<string, number>;
  let customerMap: Map<string, string>;

  if (ORDERS_ONLY) {
    // Build lookup maps from existing database records
    log("📦 Building lookup maps from database...");
    customerMap = await buildCustomerMapFromDb();
    log(`  Customers in DB: ${customerMap.size}`);
    productMap = await buildProductMapFromDb();
    log(`  Products in DB: ${productMap.size}`);
    brandMap = await buildBrandMapFromDb();
    log(`  Brands in DB: ${brandMap.size}`);
    const cats = await buildCategoryMapsFromDb();
    categoryMap = cats.categoryMap;
    categoryTitleMap = cats.categoryTitleMap;
    log(`  Categories in DB: ${categoryTitleMap.size}`);
  } else {
    // Phase 1: Independent tables
    log("═".repeat(50));
    log("PHASE 1: Lookup Tables");
    log("═".repeat(50));
    brandMap = await importBrands();
    const cats = await importCategories();
    categoryMap = cats.categoryMap;
    categoryTitleMap = cats.categoryTitleMap;
    await importCep();
    await importBanners();

    // Phase 2: Products
    log("");
    log("═".repeat(50));
    log("PHASE 2: Products");
    log("═".repeat(50));
    productMap = await importProducts(brandMap, categoryMap, categoryTitleMap);

    // Phase 3: Customers
    log("");
    log("═".repeat(50));
    log("PHASE 3: Customers");
    log("═".repeat(50));
    customerMap = await importCustomers();
  }

  // Delete existing orders before re-importing
  if (DELETE_ORDERS) {
    log("");
    log("═".repeat(50));
    await deleteAllOrders();
  }

  // Phase 4: Orders
  log("");
  log("═".repeat(50));
  log("PHASE 4: Orders");
  log("═".repeat(50));
  await importOrders(customerMap, productMap, brandMap, categoryTitleMap, categoryMap);

  // Summary
  log("");
  log("═".repeat(50));
  log("IMPORT COMPLETE");
  log("═".repeat(50));
  printStats();

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  prisma.$disconnect();
  process.exit(1);
});
