import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";
import {
	createCampaign,
	deleteCampaign,
	getCampaigns,
	updateCampaign,
} from "../../src/services/campaigns";
import { getInvestigators } from "../../src/services/investigators";

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

describe("Integração das campanhas", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getCampaigns.mockResolvedValue(campaigns);
		getInvestigators.mockResolvedValue([]);
	});

	afterEach(() => {
		vi.restoreAllMocks();
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
		await user.click(screen.getByRole("button", { name: "Abrir detalhes" }));
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

	it("permite editar uma campanha", async () => {
		const user = userEvent.setup();

		updateCampaign.mockResolvedValue({
			id: 85,
			name: "El Dorado - Atualizado",
			description: "Nova descrição da campanha.",
		});

		render(<App />);

		await user.click(
			await screen.findByRole("button", {
				name: /O Mistério do El Dorado/i,
			}),
		);

		await user.click(screen.getByRole("button", { name: "Editar campanha" }));

		const nameInput = screen.getByLabelText("Nome");
		const descriptionInput = screen.getByLabelText("Descrição");

		expect(nameInput).toHaveValue("O Mistério do El Dorado");
		expect(descriptionInput).toHaveValue("Uma investigação na Amazônia.");

		await user.clear(nameInput);
		await user.type(nameInput, "El Dorado - Atualizado");

		await user.clear(descriptionInput);
		await user.type(descriptionInput, "Nova descrição da campanha.");

		await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

		await waitFor(() => {
			expect(updateCampaign).toHaveBeenCalledWith(85, {
				name: "El Dorado - Atualizado",
				description: "Nova descrição da campanha.",
			});
		});

		expect(
			await screen.findByRole("button", {
				name: /El Dorado - Atualizado/i,
			}),
		).toBeInTheDocument();
	});

	it("mantém o formulário quando a edição falha", async () => {
		const user = userEvent.setup();

		updateCampaign.mockRejectedValue(
			new Error("Não foi possível atualizar a campanha."),
		);

		render(<App />);

		await user.click(
			await screen.findByRole("button", {
				name: /O Mistério do El Dorado/i,
			}),
		);

		await user.click(screen.getByRole("button", { name: "Editar campanha" }));

		const nameInput = screen.getByLabelText("Nome");

		await user.clear(nameInput);
		await user.type(nameInput, "El Dorado - Atualizado");

		await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Não foi possível atualizar a campanha.",
		);

		expect(nameInput).toHaveValue("El Dorado - Atualizado");
	});

	it("cancela a exclusão quando o usuário não confirma", async () => {
		const user = userEvent.setup();

		const confirmMock = vi.spyOn(window, "confirm").mockReturnValue(false);

		render(<App />);

		await user.click(
			await screen.findByRole("button", {
				name: /Mansion of Madness/i,
			}),
		);

		await user.click(screen.getByRole("button", { name: "Excluir campanha" }));

		expect(confirmMock).toHaveBeenCalledOnce();
		expect(deleteCampaign).not.toHaveBeenCalled();

		expect(
			screen.getByRole("button", {
				name: /Mansion of Madness/i,
			}),
		).toBeInTheDocument();
	});

	it("exclui uma campanha após a confirmação", async () => {
		const user = userEvent.setup();

		vi.spyOn(window, "confirm").mockReturnValue(true);
		deleteCampaign.mockResolvedValue(undefined);

		render(<App />);

		await user.click(
			await screen.findByRole("button", {
				name: /Mansion of Madness/i,
			}),
		);

		await user.click(screen.getByRole("button", { name: "Excluir campanha" }));

		await waitFor(() => {
			expect(deleteCampaign).toHaveBeenCalledWith(1);
		});

		await waitFor(() => {
			expect(
				screen.queryByRole("button", {
					name: /Mansion of Madness/i,
				}),
			).not.toBeInTheDocument();
		});

		expect(
			screen.getByRole("button", {
				name: /O Mistério do El Dorado/i,
			}),
		).toBeInTheDocument();
	});

	it("mantém a campanha quando a exclusão falha", async () => {
		const user = userEvent.setup();

		vi.spyOn(window, "confirm").mockReturnValue(true);

		deleteCampaign.mockRejectedValue(
			new Error("Não foi possível excluir a campanha."),
		);

		render(<App />);

		await user.click(
			await screen.findByRole("button", {
				name: /Mansion of Madness/i,
			}),
		);

		await user.click(screen.getByRole("button", { name: "Excluir campanha" }));

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Não foi possível excluir a campanha.",
		);

		expect(
			screen.getByRole("button", {
				name: /Mansion of Madness/i,
			}),
		).toBeInTheDocument();
	});
});
