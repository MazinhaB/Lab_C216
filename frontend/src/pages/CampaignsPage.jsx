import { useEffect, useState } from "react";

import CampaignCard from "../components/CampaignCard";
import {
	createCampaign,
	deleteCampaign,
	getCampaigns,
	updateCampaign,
} from "../services/campaigns";

export default function CampaignsPage({ onOpenCampaign }) {
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [actionError, setActionError] = useState("");

	const [expandedCampaignId, setExpandedCampaignId] = useState(null);
	const [deletingCampaignId, setDeletingCampaignId] = useState(null);

	const [showForm, setShowForm] = useState(false);
	const [editingCampaign, setEditingCampaign] = useState(null);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [saving, setSaving] = useState(false);
	const [formError, setFormError] = useState("");

	useEffect(() => {
		async function loadCampaigns() {
			try {
				const data = await getCampaigns();
				setCampaigns(data);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}

		loadCampaigns();
	}, []);

	function handleToggleCampaign(campaignId) {
		setExpandedCampaignId((current) =>
			current === campaignId ? null : campaignId,
		);
	}

	function handleNewCampaign() {
		setEditingCampaign(null);
		setName("");
		setDescription("");
		setFormError("");
		setShowForm(true);
		setExpandedCampaignId(null);
	}

	function handleEditCampaign(campaign) {
		setEditingCampaign(campaign);
		setName(campaign.name);
		setDescription(campaign.description || "");
		setFormError("");
		setShowForm(true);
		setExpandedCampaignId(null);
	}

	function handleCancel() {
		setShowForm(false);
		setEditingCampaign(null);
		setName("");
		setDescription("");
		setFormError("");
	}

	async function handleSaveCampaign(event) {
		event.preventDefault();

		if (!name.trim()) {
			setFormError("Informe o nome da campanha.");
			return;
		}

		setSaving(true);
		setFormError("");

		const data = {
			name: name.trim(),
			description: description.trim() || null,
		};

		try {
			if (editingCampaign) {
				const updated = await updateCampaign(editingCampaign.id, data);

				setCampaigns((current) =>
					current.map((campaign) =>
						campaign.id === updated.id ? updated : campaign,
					),
				);
			} else {
				const created = await createCampaign(data);
				setCampaigns((current) => [...current, created]);
			}

			handleCancel();
		} catch (err) {
			setFormError(err.message);
		} finally {
			setSaving(false);
		}
	}

	async function handleDeleteCampaign(campaign) {
		if (deletingCampaignId !== null) {
			return;
		}

		const confirmed = window.confirm(
			`Deseja excluir a campanha "${campaign.name}"?\n\n` +
				"Todos os investigadores cadastrados nessa campanha " +
				"também serão excluídos permanentemente.\n\n" +
				"Essa ação não pode ser desfeita.",
		);

		if (!confirmed) {
			return;
		}

		setDeletingCampaignId(campaign.id);
		setActionError("");

		try {
			await deleteCampaign(campaign.id);

			setCampaigns((current) =>
				current.filter((item) => item.id !== campaign.id),
			);

			setExpandedCampaignId(null);
		} catch (err) {
			setActionError(err.message);
		} finally {
			setDeletingCampaignId(null);
		}
	}

	return (
		<section>
			<div className="page-heading">
				<div>
					<p className="eyebrow">ARQUIVO DE INVESTIGAÇÕES</p>
					<h1>Campanhas</h1>

					<p className="page-description">
						Gerencie suas campanhas e seus investigadores.
					</p>
				</div>

				<button
					type="button"
					className="primary-button"
					onClick={handleNewCampaign}
					disabled={showForm}
				>
					+ Nova Campanha
				</button>
			</div>

			{showForm && (
				<form className="campaign-form" onSubmit={handleSaveCampaign}>
					<h2>{editingCampaign ? "Editar campanha" : "Nova campanha"}</h2>

					<label htmlFor="campaign-name">Nome</label>
					<input
						id="campaign-name"
						type="text"
						value={name}
						onChange={(event) => setName(event.target.value)}
						maxLength={100}
						required
					/>

					<label htmlFor="campaign-description">Descrição</label>
					<textarea
						id="campaign-description"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						rows={4}
					/>

					{formError && (
						<p className="error-message" role="alert">
							{formError}
						</p>
					)}

					<div className="form-actions">
						<button
							type="button"
							className="secondary-button"
							onClick={handleCancel}
							disabled={saving}
						>
							Cancelar
						</button>

						<button type="submit" className="primary-button" disabled={saving}>
							{saving
								? "Salvando..."
								: editingCampaign
									? "Salvar alterações"
									: "Criar campanha"}
						</button>
					</div>
				</form>
			)}

			{loading && <p>Carregando campanhas...</p>}

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

			{!loading && !error && campaigns.length === 0 && (
				<div className="empty-state">
					<h2>Nenhuma campanha cadastrada</h2>
					<p>
						Crie sua primeira campanha para começar a cadastrar investigadores.
					</p>
				</div>
			)}

			{!loading && campaigns.length > 0 && (
				<div className="campaign-grid">
					{campaigns.map((campaign) => (
						<CampaignCard
							key={campaign.id}
							campaign={campaign}
							expanded={expandedCampaignId === campaign.id}
							onToggle={handleToggleCampaign}
							onOpen={onOpenCampaign}
							onEdit={handleEditCampaign}
							onDelete={handleDeleteCampaign}
							deleting={deletingCampaignId === campaign.id}
						/>
					))}
				</div>
			)}
		</section>
	);
}
