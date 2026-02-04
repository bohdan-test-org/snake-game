import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const infoPath = resolve("deploy-info.json");

const commit = execSync("git rev-parse --short HEAD").toString().trim();
const timestamp = new Date().toISOString();
const message = execSync("git log -1 --pretty=%s").toString().trim();

const payload = { commit, timestamp, message };
writeFileSync(infoPath, JSON.stringify(payload, null, 2) + "\n");
console.log("Wrote", infoPath, payload);
