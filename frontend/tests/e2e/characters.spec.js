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
test("abre os detalhes de um personagem", async ({ page }) => {
	await page.goto("/");

	await page.getByLabel("Nome").fill("Beekama");
	await page.getByLabel("Classe").fill("Bardo");
	await page.getByLabel("Raça").fill("Tiefling");
	await page.getByLabel("Nível").fill("2");

	await page.getByRole("button", { name: "Adicionar personagem" }).click();

	await page
		.getByRole("button", { name: "Ver opções do personagem Beekama" })
		.click();

	await expect(page.getByRole("dialog")).toBeVisible();
	await expect(
		page.getByRole("dialog").getByRole("heading", { name: "Beekama" }),
	).toBeVisible();

	await expect(
		page.getByRole("button", { name: "Editar personagem" }),
	).toBeVisible();

	await expect(
		page.getByRole("button", { name: "Excluir personagem" }),
	).toBeVisible();
});

test("edita um personagem e atualiza a listagem", async ({ page }) => {
	await page.goto("/");

	await page.getByLabel("Nome").fill("Beekama");
	await page.getByLabel("Classe").fill("Bardo");
	await page.getByLabel("Raça").fill("Tiefling");
	await page.getByLabel("Nível").fill("2");

	await page.getByRole("button", { name: "Adicionar personagem" }).click();

	await page
		.getByRole("button", { name: "Ver opções do personagem Beekama" })
		.click();

	await page.getByRole("button", { name: "Editar personagem" }).click();

	await page.getByLabel("Nome").fill("Beekama Sombria");
	await page.getByLabel("Nível").fill("8");

	await page.getByRole("button", { name: "Salvar alterações" }).click();

	await expect(page.getByRole("listitem")).toContainText("Beekama Sombria");
	await expect(page.getByRole("listitem")).toContainText("8");
	await expect(page.getByRole("dialog")).toBeHidden();
});

test("exclui um personagem após a confirmação", async ({ page }) => {
	await page.goto("/");

	await page.getByLabel("Nome").fill("Beekama");
	await page.getByLabel("Classe").fill("Bardo");
	await page.getByLabel("Raça").fill("Tiefling");
	await page.getByLabel("Nível").fill("2");

	await page.getByRole("button", { name: "Adicionar personagem" }).click();

	await page
		.getByRole("button", { name: "Ver opções do personagem Beekama" })
		.click();

	page.on("dialog", async (dialog) => {
		expect(dialog.message()).toBe("Tem certeza de que deseja excluir Beekama?");
		await dialog.accept();
	});

	await page.getByRole("button", { name: "Excluir personagem" }).click();

	await expect(page.getByText("Sua aventura começa aqui")).toBeVisible();
	await expect(
		page.getByRole("button", { name: "Ver opções do personagem Beekama" }),
	).toHaveCount(0);
});
