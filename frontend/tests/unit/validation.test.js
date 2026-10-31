import { describe, expect, it } from "vitest";
import { validateCharacter } from "../../src/validation";

describe("validateCharacter", () => {
	const validCharacter = {
		name: "Chloe",
		class_name: "Bruxo",
		race: "Meio-elfo",
		level: "5",
	};

	describe("validação do nome", () => {
		it("rejeita nome vazio ou só com espaços", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				name: "   ",
			});
			expect(errors.name).toBe("O nome é obrigatório.");
		});

		it("rejeita nome com mais de 100 caracteres", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				name: "A".repeat(101),
			});
			expect(errors.name).toBeDefined();
		});

		it("aceita nome com exatamente 100 caracteres", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				name: "A".repeat(100),
			});

			expect(errors.name).toBeUndefined();
		});
	});
	describe("validação da classe", () => {
		it("rejeita classe vazia ou só com espaços", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				class_name: "   ",
			});

			expect(errors.class_name).toBe("A classe é obrigatória.");
		});

		it("rejeita classe com mais de 100 caracteres", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				class_name: "A".repeat(101),
			});

			expect(errors.class_name).toBeDefined();
		});

		it("aceita classe com exatamente 100 caracteres", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				class_name: "A".repeat(100),
			});

			expect(errors.class_name).toBeUndefined();
		});
	});

	describe("validação da raça", () => {
		it("rejeita raça vazia ou só com espaços", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				race: "   ",
			});

			expect(errors.race).toBe("A raça é obrigatória.");
		});

		it("rejeita raça com mais de 100 caracteres", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				race: "A".repeat(101),
			});

			expect(errors.race).toBeDefined();
		});

		it("aceita raça com exatamente 100 caracteres", () => {
			const { errors } = validateCharacter({
				...validCharacter,
				race: "A".repeat(100),
			});

			expect(errors.race).toBeUndefined();
		});
	});
	describe("validação do nível", () => {
		it.each(["", null, undefined])("rejeita nível vazio: %s", (level) => {
			const { errors } = validateCharacter({
				...validCharacter,
				level,
			});

			expect(errors.level).toBeDefined();
		});

		it.each([0, -1, "0", "21", 21])(
			"rejeita nível fora do intervalo: %s",
			(level) => {
				const { errors } = validateCharacter({
					...validCharacter,
					level,
				});

				expect(errors.level).toBeDefined();
			},
		);

		it.each(["2.5", 2.5, "abc"])(
			"rejeita nível que não seja inteiro: %s",
			(level) => {
				const { errors } = validateCharacter({
					...validCharacter,
					level,
				});

				expect(errors.level).toBeDefined();
			},
		);

		it.each([1, 5, 10, 20, "1", "20"])("aceita nível válido: %s", (level) => {
			const { errors } = validateCharacter({
				...validCharacter,
				level,
			});

			expect(errors.level).toBeUndefined();
		});
	});
	describe("validação geral", () => {
		it("aceita um personagem válido", () => {
			const result = validateCharacter(validCharacter);

			expect(result.errors).toEqual({});
			expect(result.values).toEqual({
				name: "Chloe",
				class_name: "Bruxo",
				race: "Meio-elfo",
				level: 5,
			});
		});

		it("remove espaços extras dos campos de texto", () => {
			const result = validateCharacter({
				name: "  Chloe  ",
				class_name: "  Guerreiro  ",
				race: "  Humano  ",
				level: "5",
			});

			expect(result.values).toEqual({
				name: "Chloe",
				class_name: "Guerreiro",
				race: "Humano",
				level: 5,
			});
		});

		it("identifica todos os campos inválidos simultaneamente", () => {
			const { errors } = validateCharacter({
				name: "",
				class_name: "",
				race: "",
				level: "",
			});

			expect(errors).toHaveProperty("name");
			expect(errors).toHaveProperty("class_name");
			expect(errors).toHaveProperty("race");
			expect(errors).toHaveProperty("level");
		});
	});
});
