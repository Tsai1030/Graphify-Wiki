import dotenv from "dotenv";
import path from "path";

let loaded = false;

export function ensureRootEnvLoaded() {
  if (loaded) return;
  dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
  loaded = true;
}
