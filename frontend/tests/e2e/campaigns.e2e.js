import { expect, test } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://127.0.0.1:8000";

test("realiza o CRUD de campanha com persistência real", async ({
	page,
	request,
}) => {
	const name = `Campanha E2E ${Date.now()}`;
	const description = "Campanha criada pelo Playwright.";
	const updatedDescription = "Descrição atualizada pelo Playwright.";

	let createdId = null;

	try {
		// 1. Abrir a aplicação
		await page.goto("/");

		await expect(
			page.getByRole("heading", { name: "Campanhas" }),
		).toBeVisible();

		// 2. Criar uma campanha
		await page.getByRole("button", { name: /Nova Campanha/i }).click();

		await page.getByLabel("Nome", { exact: true }).fill(name);
		await page.getByLabel("Descrição", { exact: true }).fill(description);

		const creationResponsePromise = page.waitForResponse(
			(response) =>
				response.url().endsWith("/campaigns/") &&
				response.request().method() === "POST",
		);

		await page.getByRole("button", { name: "Criar campanha" }).click();

		const creationResponse = await creationResponsePromise;

		expect(creationResponse.ok()).toBe(true);
		createdId = (await creationResponse.json()).id;

		const card = page.locator(".campaign-card").filter({
			has: page.getByRole("heading", { name, exact: true }),
		});

		await expect(card).toBeVisible();

		// 3. Recarregar a página para verificar a persistência
		await page.reload();

		await expect(card).toBeVisible();
		await expect(card).toContainText(description);

		// 4. Editar a campanha
		await card.locator(".campaign-card-trigger").click();
		await card.getByRole("button", { name: "Editar campanha" }).click();

		await page
			.getByLabel("Descrição", { exact: true })
			.fill(updatedDescription);
		await page.getByRole("button", { name: "Salvar alterações" }).click();

		await expect(card).toContainText(updatedDescription);

		// 5. Confirmar pela API que a edição foi salva
		const response = await request.get(`${API_URL}/campaigns/${createdId}`);

		expect(response.status()).toBe(200);
		expect((await response.json()).description).toBe(updatedDescription);

		// 6. Excluir a campanha
		await card.locator(".campaign-card-trigger").click();

		page.once("dialog", (dialog) => dialog.accept());

		await card.getByRole("button", { name: "Excluir campanha" }).click();

		await expect(card).toHaveCount(0);

		// 7. Confirmar que a API não encontra mais a campanha
		const deletedResponse = await request.get(
			`${API_URL}/campaigns/${createdId}`,
		);

		expect(deletedResponse.status()).toBe(404);

		createdId = null;
	} finally {
		if (createdId !== null) {
			await request.delete(`${API_URL}/campaigns/${createdId}`);
		}
	}
});
