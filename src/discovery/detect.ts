import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export type StackInfo = {
  framework?: string;
  language?: string;
  packageManager?: string;
  hasDocker?: boolean;
  hasCompose?: boolean;
  hasPlaywright?: boolean;
  hasVitest?: boolean;
  hasJest?: boolean;
  hasPytest?: boolean;
  database?: string;
  frontend?: boolean;
  apiRoutes: string[];
};

export function detectStack(projectPath: string): StackInfo {
  const info: StackInfo = { apiRoutes: [] };

  // package manager
  if (existsSync(join(projectPath, "pnpm-lock.yaml"))) info.packageManager = "pnpm";
  else if (existsSync(join(projectPath, "yarn.lock"))) info.packageManager = "yarn";
  else if (existsSync(join(projectPath, "package-lock.json"))) info.packageManager = "npm";
  else if (existsSync(join(projectPath, "bun.lockb"))) info.packageManager = "bun";

  // node / framework
  const pkgPath = join(projectPath, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) info.framework = "nextjs";
      else if (deps.express) info.framework = "express";
      else if (deps.fastify) info.framework = "fastify";
      else if (deps.koa) info.framework = "koa";
      else if (deps["@nestjs/core"]) info.framework = "nestjs";
      else if (deps.react || deps.vue || deps.svelte) info.framework = "frontend";
      else info.framework = "node";
      if (deps.playwright || deps["@playwright/test"]) info.hasPlaywright = true;
      if (deps.vitest) info.hasVitest = true;
      if (deps.jest) info.hasJest = true;
      info.language = "javascript/typescript";
    } catch {}
  }

  // python
  if (existsSync(join(projectPath, "pyproject.toml")) || existsSync(join(projectPath, "requirements.txt"))) {
    info.language = info.language ? `${info.language} + python` : "python";
    if (!info.framework) info.framework = "python";
  }
  if (existsSync(join(projectPath, "pytest.ini")) || existsSync(join(projectPath, "pyproject.toml"))) {
    // heuristic
    try {
      const py = existsSync(join(projectPath, "pyproject.toml")) ? readFileSync(join(projectPath, "pyproject.toml"), "utf8") : "";
      if (py.includes("pytest")) info.hasPytest = true;
    } catch {}
  }

  // docker
  info.hasDocker = existsSync(join(projectPath, "Dockerfile"));
  info.hasCompose = existsSync(join(projectPath, "docker-compose.yml")) || existsSync(join(projectPath, "compose.yaml")) || existsSync(join(projectPath, "docker-compose.yaml"));

  // frontend heuristic
  const frontendMarkers = ["pages", "app", "src/pages", "src/app", "public"];
  info.frontend = frontendMarkers.some((p) => existsSync(join(projectPath, p)));

  // prisma / db
  if (existsSync(join(projectPath, "prisma/schema.prisma"))) info.database = "prisma/postgres";
  else if (existsSync(join(projectPath, "drizzle.config.ts")) || existsSync(join(projectPath, "drizzle.config.js"))) info.database = "drizzle";

  // api routes heuristic
  const candidates = ["src/routes", "src/api", "pages/api", "app/api", "server/routes", "routes"];
  for (const c of candidates) {
    const full = join(projectPath, c);
    if (existsSync(full)) {
      try {
        const files = readdirSync(full, { recursive: true } as any) as string[];
        info.apiRoutes.push(...files.slice(0, 20).map((f) => join(c, f)));
      } catch {}
    }
  }

  return info;
}
