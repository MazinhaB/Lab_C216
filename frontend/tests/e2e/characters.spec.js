import { expect, test } from "@playwright/test";

function uniqueName(prefix) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function registerCharacter(
	page,
	{ name, characterClass = "Mago", race = "Humano", level = 5 },
) {
	await page.getByLabel("Nome").fill(name);
	await page.getByLabel("Classe").fill(characterClass);
	await page.getByLabel("Raça").fill(race);
	await page.getByLabel("Nível").fill(String(level));

	await page.getByRole("button", { name: "Adicionar personagem" }).click();

	const character = page.getByRole("button", {
		name: `Ver opções do personagem ${name}`,
	});

	await expect(character).toBeVisible();

	return character;
}

test.beforeEach(async ({ page }) => {
	await page.goto("/");

	await expect(
		page.getByRole("heading", { name: "Seu grupo de aventureiros" }),
	).toBeVisible();

	await expect(page.getByRole("status")).toHaveCount(0);
	await expect(page.getByRole("alert")).toHaveCount(0);
});

test("carrega a interface do gerenciador de personagens", async ({ page }) => {
	await expect(page.getByLabel("Nome")).toBeVisible();
	await expect(page.getByLabel("Classe")).toBeVisible();
	await expect(page.getByLabel("Raça")).toBeVisible();
	await expect(page.getByLabel("Nível")).toBeVisible();

	await expect(
		page.getByRole("heading", { name: "Personagens cadastrados" }),
	).toBeVisible();
});

test("cadastra um personagem e o exibe na listagem", async ({ page }) => {
	const name = uniqueName("E2E-Cadastro");

	const character = await registerCharacter(page, {
		name,
		characterClass: "Bardo",
		race: "Tiefling",
		level: 2,
	});

	await expect(character).toContainText("Bardo");
	await expect(character).toContainText("Tiefling");
	await expect(character).toContainText("2");
});
test("impede o cadastro de um personagem com nome vazio", async ({ page }) => {
	await page.getByLabel("Classe").fill("Bruxo");
	await page.getByLabel("Raça").fill("Humano");
	await page.getByLabel("Nível").fill("17");

	const postRequests = [];

	page.on("request", (request) => {
		if (request.method() === "POST" && request.url().includes("/characters/")) {
			postRequests.push(request);
		}
	});

	await page.getByRole("button", { name: "Adicionar personagem" }).click();

	await expect(page.getByText("O nome é obrigatório.")).toBeVisible();

	expect(postRequests).toHaveLength(0);
});

test("abre os detalhes de um personagem", async ({ page }) => {
	const name = uniqueName("E2E-Detalhes");

	const character = await registerCharacter(page, { name });

	await character.click();

	const dialog = page.getByRole("dialog");

	await expect(dialog).toBeVisible();
	await expect(dialog.getByRole("heading", { name })).toBeVisible();

	await expect(
		dialog.getByRole("button", { name: "Editar personagem" }),
	).toBeVisible();

	await expect(
		dialog.getByRole("button", { name: "Excluir personagem" }),
	).toBeVisible();
});

test("edita um personagem e atualiza a listagem", async ({ page }) => {
	const name = uniqueName("E2E-Editar");
	const updatedName = `${name}-Atualizado`;

	const character = await registerCharacter(page, { name });

	await character.click();

	await page.getByRole("button", { name: "Editar personagem" }).click();

	await page.getByLabel("Nome").fill(updatedName);
	await page.getByLabel("Nível").fill("8");
	await page.getByRole("button", { name: "Salvar alterações" }).click();

	const updatedCharacter = page.getByRole("button", {
		name: `Ver opções do personagem ${updatedName}`,
	});

	await expect(page.getByText(updatedName, { exact: true })).toBeVisible();
	await expect(updatedCharacter).toContainText("8");
	await expect(page.getByText(name, { exact: true })).toHaveCount(0);
	await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("exclui um personagem após a confirmação", async ({ page }) => {
	const name = uniqueName("E2E-Excluir");
	const character = await registerCharacter(page, { name });

	await character.click();

	page.once("dialog", async (dialog) => {
		expect(dialog.message()).toBe(`Tem certeza de que deseja excluir ${name}?`);
		await dialog.accept();
	});

	await page.getByRole("button", { name: "Excluir personagem" }).click();

	await expect(character).toHaveCount(0);
	await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("cadastra e persiste personagem após recarregar a página", async ({
	page,
}) => {
	const name = uniqueName("E2E-Persistencia");
	const character = await registerCharacter(page, { name });

	await expect(character).toBeVisible();

	await page.reload();

	await expect(character).toBeVisible();
});

test("edita e persiste personagem após recarregar a página", async ({
	page,
}) => {
	const name = uniqueName("E2E-Edicao-Persistente");
	const character = await registerCharacter(page, { name });

	await character.click();

	await page.getByRole("button", { name: "Editar personagem" }).click();
	await page.getByLabel("Nível").fill("10");
	await page.getByRole("button", { name: "Salvar alterações" }).click();

	await expect(character).toContainText("10");

	await page.reload();

	await expect(character).toBeVisible();
	await expect(character).toContainText("10");
});

test("exclui personagem e mantém a exclusão após recarregar", async ({
	page,
}) => {
	const name = uniqueName("E2E-Exclusao-Persistente");

	const character = await registerCharacter(page, { name });

	await character.click();

	page.once("dialog", async (dialog) => {
		expect(dialog.message()).toBe(`Tem certeza de que deseja excluir ${name}?`);
		await dialog.accept();
	});

	await page.getByRole("button", { name: "Excluir personagem" }).click();

	await expect(character).toHaveCount(0);

	await page.reload();

	await expect(character).toHaveCount(0);
});
