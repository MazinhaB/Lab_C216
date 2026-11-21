export default function CampaignDetailsPage({ campaign, onBack }) {
	return (
		<section>
			<button type="button" className="back-link" onClick={onBack}>
				← Voltar às campanhas
			</button>

			<p className="eyebrow">DOSSIÊ DA CAMPANHA</p>

			<h1>{campaign.name}</h1>

			<p className="page-description">
				{campaign.description || "Sem descrição cadastrada."}
			</p>

			<div className="empty-state">
				<h2>Investigadores</h2>

				<p>Aqui aparecerão os personagens cadastrados nesta campanha.</p>

				<p>
					Na próxima etapa, vamos carregar os investigadores automaticamente
					utilizando o ID da campanha.
				</p>
			</div>
		</section>
	);
}
