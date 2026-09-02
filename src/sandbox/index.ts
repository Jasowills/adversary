import { spawn, ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export type SandboxConfig = {
  projectPath: string;
  port: number;
  env?: Record<string, string>;
  useDocker?: boolean;
};

export type Sandbox = {
  baseUrl: string;
  port: number;
  mode: "docker" | "process" | "none";
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(path?: string): Promise<{ ok: boolean; status?: number; latencyMs: number; body?: string }>;
};

function hasComposeFile(projectPath: string) {
  return (
    existsSync(join(projectPath, "docker-compose.yml")) ||
    existsSync(join(projectPath, "compose.yaml")) ||
    existsSync(join(projectPath, "docker-compose.yaml"))
  );
}

export function createSandbox(config: SandboxConfig): Sandbox {
  const { projectPath, port, env } = config;
  const useDocker = config.useDocker ?? hasComposeFile(projectPath);
  let child: ChildProcess | null = null;

  const baseUrl = `http://127.0.0.1:${port}`;

  async function startDocker() {
    // docker compose up --build -d
    await execCmd("docker", ["compose", "up", "--build", "-d"], projectPath);
    // wait a bit for services
    await sleep(3000);
  }

  async function stopDocker() {
    try {
      await execCmd("docker", ["compose", "down", "-v"], projectPath);
    } catch {}
  }

  async function startProcess() {
    // try common start commands — prefer direct node over npm start for clean termination in CI
    const pkgPath = join(projectPath, "package.json");
    let cmd = "node";
    let args: string[] = [];
    // Prefer explicit server.js if present (e.g., vulnerable-app)
    if (existsSync(join(projectPath, "server.js"))) {
      args = ["server.js"];
    } else if (existsSync(join(projectPath, "dist/index.js"))) {
      args = ["dist/index.js"];
    } else if (existsSync(join(projectPath, "src/index.js"))) {
      args = ["src/index.js"];
    } else if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        if (pkg.scripts?.start) {
          cmd = "npm";
          args = ["start"];
        } else {
          throw new Error("No start command found");
        }
      } catch (e) {
        // fallback
        if (args.length === 0) throw e;
      }
    } else {
      throw new Error("No start command found");
    }

    const mergedEnv = { ...process.env, PORT: String(port), NODE_ENV: "test", ...env } as Record<string, string>;

    child = spawn(cmd, args, {
      cwd: projectPath,
      env: mergedEnv,
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    });

    // wait for port to be listening (poll)
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline) {
      try {
        const res = await fetch(`${baseUrl}/health`).catch(() => fetch(`${baseUrl}/`));
        if (res && (res as any).status < 500) return;
      } catch {}
      await sleep(500);
    }
    // not fatal — return anyway, baseline will report
  }

  return {
    baseUrl,
    port,
    mode: useDocker ? "docker" : existsSync(join(projectPath, "package.json")) ? "process" : "none",
    async start() {
      if (useDocker && hasComposeFile(projectPath)) {
        await startDocker();
      } else if (existsSync(join(projectPath, "package.json")) || existsSync(join(projectPath, "server.js"))) {
        await startProcess();
      }
    },
    async stop() {
      if (useDocker && hasComposeFile(projectPath)) {
        await stopDocker();
      }
      if (child) {
        try {
          child.kill("SIGTERM");
          // give it a moment, then force kill
          await sleep(1000);
          if (!child.killed) {
            try { child.kill("SIGKILL"); } catch {}
          }
        } catch {}
        child = null;
      }
    },
    async healthCheck(path = "/") {
      const start = Date.now();
      try {
        const res = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(3000) });
        const body = await res.text().catch(() => "");
        return { ok: res.status < 500, status: res.status, latencyMs: Date.now() - start, body: body.slice(0, 2000) };
      } catch (e: any) {
        return { ok: false, latencyMs: Date.now() - start, body: e?.message ?? String(e) };
      }
    },
  };
}

function execCmd(cmd: string, args: string[], cwd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let out = "";
    let err = "";
    p.stdout?.on("data", (d) => (out += d));
    p.stderr?.on("data", (d) => (err += d));
    p.on("close", (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`${cmd} ${args.join(" ")} failed (${code}): ${err || out}`));
    });
    p.on("error", reject);
  });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
