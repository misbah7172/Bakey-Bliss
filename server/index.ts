import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// Local imports only - we'll use dynamic imports for database setup
// to avoid errors in environments without MySQL

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Setup database - this will create it if it doesn't exist (for local MySQL development)
  try {
    log("🔄 Checking database connection...");
    // Try to dynamically import and setup database
    const database = await import("./database.mjs").catch(() => {
      log("⚠️ Database module not available in this environment.");
      return { setupDatabase: async () => false };
    });
    
    const dbSetupSuccess = await database.setupDatabase();
    if (dbSetupSuccess) {
      log("✅ Database setup completed successfully");
    } else {
      log("⚠️ Running without MySQL database. Using in-memory storage instead.");
    }
  } catch (error: any) {
    log(`❌ Database setup failed: ${error.message}`);
    log("⚠️ Running without MySQL database. Using in-memory storage instead.");
  }
  
  // Initialize persistent storage (database or memory fallback)
  try {
    const { initializeStorage } = await import('./storage');
    await initializeStorage();
    log("✅ Storage initialized successfully");
  } catch (error: any) {
    log(`❌ Storage initialization failed: ${error.message}`);
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  app.listen(port, () => {
    log(`serving on port ${port}`);
  });
})();
