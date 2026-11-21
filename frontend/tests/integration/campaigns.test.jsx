import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import App from "../../src/App";
import { createCampaign, getCampaigns } from "../../src/services/campaigns";

vi.mock("../../src/services/campaigns", () => ({
	getCampaigns: vi.fn(),
	createCampaign: vi.fn(),
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

describe("Integração das campanhas", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getCampaigns.mockResolvedValue(campaigns);
	});

	it("carrega e exibe as campanhas da API", async () => {
		render(<App />);

		expect(
			await screen.findByRole("button", {
				name: /Mansion of Madness/i,
			}),
		).toBeInTheDocument();

		expect(
			screen.getByRole("button", {
				name: /O Mistério do El Dorado/i,
			}),
		).toBeInTheDocument();

		expect(getCampaigns).toHaveBeenCalledOnce();
	});

	it("permite criar uma campanha", async () => {
		const user = userEvent.setup();

		createCampaign.mockResolvedValue({
			id: 86,
			name: "Hotel Califórnia",
			description: "Um mistério em um hotel.",
		});

		render(<App />);

		await screen.findByRole("button", {
			name: /O Mistério do El Dorado/i,
		});

		await user.click(screen.getByRole("button", { name: /Nova Campanha/i }));

		await user.type(screen.getByLabelText("Nome"), "Hotel Califórnia");

		await user.type(
			screen.getByLabelText("Descrição"),
			"Um mistério em um hotel.",
		);

		await user.click(screen.getByRole("button", { name: /Criar campanha/i }));

		expect(createCampaign).toHaveBeenCalledWith({
			name: "Hotel Califórnia",
			description: "Um mistério em um hotel.",
		});

		expect(
			await screen.findByRole("button", {
				name: /Hotel Califórnia/i,
			}),
		).toBeInTheDocument();
	});

	it("abre os detalhes e permite voltar às campanhas", async () => {
		const user = userEvent.setup();

		render(<App />);

		await user.click(
			await screen.findByRole("button", {
				name: /O Mistério do El Dorado/i,
			}),
		);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "O Mistério do El Dorado",
			}),
		).toBeInTheDocument();

		await user.click(
			screen.getByRole("button", {
				name: /Voltar às campanhas/i,
			}),
		);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: "Campanhas",
			}),
		).toBeInTheDocument();
	});

	it("exibe uma mensagem quando a API falha", async () => {
		getCampaigns.mockRejectedValueOnce(
			new Error("Não foi possível carregar as campanhas."),
		);

		render(<App />);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Não foi possível carregar as campanhas.",
		);
	});
});
