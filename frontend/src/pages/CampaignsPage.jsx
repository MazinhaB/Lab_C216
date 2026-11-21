import { useEffect, useState } from "react";

import CampaignCard from "../components/CampaignCard";
import { createCampaign, getCampaigns } from "../services/campaigns";

export default function CampaignsPage({ onOpenCampaign }) {
	const [campaigns, setCampaigns] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const [showForm, setShowForm] = useState(false);
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

	async function handleCreateCampaign(event) {
		event.preventDefault();

		if (!name.trim()) {
			setFormError("Informe o nome da campanha.");
			return;
		}

		setSaving(true);
		setFormError("");

		try {
			const newCampaign = await createCampaign({
				name: name.trim(),
				description: description.trim() || null,
			});

			setCampaigns((current) => [...current, newCampaign]);

			setName("");
			setDescription("");
			setShowForm(false);
		} catch (err) {
			setFormError(err.message);
		} finally {
			setSaving(false);
		}
	}

	function handleCancel() {
		setShowForm(false);
		setName("");
		setDescription("");
		setFormError("");
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
					onClick={() => setShowForm(true)}
					disabled={showForm}
				>
					+ Nova Campanha
				</button>
			</div>

			{showForm && (
				<form className="campaign-form" onSubmit={handleCreateCampaign}>
					<h2>Nova campanha</h2>

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
							{saving ? "Salvando..." : "Criar campanha"}
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
							onOpen={onOpenCampaign}
						/>
					))}
				</div>
			)}
		</section>
	);
}
