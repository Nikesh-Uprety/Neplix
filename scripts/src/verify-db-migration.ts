import { spawn } from "node:child_process";

type Target = {
  name: string;
  url: string;
};

function readTarget(name: string, envKey: string): Target | null {
  const url = process.env[envKey]?.trim();
  if (!url) return null;
  return { name, url };
}

function run(command: string, args: string[], env: NodeJS.ProcessEnv): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env,
      shell: process.platform === "win32",
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code ?? "unknown"}`));
    });
  });
}

async function verifyTarget(target: Target) {
  console.log(`\n[verify-db-migration] Verifying target: ${target.name}`);
  await run(
    "pnpm",
    [
      "--filter",
      "@workspace/db",
      "exec",
      "drizzle-kit",
      "push",
      "--config",
      "./drizzle.config.ts",
    ],
    {
      ...process.env,
      DATABASE_URL: target.url,
      NEON_DATABASE_URL: target.url,
    },
  );
  console.log(`[verify-db-migration] OK: ${target.name}`);
}

async function main() {
  const targets: Target[] = [];
  const fresh = readTarget("fresh-db", "MIGRATION_VERIFY_FRESH_DATABASE_URL");
  const existing = readTarget("existing-db", "MIGRATION_VERIFY_EXISTING_DATABASE_URL");

  if (fresh) targets.push(fresh);
  if (existing) targets.push(existing);

  if (targets.length === 0) {
    console.error(
      [
        "[verify-db-migration] Missing database URLs.",
        "Set one or both:",
        "- MIGRATION_VERIFY_FRESH_DATABASE_URL",
        "- MIGRATION_VERIFY_EXISTING_DATABASE_URL",
      ].join("\n"),
    );
    process.exitCode = 1;
    return;
  }

  for (const target of targets) {
    await verifyTarget(target);
  }

  console.log("\n[verify-db-migration] All configured targets verified.");
}

main().catch((err) => {
  console.error("[verify-db-migration] Failed:", err);
  process.exitCode = 1;
});
