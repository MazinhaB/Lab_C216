import { afterEach, describe, expect, it, vi } from "vitest";

import {
	calculateInvestigatorDefaults,
	generateRandomAttributes,
} from "../../src/utils/investigatorRules";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("Regras de criação dos investigadores", () => {
	it("gera corretamente os valores mínimos dos dados", () => {
		vi.spyOn(Math, "random").mockReturnValue(0);

		const result = generateRandomAttributes();

		expect(result.strength).toBe(15);
		expect(result.constitution).toBe(15);
		expect(result.dexterity).toBe(15);
		expect(result.appearance).toBe(15);
		expect(result.power).toBe(15);
		expect(result.luck).toBe(15);

		expect(result.size).toBe(40);
		expect(result.intelligence).toBe(40);
		expect(result.education).toBe(40);
	});

	it("gera corretamente os valores máximos dos dados", () => {
		vi.spyOn(Math, "random").mockReturnValue(0.9999);

		const result = generateRandomAttributes();

		for (const value of Object.values(result)) {
			expect(value).toBe(90);
		}
	});

	it("calcula os valores padrão da ficha", () => {
		const result = calculateInvestigatorDefaults({
			strength: "50",
			constitution: "55",
			dexterity: "70",
			size: "55",
			power: "65",
			age: "27",
		});

		expect(result.max_hit_points).toBe(11);
		expect(result.current_hit_points).toBe(11);

		expect(result.max_magic_points).toBe(13);
		expect(result.current_magic_points).toBe(13);

		expect(result.initial_sanity).toBe(65);
		expect(result.max_sanity).toBe(99);
		expect(result.current_sanity).toBe(65);

		expect(result.movement_rate).toBe(8);
		expect(result.build).toBe(0);
		expect(result.damage_bonus).toBe("0");
		expect(result.dodge).toBe(35);
	});

	it("respeita os valores personalizados", () => {
		const attributes = {
			strength: "50",
			constitution: "55",
			dexterity: "70",
			size: "55",
			power: "65",
		};

		const result = calculateInvestigatorDefaults(attributes, {
			max_hit_points: "20",
			max_magic_points: "25",
			initial_sanity: "70",
			max_sanity: "80",
		});

		expect(result.max_hit_points).toBe(11);
		expect(result.current_hit_points).toBe(20);
		expect(result.current_magic_points).toBe(25);
		expect(result.current_sanity).toBe(70);
	});
});
