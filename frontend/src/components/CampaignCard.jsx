export default function CampaignCard({ campaign, onOpen }) {
	return (
		<button
			type="button"
			className="campaign-card"
			onClick={() => onOpen(campaign)}
		>
			<h2>{campaign.name}</h2>

			<p>{campaign.description || "Sem descrição cadastrada."}</p>

			<span className="campaign-card-footer">Abrir campanha →</span>
		</button>
	);
}
