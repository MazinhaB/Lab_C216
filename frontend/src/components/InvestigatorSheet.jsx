import { useState } from "react";

const identityFields = [
	["name", "Nome", "text"],
	["age", "Idade", "number", 1],
	["gender", "Gênero", "text"],
	["residence", "Residência", "text"],
	["birthplace", "Local de nascimento", "text"],
];

const attributeFields = [
	["strength", "FOR", "number", 0, 100],
	["constitution", "CON", "number", 0, 100],
	["dexterity", "DES", "number", 0, 100],
	["appearance", "APA", "number", 0, 100],
	["size", "TAM", "number", 0, 100],
	["intelligence", "INT", "number", 0, 100],
	["power", "POD", "number", 0, 100],
	["education", "EDU", "number", 0, 100],
	["luck", "Sorte", "number", 0, 100],
];

const statusFields = [
	["current_hit_points", "PV atuais", "number", 0],
	["max_hit_points", "PV máximos", "number", 0],
	["current_magic_points", "PM atuais", "number", 0],
	["max_magic_points", "PM máximos", "number", 0],
	["initial_sanity", "Sanidade inicial", "number", 0, 99],
	["current_sanity", "Sanidade atual", "number", 0, 99],
	["max_sanity", "Sanidade máxima", "number", 0, 99],
	["movement_rate", "Movimento", "number", 0],
	["build", "Porte Físico", "number"],
	["damage_bonus", "Bônus de dano", "text"],
	["dodge", "Esquiva", "number", 0, 100],
];

const conditionFields = [
	["temporary_insanity", "Insanidade temporária", "checkbox"],
	["indefinite_insanity", "Insanidade indefinida", "checkbox"],
	["major_wound", "Ferimento grave", "checkbox"],
	["unconscious", "Inconsciente", "checkbox"],
	["dying", "Morrendo", "checkbox"],
];

const historyFields = [
	["story", "História", "textarea"],
	["personal_description", "Descrição pessoal", "textarea"],
	["ideology_beliefs", "Ideologia e crenças", "textarea"],
	["significant_people", "Pessoas importantes", "textarea"],
	["meaningful_locations", "Locais significativos", "textarea"],
	["treasured_possessions", "Objetos importantes", "textarea"],
	["traits", "Características pessoais", "textarea"],
	["injuries_scars", "Ferimentos e cicatrizes", "textarea"],
	["phobias_manias", "Fobias e manias", "textarea"],
	["arcane_tomes_spells", "Tomos e feitiços", "textarea"],
	["strange_encounters", "Encontros sobrenaturais", "textarea"],
];

const inventoryFields = [
	["gear_possessions", "Equipamentos e pertences", "textarea"],
	["spending_level", "Nível de gastos", "textarea"],
	["cash", "Dinheiro", "textarea"],
	["assets", "Patrimônio", "textarea"],
];

const editableFields = [
	...identityFields,
	...attributeFields,
	...statusFields,
	...conditionFields,
	...historyFields,
	...inventoryFields,
];

const nullableFields = new Set([
	"age",
	"gender",
	"residence",
	"birthplace",
	...historyFields.map(([key]) => key),
	...inventoryFields.map(([key]) => key),
]);

const maxLengths = {
	name: 100,
	gender: 30,
	residence: 150,
	birthplace: 150,
	damage_bonus: 20,
};

function SheetFields({ investigator, fields, editing, draft, onChange }) {
	return (
		<dl className="sheet-fields">
			{fields.map(([key, label, type = "text", min, max]) => (
				<div key={key}>
					<dt>{label}</dt>
					<dd>
						{editing ? (
							type === "checkbox" ? (
								<input
									type="checkbox"
									aria-label={label}
									checked={Boolean(draft[key])}
									onChange={(event) => onChange(key, event.target.checked)}
								/>
							) : (
								<input
									type={type}
									aria-label={label}
									value={draft[key] ?? ""}
									onChange={(event) => onChange(key, event.target.value)}
									min={min}
									max={max}
									step={type === "number" ? 1 : undefined}
									maxLength={maxLengths[key]}
									required={!nullableFields.has(key)}
								/>
							)
						) : type === "checkbox" ? (
							investigator[key] ? (
								"Sim"
							) : (
								"Não"
							)
						) : (
							(investigator[key] ?? "Não informado")
						)}
					</dd>
				</div>
			))}
		</dl>
	);
}

function NarrativeFields({ investigator, fields, editing, draft, onChange }) {
	return (
		<div className="sheet-narrative">
			{fields.map(([key, label]) => (
				<section key={key}>
					<h3>{label}</h3>

					{editing ? (
						<textarea
							aria-label={label}
							value={draft[key] ?? ""}
							onChange={(event) => onChange(key, event.target.value)}
							rows={4}
						/>
					) : (
						<p>{investigator[key] || "Não informado."}</p>
					)}
				</section>
			))}
		</div>
	);
}

export default function InvestigatorSheet({ investigator, onClose, onSave }) {
	const [activeTab, setActiveTab] = useState("attributes");
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState({});
	const [saving, setSaving] = useState(false);
	const [saveError, setSaveError] = useState("");

	function handleStartEditing() {
		const values = {};

		for (const [key, , type] of editableFields) {
			values[key] = investigator[key] ?? (type === "checkbox" ? false : "");
		}

		setDraft(values);
		setSaveError("");
		setEditing(true);
	}

	function handleChange(key, value) {
		setDraft((current) => ({
			...current,
			[key]: value,
		}));
	}

	function handleCancelEditing() {
		setEditing(false);
		setDraft({});
		setSaveError("");
	}

	async function handleSave(event) {
		event.preventDefault();

		const changes = {};

		for (const [key, label, type, min, max] of editableFields) {
			let value = draft[key];

			if (type === "number") {
				if (value === "") {
					if (nullableFields.has(key)) {
						value = null;
					} else {
						setSaveError(`Preencha o campo ${label}.`);
						return;
					}
				} else {
					value = Number(value);

					if (
						!Number.isInteger(value) ||
						(min !== undefined && value < min) ||
						(max !== undefined && value > max)
					) {
						setSaveError(`Valor inválido para ${label}.`);
						return;
					}
				}
			} else if (type === "text" || type === "textarea") {
				if (key === "name" || key === "damage_bonus") {
					value = value.trim();

					if (!value) {
						setSaveError(`Preencha o campo ${label}.`);
						return;
					}
				} else if (nullableFields.has(key) && !value.trim()) {
					value = null;
				}
			}

			if (value !== investigator[key]) {
				changes[key] = value;
			}
		}

		if (Object.keys(changes).length === 0) {
			handleCancelEditing();
			return;
		}

		setSaving(true);
		setSaveError("");

		try {
			await onSave(investigator.id, changes);
			setEditing(false);
			setDraft({});
		} catch (err) {
			setSaveError(err.message);
		} finally {
			setSaving(false);
		}
	}

	return (
		<section
			className="investigator-sheet"
			aria-label={`Ficha de ${investigator.name}`}
		>
			<div className="sheet-heading">
				<div>
					<p className="eyebrow">FICHA DO INVESTIGADOR</p>
					<h2>{investigator.name}</h2>
				</div>

				<div className="sheet-heading-actions">
					{!editing && (
						<>
							<button
								type="button"
								className="primary-button"
								onClick={handleStartEditing}
							>
								✎ Editar ficha
							</button>

							<button
								type="button"
								className="secondary-button"
								onClick={onClose}
							>
								Fechar ficha
							</button>
						</>
					)}
				</div>
			</div>

			<form onSubmit={handleSave}>
				<div className="sheet-tabs">
					<button
						type="button"
						className={activeTab === "attributes" ? "active" : ""}
						aria-pressed={activeTab === "attributes"}
						onClick={() => setActiveTab("attributes")}
					>
						Atributos Principais
					</button>

					<button
						type="button"
						className={activeTab === "history" ? "active" : ""}
						aria-pressed={activeTab === "history"}
						onClick={() => setActiveTab("history")}
					>
						História e Personalidade
					</button>

					<button
						type="button"
						className={activeTab === "inventory" ? "active" : ""}
						aria-pressed={activeTab === "inventory"}
						onClick={() => setActiveTab("inventory")}
					>
						Inventário
					</button>
				</div>

				{activeTab === "attributes" && (
					<div className="sheet-content">
						<h3>Identificação</h3>
						<SheetFields
							investigator={investigator}
							fields={identityFields}
							editing={editing}
							draft={draft}
							onChange={handleChange}
						/>

						<h3>Características</h3>
						<SheetFields
							investigator={investigator}
							fields={attributeFields}
							editing={editing}
							draft={draft}
							onChange={handleChange}
						/>

						<h3>Vida, Sanidade e Combate</h3>
						<SheetFields
							investigator={investigator}
							fields={statusFields}
							editing={editing}
							draft={draft}
							onChange={handleChange}
						/>

						<h3>Condições</h3>
						<SheetFields
							investigator={investigator}
							fields={conditionFields}
							editing={editing}
							draft={draft}
							onChange={handleChange}
						/>
					</div>
				)}

				{activeTab === "history" && (
					<div className="sheet-content">
						<NarrativeFields
							investigator={investigator}
							fields={historyFields}
							editing={editing}
							draft={draft}
							onChange={handleChange}
						/>
					</div>
				)}

				{activeTab === "inventory" && (
					<div className="sheet-content">
						<NarrativeFields
							investigator={investigator}
							fields={inventoryFields}
							editing={editing}
							draft={draft}
							onChange={handleChange}
						/>
					</div>
				)}

				{saveError && (
					<p className="error-message" role="alert">
						{saveError}
					</p>
				)}

				{editing && (
					<div className="form-actions">
						<button
							type="button"
							className="secondary-button"
							onClick={handleCancelEditing}
							disabled={saving}
						>
							Cancelar edição
						</button>

						<button type="submit" className="primary-button" disabled={saving}>
							{saving ? "Salvando..." : "Salvar alterações"}
						</button>
					</div>
				)}
			</form>
		</section>
	);
}
