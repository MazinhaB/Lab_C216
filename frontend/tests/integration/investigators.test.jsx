import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "../../src/App";
import { getCampaigns } from "../../src/services/campaigns";
import {
	deleteInvestigator,
	getInvestigators,
} from "../../src/services/investigators";

vi.mock("../../src/services/campaigns", () => ({
	getCampaigns: vi.fn(),
	createCampaign: vi.fn(),
	updateCampaign: vi.fn(),
	deleteCampaign: vi.fn(),
}));

vi.mock("../../src/services/investigators", () => ({
	getInvestigators: vi.fn(),
	createInvestigator: vi.fn(),
	deleteInvestigator: vi.fn(),
	patchInvestigator: vi.fn(),
}));

const campaigns = [
	{
		id: 1,
		name: "Mansion of Madness",
		description: "Um mistério em Arkham.",
	},
	{
		id: 85,
		name: "O Mistério do El Dorado",
		description: "Uma investigação na Amazônia.",
	},
];

const investigators = [
	{
		id: 5,
		campaign_id: 85,
		name: "Miguel",
		age: 26,
		current_sanity: 99,
		current_hit_points: 0,
	},
];

async function openCampaign(user, name) {
	await user.click(
		await screen.findByRole("button", {
			name: new RegExp(name, "i"),
		}),
	);

	await user.click(screen.getByRole("button", { name: "Abrir detalhes" }));
}

describe("Integração dos investigadores", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getCampaigns.mockResolvedValue(campaigns);
		getInvestigators.mockResolvedValue(investigators);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("carrega os investigadores da campanha selecionada", async () => {
		const user = userEvent.setup();
		render(<App />);

		await openCampaign(user, "O Mistério do El Dorado");

		const card = await screen.findByRole("article");

		expect(within(card).getByText("Miguel")).toBeInTheDocument();
		expect(within(card).getByText("26 anos")).toBeInTheDocument();
		expect(within(card).getByText("99")).toBeInTheDocument();
		expect(within(card).getByText("0")).toBeInTheDocument();

		expect(getInvestigators).toHaveBeenCalledWith(85);
	});

	it("exibe mensagem quando a campanha não possui investigadores", async () => {
		const user = userEvent.setup();
		getInvestigators.mockResolvedValue([]);

		render(<App />);
		await openCampaign(user, "Mansion of Madness");

		expect(
			await screen.findByRole("heading", {
				name: "Nenhum investigador cadastrado",
			}),
		).toBeInTheDocument();
	});

	it("exibe erro quando a consulta dos investigadores falha", async () => {
		const user = userEvent.setup();

		getInvestigators.mockRejectedValue(
			new Error("Não foi possível carregar os investigadores."),
		);

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Não foi possível carregar os investigadores.",
		);
	});

	it("não mistura investigadores de campanhas diferentes", async () => {
		const user = userEvent.setup();

		getInvestigators.mockImplementation(async (campaignId) =>
			campaignId === 85 ? investigators : [],
		);

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		expect(await screen.findByText("Miguel")).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: /Voltar às campanhas/i }),
		);

		await openCampaign(user, "Mansion of Madness");

		expect(
			await screen.findByText("Nenhum investigador cadastrado"),
		).toBeInTheDocument();

		expect(screen.queryByText("Miguel")).not.toBeInTheDocument();
		expect(getInvestigators).toHaveBeenCalledWith(1);
	});

	it("expande e fecha a ficha do investigador", async () => {
		const user = userEvent.setup();

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		await user.click(await screen.findByRole("button", { name: /Miguel/i }));

		await user.click(screen.getByRole("button", { name: "Expandir ficha" }));

		expect(
			screen.getByRole("region", { name: "Ficha de Miguel" }),
		).toBeInTheDocument();

		expect(
			screen.getByRole("heading", { name: "Características" }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Fechar ficha" }));

		expect(
			screen.queryByRole("region", { name: "Ficha de Miguel" }),
		).not.toBeInTheDocument();
	});

	it("permite navegar entre as abas da ficha", async () => {
		const user = userEvent.setup();

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		await user.click(await screen.findByRole("button", { name: /Miguel/i }));

		await user.click(screen.getByRole("button", { name: "Expandir ficha" }));

		await user.click(
			screen.getByRole("button", {
				name: "História e Personalidade",
			}),
		);

		expect(
			screen.getByRole("heading", { name: "Ideologia e crenças" }),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Inventário" }));

		expect(
			screen.getByRole("heading", {
				name: "Equipamentos e pertences",
			}),
		).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", { name: "Atributos Principais" }),
		);

		expect(
			screen.getByRole("heading", { name: "Características" }),
		).toBeInTheDocument();
	});

	it("não exclui o investigador quando a confirmação é cancelada", async () => {
		const user = userEvent.setup();
		const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		await user.click(await screen.findByRole("button", { name: /Miguel/i }));

		await user.click(
			screen.getByRole("button", { name: "Excluir investigador" }),
		);

		expect(confirmMock).toHaveBeenCalledOnce();
		expect(deleteInvestigator).not.toHaveBeenCalled();
		expect(screen.getByText("Miguel")).toBeInTheDocument();
	});

	it("exclui o investigador após a confirmação", async () => {
		const user = userEvent.setup();

		vi.spyOn(window, "confirm").mockReturnValue(true);
		deleteInvestigator.mockResolvedValue(undefined);

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		await user.click(await screen.findByRole("button", { name: /Miguel/i }));

		await user.click(
			screen.getByRole("button", { name: "Excluir investigador" }),
		);

		await waitFor(() => {
			expect(deleteInvestigator).toHaveBeenCalledWith(85, 5);
		});

		expect(
			await screen.findByText("Nenhum investigador cadastrado"),
		).toBeInTheDocument();

		expect(screen.queryByText("Miguel")).not.toBeInTheDocument();
	});

	it("mantém o investigador quando a exclusão falha", async () => {
		const user = userEvent.setup();

		vi.spyOn(window, "confirm").mockReturnValue(true);

		deleteInvestigator.mockRejectedValue(
			new Error("Não foi possível excluir o investigador."),
		);

		render(<App />);
		await openCampaign(user, "O Mistério do El Dorado");

		await user.click(await screen.findByRole("button", { name: /Miguel/i }));

		await user.click(
			screen.getByRole("button", { name: "Excluir investigador" }),
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Não foi possível excluir o investigador.",
		);

		expect(screen.getByText("Miguel")).toBeInTheDocument();
	});
});
