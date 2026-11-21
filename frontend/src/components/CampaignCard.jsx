export default function CampaignCard({
	campaign,
	deleting,
	expanded,
	onDelete,
	onEdit,
	onOpen,
	onToggle,
}) {
	return (
		<article className="campaign-card">
			<button
				type="button"
				className="campaign-card-trigger"
				onClick={() => onToggle(campaign.id)}
				aria-expanded={expanded}
			>
				<h2>{campaign.name}</h2>

				<p>{campaign.description || "Nenhuma descrição foi salva."}</p>

				<span className="campaign-card-footer">
					{expanded ? "Fechar opções -" : "Ver opções +"}
				</span>
			</button>

			{expanded && (
				<div className="campaign-card-actions">
					<button type="button" onClick={() => onOpen(campaign)}>
						Abrir detalhes
					</button>

					<button type="button" onClick={() => onEdit(campaign)}>
						Editar campanha
					</button>

					<button
						type="button"
						className="danger-button"
						onClick={() => onDelete(campaign)}
						disabled={deleting}
					>
						{deleting ? "Excluindo..." : "Excluir campanha"}
					</button>
				</div>
			)}
		</article>
	);
}
