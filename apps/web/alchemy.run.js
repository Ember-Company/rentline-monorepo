import alchemy from "alchemy";
import { ReactRouter } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
const app = await alchemy("rentline");
export const web = await ReactRouter("web", {
	bindings: {
		VITE_SERVER_URL: process.env.VITE_SERVER_URL || "",
	},
	dev: {
		command: "bun run dev",
	},
});
console.log(`Web    -> ${web.url}`);
await app.finalize();
