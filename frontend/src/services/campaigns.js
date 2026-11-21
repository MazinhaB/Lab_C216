const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function getCampaigns() {
	const response = await fetch(`${API_URL}/campaigns/`);

	if (!response.ok) {
		throw new Error("Não foi possível carregar as campanhas.");
	}

	return response.json();
}

export async function createCampaign(data) {
	const response = await fetch(`${API_URL}/campaigns/`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error("Não foi possível cadastrar a campanha.");
	}

	return response.json();
}
