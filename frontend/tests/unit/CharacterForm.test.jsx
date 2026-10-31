import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CharacterForm } from "../../src/components/CharacterForm";

describe("CharacterForm", () => {
	it("renderiza os campos e o botão", () => {
		render(<CharacterForm onAdd={() => {}} />);

		expect(screen.getByLabelText("Nome")).toBeInTheDocument();
		expect(screen.getByLabelText("Classe")).toBeInTheDocument();
		expect(screen.getByLabelText("Raça")).toBeInTheDocument();
		expect(screen.getByLabelText("Nível")).toBeInTheDocument();

		expect(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		).toBeInTheDocument();
	});

	it("chama onAdd com os valores e limpa o formulário", async () => {
		const user = userEvent.setup();
		const onAdd = vi.fn();

		render(<CharacterForm onAdd={onAdd} />);

		await user.type(screen.getByLabelText("Nome"), "Chloe");
		await user.type(screen.getByLabelText("Classe"), "Bruxo");
		await user.type(screen.getByLabelText("Raça"), "Meio-elfo");
		await user.type(screen.getByLabelText("Nível"), "5");

		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);

		expect(onAdd).toHaveBeenCalledTimes(1);
		expect(onAdd).toHaveBeenCalledWith({
			name: "Chloe",
			class_name: "Bruxo",
			race: "Meio-elfo",
			level: 5,
		});

		expect(screen.getByLabelText("Nome")).toHaveValue("");
		expect(screen.getByLabelText("Classe")).toHaveValue("");
		expect(screen.getByLabelText("Raça")).toHaveValue("");
		expect(screen.getByLabelText("Nível")).toHaveValue(null);
	});

	it("não chama onAdd quando o formulário é inválido", async () => {
		const user = userEvent.setup();
		const onAdd = vi.fn();

		render(<CharacterForm onAdd={onAdd} />);

		await user.click(
			screen.getByRole("button", { name: "Adicionar personagem" }),
		);

		expect(onAdd).not.toHaveBeenCalled();
		expect(screen.getByText("O nome é obrigatório.")).toBeInTheDocument();
	});
});
