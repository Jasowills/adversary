#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const projectPath = process.argv[2] ?? ".";

function detect(projectPath) {
  const info = { apiRoutes: [] };
  if (existsSync(join(projectPath, "pnpm-lock.yaml"))) info.packageManager = "pnpm";
  else if (existsSync(join(projectPath, "package-lock.json"))) info.packageManager = "npm";
  const pkgPath = join(projectPath, "package.json");
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (deps.next) info.framework = "nextjs";
      else if (deps.express) info.framework = "express";
      else info.framework = "node";
      info.language = "javascript/typescript";
    } catch {}
  }
  info.hasDocker = existsSync(join(projectPath, "Dockerfile"));
  info.hasCompose = existsSync(join(projectPath, "docker-compose.yml")) || existsSync(join(projectPath, "compose.yaml"));
  console.log(JSON.stringify(info, null, 2));
}
detect(projectPath);
