var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  bookings: () => bookings,
  insertBookingSchema: () => insertBookingSchema,
  insertUserSchema: () => insertUserSchema,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name").notNull(),
  customerSurname: text("customer_surname").notNull(),
  guestCount: integer("guest_count").notNull(),
  roomNumber: integer("room_number").notNull(),
  checkinDate: date("checkin_date").notNull(),
  checkoutDate: date("checkout_date").notNull(),
  checkinTime: text("checkin_time").notNull().default("14:00"),
  checkoutTime: text("checkout_time").notNull().default("11:00"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import "dotenv/config";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getAllBookings() {
    return await db.select().from(bookings);
  }
  async getBookingsByDateRange(startDate, endDate) {
    const allBookings = await db.select().from(bookings);
    return allBookings.filter((booking) => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return checkin <= end && checkout >= start;
    });
  }
  async createBooking(insertBooking) {
    const [booking] = await db.insert(bookings).values({
      ...insertBooking,
      checkinTime: insertBooking.checkinTime || "14:00",
      checkoutTime: insertBooking.checkoutTime || "11:00"
    }).returning();
    return booking;
  }
  async deleteBooking(id) {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount > 0;
  }
  async getBookingsByDate(date2) {
    const allBookings = await db.select().from(bookings);
    return allBookings.filter((booking) => {
      const checkin = new Date(booking.checkinDate);
      const checkout = new Date(booking.checkoutDate);
      const targetDate = new Date(date2);
      return checkin <= targetDate && checkout >= targetDate;
    });
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
async function registerRoutes(app2) {
  app2.get("/api/bookings", async (req, res) => {
    try {
      const bookings2 = await storage.getAllBookings();
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Rezervasyonlar al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/bookings/range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Ba\u015Flang\u0131\xE7 ve biti\u015F tarihleri gerekli" });
      }
      const bookings2 = await storage.getBookingsByDateRange(
        startDate,
        endDate
      );
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Rezervasyonlar al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.get("/api/bookings/date/:date", async (req, res) => {
    try {
      const { date: date2 } = req.params;
      const bookings2 = await storage.getBookingsByDate(date2);
      res.json(bookings2);
    } catch (error) {
      res.status(500).json({ message: "Tarih rezervasyonlar\u0131 al\u0131n\u0131rken hata olu\u015Ftu" });
    }
  });
  app2.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const checkin = new Date(validatedData.checkinDate);
      const checkout = new Date(validatedData.checkoutDate);
      if (checkout <= checkin) {
        return res.status(400).json({ message: "\xC7\u0131k\u0131\u015F tarihi giri\u015F tarihinden sonra olmal\u0131d\u0131r" });
      }
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Rezervasyon olu\u015Fturulurken hata olu\u015Ftu" });
    }
  });
  app2.delete("/api/bookings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteBooking(id);
      if (!deleted) {
        return res.status(404).json({ message: "Rezervasyon bulunamad\u0131" });
      }
      res.json({ message: "Rezervasyon ba\u015Far\u0131yla silindi" });
    } catch (error) {
      res.status(500).json({ message: "Rezervasyon silinirken hata olu\u015Ftu" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
