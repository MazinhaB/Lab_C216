import { expect, test } from "@playwright/test";

const API_URL = process.env.E2E_API_URL || "http://127.0.0.1:8000";

test("realiza o CRUD de investigador com persistência real", async ({
	page,
	request,
}) => {
	const campaignName = `Campanha E2E Investigadores ${Date.now()}`;
	const investigatorName = `Investigador E2E ${Date.now()}`;

	// Criar uma campanha para o teste
	const campaignResponse = await request.post(`${API_URL}/campaigns/`, {
		data: {
			name: campaignName,
			description: "Campanha temporária do teste E2E.",
		},
	});

	expect(campaignResponse.status()).toBe(201);

	const campaignId = (await campaignResponse.json()).id;
	const investigatorsUrl = `${API_URL}/campaigns/${campaignId}/investigators`;

	try {
		// 1. Abrir a campanha
		await page.goto("/");

		const campaignCard = page.locator(".campaign-card").filter({
			has: page.getByRole("heading", {
				name: campaignName,
				exact: true,
			}),
		});

		await expect(campaignCard).toBeVisible();

		await campaignCard.locator(".campaign-card-trigger").click();

		await campaignCard.getByRole("button", { name: "Abrir detalhes" }).click();

		await expect(
			page.getByRole("heading", { name: campaignName }),
		).toBeVisible();

		// 2. Cadastrar um investigador
		await page.getByRole("button", { name: /Novo investigador/i }).click();

		const form = page.locator(".investigator-form");

		await form.getByRole("textbox", { name: /^Nome/i }).fill(investigatorName);

		await form.getByRole("button", { name: /Gerar atributos/i }).click();

		const creationPromise = page.waitForResponse(
			(response) =>
				response.url().endsWith(`/campaigns/${campaignId}/investigators`) &&
				response.request().method() === "POST",
		);

		await form.getByRole("button", { name: "Cadastrar investigador" }).click();

		const creationResponse = await creationPromise;

		expect(creationResponse.status()).toBe(201);

		const investigatorId = (await creationResponse.json()).id;
		const investigatorUrl = `${investigatorsUrl}/${investigatorId}`;

		// 3. Confirmar que o investigador foi salvo
		const investigatorCard = page.locator(".investigator-card").filter({
			has: page.getByRole("heading", {
				name: investigatorName,
				exact: true,
			}),
		});

		await expect(investigatorCard).toBeVisible();

		const savedResponse = await request.get(investigatorUrl);

		expect(savedResponse.status()).toBe(200);
		expect((await savedResponse.json()).name).toBe(investigatorName);

		// A ficha deve ser aberta automaticamente após o cadastro
		const sheet = page.getByRole("region", {
			name: `Ficha de ${investigatorName}`,
		});

		await expect(sheet).toBeVisible();

		// 4. Editar a Sanidade e ativar uma condição
		await sheet.getByRole("button", { name: /Editar ficha/i }).click();

		await sheet.getByRole("spinbutton", { name: "Sanidade atual" }).fill("10");

		await sheet.getByRole("checkbox", { name: "Ferimento grave" }).check();

		const updatePromise = page.waitForResponse(
			(response) =>
				response
					.url()
					.endsWith(
						`/campaigns/${campaignId}/investigators/${investigatorId}`,
					) && response.request().method() === "PATCH",
		);

		await sheet.getByRole("button", { name: "Salvar alterações" }).click();

		const updateResponse = await updatePromise;

		expect(updateResponse.status()).toBe(200);

		const updated = await updateResponse.json();

		expect(updated.current_sanity).toBe(10);
		expect(updated.major_wound).toBe(true);

		// A condição também deve aparecer no card
		await expect(investigatorCard).toContainText("Ferimento grave");
		await expect(investigatorCard).toContainText("10");

		// 5. Recarregar a página e verificar a persistência
		await page.reload();

		await expect(campaignCard).toBeVisible();

		await campaignCard.locator(".campaign-card-trigger").click();

		await campaignCard.getByRole("button", { name: "Abrir detalhes" }).click();

		await expect(investigatorCard).toBeVisible();
		await expect(investigatorCard).toContainText("Ferimento grave");
		await expect(investigatorCard).toContainText("10");

		const persistedResponse = await request.get(investigatorUrl);

		expect(persistedResponse.status()).toBe(200);

		const persisted = await persistedResponse.json();

		expect(persisted.current_sanity).toBe(10);
		expect(persisted.major_wound).toBe(true);

		// 6. Excluir o investigador
		await investigatorCard.locator(".investigator-card-trigger").click();

		page.once("dialog", (dialog) => dialog.accept());

		const deletionPromise = page.waitForResponse(
			(response) =>
				response
					.url()
					.endsWith(
						`/campaigns/${campaignId}/investigators/${investigatorId}`,
					) && response.request().method() === "DELETE",
		);

		await investigatorCard
			.getByRole("button", { name: "Excluir investigador" })
			.click();

		const deletionResponse = await deletionPromise;

		expect(deletionResponse.status()).toBe(204);
		await expect(investigatorCard).toHaveCount(0);

		// 7. Confirmar exclusão no backend
		const deletedResponse = await request.get(investigatorUrl);

		expect(deletedResponse.status()).toBe(404);
	} finally {
		await request.delete(`${API_URL}/campaigns/${campaignId}`);
	}
});
