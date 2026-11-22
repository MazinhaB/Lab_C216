const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getInvestigators(campaignId) {
	const response = await fetch(
		`${API_URL}/campaigns/${campaignId}/investigators`,
	);

	if (!response.ok) {
		throw new Error("Não foi possível carregar os investigadores.");
	}

	return response.json();
}

export async function deleteInvestigator(campaignId, investigatorId) {
	const response = await fetch(
		`${API_URL}/campaigns/${campaignId}/investigators/${investigatorId}`,
		{
			method: "DELETE",
		},
	);

	if (!response.ok) {
		throw new Error("Não foi possível excluir o investigador.");
	}
}

export async function patchInvestigator(campaignId, investigatorId, changes) {
	const response = await fetch(
		`${API_URL}/campaigns/${campaignId}/investigators/${investigatorId}`,
		{
			method: "PATCH",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(changes),
		},
	);

	if (!response.ok) {
		throw new Error("Não foi possível salvar as alterações da ficha.");
	}

	return response.json();
}

export async function createInvestigator(campaignId, data) {
	const response = await fetch(
		`${API_URL}/campaigns/${campaignId}/investigators`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		},
	);

	if (!response.ok) {
		throw new Error("Não foi possível cadastrar o investigador.");
	}

	return response.json();
}
