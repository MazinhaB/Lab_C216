const conditions = [
	["temporary_insanity", "Insanidade temporária"],
	["indefinite_insanity", "Insanidade indefinida"],
	["major_wound", "Ferimento grave"],
	["unconscious", "Inconsciente"],
	["dying", "Morrendo"],
];

export default function InvestigatorCard({
	investigator,
	expanded,
	deleting,
	onToggle,
	onExpand,
	onDelete,
}) {
	const activeConditions = conditions.filter(
		([key]) => investigator[key] === true,
	);
	return (
		<article className="investigator-card">
			<button
				type="button"
				className="investigator-card-trigger"
				onClick={() => onToggle(investigator.id)}
				aria-expanded={expanded}
			>
				<h3>{investigator.name}</h3>

				<p className="investigator-age">
					{investigator.age != null
						? `${investigator.age} anos`
						: "Idade não informada"}
				</p>

				<div className="investigator-stats">
					<div>
						<span>Sanidade atual</span>
						<strong>{investigator.current_sanity}</strong>
					</div>

					<div>
						<span>PV atuais</span>
						<strong>{investigator.current_hit_points}</strong>
					</div>
				</div>

				{activeConditions.length > 0 && (
					<div className="investigator-card-conditions">
						<span className="conditions-title">Condições ativas</span>

						<div className="conditions-list">
							{activeConditions.map(([key, label]) => (
								<span key={key} className="condition-tag">
									{label}
								</span>
							))}
						</div>
					</div>
				)}

				<span className="campaign-card-footer">
					{expanded ? "Fechar opções -" : "Ver opções +"}
				</span>
			</button>

			{expanded && (
				<div className="investigator-card-actions">
					<button type="button" onClick={() => onExpand(investigator.id)}>
						Expandir ficha
					</button>

					<button
						type="button"
						className="danger-button"
						onClick={() => onDelete(investigator)}
						disabled={deleting}
					>
						{deleting ? "Excluindo..." : "Excluir investigador"}
					</button>
				</div>
			)}
		</article>
	);
}
