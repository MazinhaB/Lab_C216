import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createCharacter,
	deleteCharacter,
	listCharacters,
	patchCharacter,
	updateCharacter,
} from "../../src/services/characters";

const API_URL = "http://localhost:8000/characters/";

const character = {
	name: "Chloe",
	class_name: "Bruxo",
	race: "Meio-Elfo",
	level: 5,
};

function mockResponse(data, ok = true) {
	return {
		ok,
		json: vi.fn().mockResolvedValue(data),
	};
}

describe("Serviço de personagens", () => {
	beforeEach(() => {
		vi.stubGlobal("fetch", vi.fn());
	});

	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("lista os personagens da API", async () => {
		const characters = [{ id: 1, ...character }];
		fetch.mockResolvedValue(mockResponse(characters));

		const result = await listCharacters();

		expect(fetch).toHaveBeenCalledWith(API_URL, undefined);
		expect(result).toEqual(characters);
	});

	it("cadastra um personagem via POST", async () => {
		const created = { id: 1, ...character };
		fetch.mockResolvedValue(mockResponse(created));

		const result = await createCharacter(character);

		expect(fetch).toHaveBeenCalledWith(API_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(character),
		});
		expect(result).toEqual(created);
	});

	it("atualiza um personagem via PUT", async () => {
		const updated = { id: 1, ...character, level: 8 };
		fetch.mockResolvedValue(mockResponse(updated));

		const result = await updateCharacter(1, {
			...character,
			level: 8,
		});

		expect(fetch).toHaveBeenCalledWith(`${API_URL}1`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ...character, level: 8 }),
		});
		expect(result).toEqual(updated);
	});

	it("atualiza parcialmente um personagem via PATCH", async () => {
		const updated = { id: 1, ...character, level: 10 };
		fetch.mockResolvedValue(mockResponse(updated));

		const result = await patchCharacter(1, { level: 10 });

		expect(fetch).toHaveBeenCalledWith(`${API_URL}1`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ level: 10 }),
		});
		expect(result).toEqual(updated);
	});

	it("exclui um personagem via DELETE", async () => {
		const deleted = { id: 1, ...character };
		fetch.mockResolvedValue(mockResponse(deleted));

		const result = await deleteCharacter(1);

		expect(fetch).toHaveBeenCalledWith(`${API_URL}1`, {
			method: "DELETE",
		});
		expect(result).toEqual(deleted);
	});

	it("exibe a mensagem da API quando o nome já existe", async () => {
		fetch.mockResolvedValue(
			mockResponse({ detail: "Já existe um personagem com esse nome" }, false),
		);

		await expect(createCharacter(character)).rejects.toThrow(
			"Já existe um personagem com esse nome",
		);
	});

	it("trata erros de conexão com a API", async () => {
		fetch.mockRejectedValue(new TypeError("Failed to fetch"));

		await expect(listCharacters()).rejects.toThrow(
			"Não foi possível conectar à API.",
		);
	});

	it("utiliza uma mensagem padrão quando a API não informa o erro", async () => {
		fetch.mockResolvedValue(mockResponse({}, false));

		await expect(listCharacters()).rejects.toThrow(
			"Erro ao carregar os personagens.",
		);
	});
});
