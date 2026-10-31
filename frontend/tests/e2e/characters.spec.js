import { expect, test } from "@playwright/test";

test("carrega a interface do gerenciador de personagens", async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { name: "Seu grupo de aventureiros" }),
	).toBeVisible();

	await expect(page.getByLabel("Nome")).toBeVisible();
	await expect(page.getByLabel("Classe")).toBeVisible();
	await expect(page.getByLabel("Raça")).toBeVisible();
	await expect(page.getByLabel("Nível")).toBeVisible();
});

test("cadastra um personagem e o exibe na listagem", async ({ page }) => {
	await page.goto("/");

	await page.getByLabel("Nome").fill("Beekama");
	await page.getByLabel("Classe").fill("Bardo");
	await page.getByLabel("Raça").fill("Tiefling");
	await page.getByLabel("Nível").fill("2");

	await page
		.getByRole("button", {
			name: "Adicionar personagem",
		})
		.click();

	await expect(page.getByRole("listitem")).toContainText("Beekama");
	await expect(page.getByRole("listitem")).toContainText("Bardo");
	await expect(page.getByRole("listitem")).toContainText("Tiefling");
	await expect(page.getByRole("listitem")).toContainText("2");

	await expect(page.getByText("Nenhum personagem cadastrado.")).toBeHidden();
});

test("impede o cadastro de um personagem com nome vazio", async ({ page }) => {
	await page.goto("/");

	await page.getByLabel("Classe").fill("Bruxo");
	await page.getByLabel("Raça").fill("Humano");
	await page.getByLabel("Nível").fill("17");

	await page
		.getByRole("button", {
			name: "Adicionar personagem",
		})
		.click();

	await expect(page.getByText("O nome é obrigatório.")).toBeVisible();
	await expect(page.getByText("Sua aventura começa aqui")).toBeVisible();
});
