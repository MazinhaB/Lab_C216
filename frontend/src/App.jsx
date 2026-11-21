import { useState } from "react";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";
import CampaignsPage from "./pages/CampaignsPage";

export default function App() {
	const [selectedCampaign, setSelectedCampaign] = useState(null);

	function handleOpenCampaign(campaign) {
		setSelectedCampaign(campaign);
	}

	function handleBackToCampaigns() {
		setSelectedCampaign(null);
	}

	return (
		<div className="app">
			<header className="app-header">
				<span className="brand">ARQUIVOS DE ARKHAM</span>

				<span className="header-subtitle">Gerenciador de investigadores</span>
			</header>

			<main className="app-content">
				{selectedCampaign ? (
					<CampaignDetailsPage
						campaign={selectedCampaign}
						onBack={handleBackToCampaigns}
					/>
				) : (
					<CampaignsPage onOpenCampaign={handleOpenCampaign} />
				)}
			</main>
		</div>
	);
}
