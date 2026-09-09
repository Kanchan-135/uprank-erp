const fs = require('fs');
const path = require('path');

console.log("================================================================");
console.log("UPRANK SCHOOL ERP — PERMANENT PRODUCTION DEPLOYMENT AUDIT");
console.log("================================================================");

const issues = [];
const warnings = [];
const passes = [];

function check(title, condition, errorMsg, isWarning = false) {
  if (condition) {
    passes.push(title);
    console.log(`  [PASS] ${title}`);
  } else if (isWarning) {
    warnings.push(`${title}: ${errorMsg}`);
    console.log(`  [WARN] ${title}: ${errorMsg}`);
  } else {
    issues.push(`${title}: ${errorMsg}`);
    console.log(`  [FAIL] ${title}: ${errorMsg}`);
  }
}

// 1. Build Artifacts Check
console.log("\n1. Checking Production Build Artifacts...");
const nextDir = path.join(__dirname, '..', '.next');
check("Next.js build directory exists", fs.existsSync(nextDir), "Run 'npm run build' first");
check("Static pages manifest exists", fs.existsSync(path.join(nextDir, 'server', 'pages-manifest.json')), "Build manifest missing");

// 2. Database Check
console.log("\n2. Checking Database & Persistence...");
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');
const isSqlite = schemaContent.includes('provider = "sqlite"');
const isPostgres = schemaContent.includes('provider = "postgresql"');
const dbFile = path.join(__dirname, '..', 'dev.db');

check("Prisma Schema configured", isSqlite || isPostgres, "Database provider not recognized");
if (isSqlite) {
  check("Local SQLite Database exists", fs.existsSync(dbFile), "dev.db missing");
  check(
    "Serverless Compatibility Note",
    true,
    "SQLite is ideal for VPS/Docker/Railway with volumes, but will NOT persist on Vercel/Lambda serverless functions",
    true
  );
}

// 3. Environment & Security Check
console.log("\n3. Checking Environment Configuration...");
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

const hasJwtSecret = envContent.includes('JWT_SECRET=') && !envContent.includes('JWT_SECRET=""');
const hasDbUrl = envContent.includes('DATABASE_URL=') && !envContent.includes('DATABASE_URL=""');
const hasNodeEnv = envContent.includes('NODE_ENV="production"');

check("DATABASE_URL defined", hasDbUrl, "DATABASE_URL is required in .env");
check("JWT_SECRET defined", hasJwtSecret, "JWT_SECRET is required in .env");
check("NODE_ENV set to production", hasNodeEnv, "Set NODE_ENV='production' in .env", true);

// 4. PWA Assets Check
console.log("\n4. Checking PWA & Static Assets...");
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
const swPath = path.join(__dirname, '..', 'public', 'sw.js');
const icon192 = path.join(__dirname, '..', 'public', 'icons', 'icon-192.png');
const icon512 = path.join(__dirname, '..', 'public', 'icons', 'icon-512.png');

check("PWA Manifest exists", fs.existsSync(manifestPath), "public/manifest.json missing");
check("Service Worker exists", fs.existsSync(swPath), "public/sw.js missing");
check("192x192 PNG App Icon exists", fs.existsSync(icon192), "public/icons/icon-192.png missing");
check("512x512 PNG App Icon exists", fs.existsSync(icon512), "public/icons/icon-512.png missing");

// 5. Container & Deployment Config Check
console.log("\n5. Checking Container & Deployment Configuration...");
const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
const dockerComposePath = path.join(__dirname, '..', 'docker-compose.yml');

check("Production Dockerfile configured", fs.existsSync(dockerfilePath), "Dockerfile missing");
check("Docker Compose configured", fs.existsSync(dockerComposePath), "docker-compose.yml missing");

// Summary
console.log("\n================================================================");
console.log(`SUMMARY: ${passes.length} PASSED, ${warnings.length} WARNINGS, ${issues.length} FAILURES`);
console.log("================================================================");

if (issues.length > 0) {
  console.log("\nCRITICAL DEPLOYMENT BLOCKERS:");
  issues.forEach((i, idx) => console.log(`  ${idx + 1}. ${i}`));
} else {
  console.log("\nREADY FOR PERMANENT PRODUCTION DEPLOYMENT!");
}
