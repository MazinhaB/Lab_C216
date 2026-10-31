import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "../../src/App";

describe("App", () => {
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
});
