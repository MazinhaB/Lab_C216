const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const CHARACTERS_URL = `${API_URL}/characters/`;

async function request(url, options, defaultError) {
	let response;

	try {
		response = await fetch(url, options);
	} catch {
		throw new Error("Não foi possível conectar à API.");
	}

	if (!response.ok) {
		const errorData = await response.json().catch(() => null);

		throw new Error(
			typeof errorData?.detail === "string" ? errorData.detail : defaultError,
		);
	}

	return response.json();
}

function jsonOptions(method, data) {
	return {
		method,
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data),
	};
}

export function listCharacters() {
	return request(CHARACTERS_URL, undefined, "Erro ao carregar os personagens.");
}

export function createCharacter(character) {
	return request(
		CHARACTERS_URL,
		jsonOptions("POST", character),
		"Erro ao cadastrar o personagem.",
	);
}

export function updateCharacter(id, character) {
	return request(
		`${CHARACTERS_URL}${id}`,
		jsonOptions("PUT", character),
		"Erro ao atualizar o personagem.",
	);
}

export function patchCharacter(id, changes) {
	return request(
		`${CHARACTERS_URL}${id}`,
		jsonOptions("PATCH", changes),
		"Erro ao atualizar o personagem.",
	);
}

export function deleteCharacter(id) {
	return request(
		`${CHARACTERS_URL}${id}`,
		{ method: "DELETE" },
		"Erro ao excluir o personagem.",
	);
}
