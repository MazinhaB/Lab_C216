import { defineConfig, devices } from "@playwright/test";

const e2eBaseURL = process.env.E2E_BASE_URL;

export default defineConfig({
	testDir: "./tests/e2e",
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	globalSetup: "./tests/e2e/global-setup.js",
	use: {
		baseURL: e2eBaseURL ?? "http://127.0.0.1:5174",
		trace: "on-first-retry",
	},
	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],
});
