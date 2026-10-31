import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CharacterList } from "../../src/components/CharacterList";

describe("CharacterList", () => {
	it("exibe mensagem quando a lista está vazia", () => {
		render(<CharacterList characters={[]} />);

		expect(screen.getByText("Sua aventura começa aqui")).toBeInTheDocument();

		expect(
			screen.getByText(
				"Você ainda não cadastrou nenhum personagem. Crie seu primeiro aventureiro para começar!",
			),
		).toBeInTheDocument();
	});

	it("exibe os dados dos personagens cadastrados", () => {
		const characters = [
			{
				id: "1",
				name: "Chloe",
				class_name: "Bruxo",
				race: "Meio-elfo",
				level: 5,
			},
			{
				id: "2",
				name: "Arthur",
				class_name: "Guerreiro",
				race: "Humano",
				level: 10,
			},
		];

		render(<CharacterList characters={characters} />);

		expect(screen.getAllByRole("listitem")).toHaveLength(2);

		expect(screen.getByText("Chloe")).toBeInTheDocument();
		expect(screen.getByText("Bruxo")).toBeInTheDocument();
		expect(screen.getByText("Meio-elfo")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();

		expect(screen.getByText("Arthur")).toBeInTheDocument();
		expect(screen.getByText("Guerreiro")).toBeInTheDocument();
		expect(screen.getByText("Humano")).toBeInTheDocument();
		expect(screen.getByText("10")).toBeInTheDocument();
	});
	it("chama onSelect ao clicar em um personagem", () => {
		const character = {
			id: "1",
			name: "Chloe",
			class_name: "Bruxo",
			race: "Meio-elfo",
			level: 5,
		};

		const onSelect = vi.fn();

		render(<CharacterList characters={[character]} onSelect={onSelect} />);

		fireEvent.click(
			screen.getByRole("button", {
				name: "Ver opções do personagem Chloe",
			}),
		);

		expect(onSelect).toHaveBeenCalledTimes(1);
		expect(onSelect).toHaveBeenCalledWith(character);
	});
});
