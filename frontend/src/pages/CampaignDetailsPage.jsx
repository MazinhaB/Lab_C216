import { useEffect, useState } from "react";

import InvestigatorCard from "../components/InvestigatorCard";
import InvestigatorForm from "../components/InvestigatorForm";
import InvestigatorSheet from "../components/InvestigatorSheet";
import {
	createInvestigator,
	deleteInvestigator,
	getInvestigators,
	patchInvestigator,
} from "../services/investigators";

export default function CampaignDetailsPage({ campaign, onBack }) {
	const [investigators, setInvestigators] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");

	const [showCreateForm, setShowCreateForm] = useState(false);
	const [expandedId, setExpandedId] = useState(null);
	const [selectedId, setSelectedId] = useState(null);
	const [deletingId, setDeletingId] = useState(null);

	const selectedInvestigator = investigators.find(
		(investigator) => investigator.id === selectedId,
	);

	useEffect(() => {
		let active = true;

		async function loadInvestigators() {
			try {
				const data = await getInvestigators(campaign.id);

				if (active) {
					setInvestigators(data);
				}
			} catch (err) {
				if (active) {
					setError(err.message);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		loadInvestigators();

		return () => {
			active = false;
		};
	}, [campaign.id]);

	function handleToggle(investigatorId) {
		setExpandedId((current) =>
			current === investigatorId ? null : investigatorId,
		);
	}

	function handleExpand(investigatorId) {
		setSelectedId(investigatorId);
		setExpandedId(null);
	}

	async function handleCreateInvestigator(data) {
		const created = await createInvestigator(campaign.id, data);

		setInvestigators((current) => [...current, created]);
		setShowCreateForm(false);
		setActionError("");

		setSelectedId(created.id);
		setExpandedId(null);
	}

	async function handleSaveInvestigator(investigatorId, changes) {
		const updated = await patchInvestigator(
			campaign.id,
			investigatorId,
			changes,
		);

		setInvestigators((current) =>
			current.map((investigator) =>
				investigator.id === investigatorId ? updated : investigator,
			),
		);
	}

	async function handleDelete(investigator) {
		if (deletingId !== null) {
			return;
		}

		const confirmed = window.confirm(
			`Deseja excluir o investigador "${investigator.name}"?\n\n` +
				"A ficha será excluída permanentemente.\n" +
				"Essa ação não pode ser desfeita.",
		);

		if (!confirmed) {
			return;
		}

		setDeletingId(investigator.id);
		setActionError("");

		try {
			await deleteInvestigator(campaign.id, investigator.id);

			setInvestigators((current) =>
				current.filter((item) => item.id !== investigator.id),
			);

			if (selectedId === investigator.id) {
				setSelectedId(null);
			}

			setExpandedId(null);
		} catch (err) {
			setActionError(err.message);
		} finally {
			setDeletingId(null);
		}
	}

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

			<div className="investigators-heading">
				<h2>Investigadores</h2>

				<button
					type="button"
					className="primary-button"
					onClick={() => setShowCreateForm(true)}
					disabled={showCreateForm}
				>
					+ Novo investigador
				</button>
			</div>

			{showCreateForm && (
				<InvestigatorForm
					onCreate={handleCreateInvestigator}
					onCancel={() => setShowCreateForm(false)}
				/>
			)}

			{loading && <p>Carregando investigadores...</p>}

			{error && (
				<p className="error-message" role="alert">
					{error}
				</p>
			)}

			{actionError && (
				<p className="error-message" role="alert">
					{actionError}
				</p>
			)}

			{!loading && !error && investigators.length === 0 && (
				<div className="empty-state">
					<h2>Nenhum investigador cadastrado</h2>
					<p>Esta campanha ainda não possui investigadores.</p>
				</div>
			)}

			{!loading && !error && investigators.length > 0 && (
				<div className="investigators-grid">
					{investigators.map((investigator) => (
						<InvestigatorCard
							key={investigator.id}
							investigator={investigator}
							expanded={expandedId === investigator.id}
							deleting={deletingId === investigator.id}
							onToggle={handleToggle}
							onExpand={handleExpand}
							onDelete={handleDelete}
						/>
					))}
				</div>
			)}

			{selectedInvestigator && (
				<InvestigatorSheet
					key={selectedInvestigator.id}
					investigator={selectedInvestigator}
					onClose={() => setSelectedId(null)}
					onSave={handleSaveInvestigator}
				/>
			)}
		</section>
	);
}
