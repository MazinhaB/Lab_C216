import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import App from "../../src/App";

describe("App", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});
	async function createCharacter(user, name = "Chloe") {
		await user.type(screen.getByLabelText("Nome"), name);
		await user.type(screen.getByLabelText("Classe"), "Bruxo");
		await user.type(screen.getByLabelText("Raça"), "Humano");
		await user.type(screen.getByLabelText("Nível"), "17");

		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);
	}

	it("cadastra um personagem e o exibe na lista", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.type(screen.getByLabelText("Nome"), "Chloe");
		await user.type(screen.getByLabelText("Classe"), "Bruxo");
		await user.type(screen.getByLabelText("Raça"), "Humano");
		await user.type(screen.getByLabelText("Nível"), "17");
		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);

		expect(screen.getByText("Chloe")).toBeInTheDocument();
		expect(screen.getByText("Bruxo")).toBeInTheDocument();
		expect(screen.getByText("Humano")).toBeInTheDocument();
		expect(screen.getByText("17")).toBeInTheDocument();
		expect(
			screen.queryByText("Nenhum personagem cadastrado."),
		).not.toBeInTheDocument();
	});
	it("impede o cadastro quando existem campos obrigatórios vazios", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);

		expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
		expect(screen.getByText("A classe é obrigatória.")).toBeInTheDocument();
		expect(screen.getByText("A raça é obrigatória.")).toBeInTheDocument();

		expect(screen.getByText("Sua aventura começa aqui")).toBeInTheDocument();
	});

	it("impede o cadastro quando o nível é inválido", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.type(screen.getByLabelText("Nome"), "Chloe");
		await user.type(screen.getByLabelText("Classe"), "Bruxo");
		await user.type(screen.getByLabelText("Raça"), "Humano");
		await user.type(screen.getByLabelText("Nível"), "21");

		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);

		expect(
			screen.getByText("O nível deve ser um número inteiro entre 1 e 20."),
		).toBeInTheDocument();

		expect(screen.getByText("Sua aventura começa aqui")).toBeInTheDocument();
	});

	it("limpa o formulário depois de um cadastro bem-sucedido", async () => {
		const user = userEvent.setup();
		render(<App />);

		await user.type(screen.getByLabelText("Nome"), "Chloe");
		await user.type(screen.getByLabelText("Classe"), "Bruxo");
		await user.type(screen.getByLabelText("Raça"), "Humano");
		await user.type(screen.getByLabelText("Nível"), "17");

		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);

		expect(screen.getByLabelText("Nome")).toHaveValue("");
		expect(screen.getByLabelText("Classe")).toHaveValue("");
		expect(screen.getByLabelText("Raça")).toHaveValue("");
		expect(screen.getByLabelText("Nível")).toHaveValue(null);
	});
	it("abre os detalhes ao clicar em um personagem", async () => {
		const user = userEvent.setup();
		render(<App />);

		await createCharacter(user);

		await user.click(
			screen.getByRole("button", {
				name: "Ver opções do personagem Chloe",
			}),
		);

		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(
			screen.getByRole("heading", { name: "Chloe", level: 2 }),
		).toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: "Editar personagem" }),
		).toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: "Excluir personagem" }),
		).toBeInTheDocument();
	});

	it("edita um personagem e atualiza seus dados na lista", async () => {
		const user = userEvent.setup();
		render(<App />);

		await createCharacter(user);

		await user.click(
			screen.getByRole("button", {
				name: "Ver opções do personagem Chloe",
			}),
		);

		await user.click(screen.getByRole("button", { name: "Editar personagem" }));

		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		expect(screen.getByLabelText("Nome")).toHaveValue("Chloe");

		await user.clear(screen.getByLabelText("Nome"));
		await user.type(screen.getByLabelText("Nome"), "Chloe Sombria");

		await user.click(screen.getByRole("button", { name: "Salvar alterações" }));

		expect(screen.getByText("Chloe Sombria")).toBeInTheDocument();
		expect(screen.queryByText("Chloe")).not.toBeInTheDocument();
	});

	it("exclui um personagem após a confirmação", async () => {
		const user = userEvent.setup();
		vi.spyOn(window, "confirm").mockReturnValue(true);

		render(<App />);

		await createCharacter(user);

		await user.click(
			screen.getByRole("button", {
				name: "Ver opções do personagem Chloe",
			}),
		);

		await user.click(
			screen.getByRole("button", { name: "Excluir personagem" }),
		);

		expect(window.confirm).toHaveBeenCalledWith(
			"Tem certeza de que deseja excluir Chloe?",
		);

		expect(screen.queryByText("Chloe")).not.toBeInTheDocument();
		expect(screen.getByText("Sua aventura começa aqui")).toBeInTheDocument();
	});

	it("mantém o personagem quando a exclusão é cancelada", async () => {
		const user = userEvent.setup();
		vi.spyOn(window, "confirm").mockReturnValue(false);

		render(<App />);

		await createCharacter(user);

		await user.click(
			screen.getByRole("button", {
				name: "Ver opções do personagem Chloe",
			}),
		);

		await user.click(
			screen.getByRole("button", { name: "Excluir personagem" }),
		);

		expect(window.confirm).toHaveBeenCalledTimes(1);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		expect(screen.getByRole("dialog").querySelector("h2")).toHaveTextContent(
			"Chloe",
		);
	});
});
