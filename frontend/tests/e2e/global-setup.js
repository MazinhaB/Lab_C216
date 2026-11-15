export default async function globalSetup() {
	const allowedUrls = ["http://127.0.0.1:5174", "http://localhost:5174"];

	if (!allowedUrls.includes(process.env.E2E_BASE_URL)) {
		throw new Error(
			"Os testes E2E devem utilizar o ambiente isolado. " +
				"Execute 'make e2e' na raiz do projeto.",
		);
	}
}
