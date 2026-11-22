import { useState } from "react";
import {
	calculateInvestigatorDefaults,
	generateRandomAttributes,
} from "../utils/investigatorRules";

const attributes = [
	["strength", "FOR"],
	["constitution", "CON"],
	["dexterity", "DES"],
	["appearance", "APA"],
	["size", "TAM"],
	["intelligence", "INT"],
	["power", "POD"],
	["education", "EDU"],
	["luck", "Sorte"],
];

const customFields = [
	["max_hit_points", "PV máximos", 0],
	["current_hit_points", "PV atuais", 0],
	["max_magic_points", "PM máximos", 0],
	["current_magic_points", "PM atuais", 0],
	["initial_sanity", "Sanidade inicial", 0, 99],
	["max_sanity", "Sanidade máxima", 0, 99],
	["current_sanity", "Sanidade atual", 0, 99],
	["movement_rate", "Movimento", 0],
	["build", "Porte Físico"],
	["dodge", "Esquiva", 0, 100],
];

const historyFields = [
	["story", "História"],
	["personal_description", "Descrição pessoal"],
	["ideology_beliefs", "Ideologia e crenças"],
	["significant_people", "Pessoas importantes"],
	["meaningful_locations", "Locais significativos"],
	["treasured_possessions", "Objetos importantes"],
	["traits", "Características pessoais"],
	["injuries_scars", "Ferimentos e cicatrizes"],
	["phobias_manias", "Fobias e manias"],
	["arcane_tomes_spells", "Tomos e feitiços"],
	["strange_encounters", "Encontros sobrenaturais"],
];

const inventoryFields = [
	["gear_possessions", "Equipamentos e pertences"],
	["spending_level", "Nível de gastos"],
	["cash", "Dinheiro"],
	["assets", "Patrimônio"],
];

const conditions = [
	["temporary_insanity", "Insanidade temporária"],
	["indefinite_insanity", "Insanidade indefinida"],
	["major_wound", "Ferimento grave"],
	["unconscious", "Inconsciente"],
	["dying", "Morrendo"],
];

const initialValues = {
	name: "",
	age: "",
	gender: "",
	residence: "",
	birthplace: "",
	...Object.fromEntries(attributes.map(([key]) => [key, ""])),
	...Object.fromEntries(customFields.map(([key]) => [key, ""])),
	damage_bonus: "",
	...Object.fromEntries(historyFields.map(([key]) => [key, ""])),
	...Object.fromEntries(inventoryFields.map(([key]) => [key, ""])),
	...Object.fromEntries(conditions.map(([key]) => [key, false])),
};

export default function InvestigatorForm({ onCreate, onCancel }) {
	const [values, setValues] = useState(initialValues);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");
	const [overrides, setOverrides] = useState({});

	const calculated = calculateInvestigatorDefaults(values, overrides);

	function handleChange(field, value) {
		setValues((current) => ({
			...current,
			[field]: value,
		}));
	}

	function handleGenerateAttributes() {
		const generated = generateRandomAttributes();

		setValues((current) => ({
			...current,
			...generated,
		}));
	}

	function handleOverrideChange(key, value) {
		setOverrides((current) => ({
			...current,
			[key]: value,
		}));
	}

	function restoreAutomatic(key) {
		setOverrides((current) => {
			const updated = { ...current };
			delete updated[key];

			return updated;
		});
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setError("");

		const name = values.name.trim();

		if (!name) {
			setError("Informe o nome do investigador.");
			return;
		}

		const data = { name };

		for (const [key] of attributes) {
			const value = Number(values[key]);

			if (
				values[key] === "" ||
				!Number.isInteger(value) ||
				value < 0 ||
				value > 100
			) {
				setError(`Informe um valor válido para ${label}.`);
				return;
			}

			data[key] = value;
		}

		if (values.age !== "") {
			data.age = Number(values.age);
		}

		for (const [key] of customFields) {
			const value = overrides[key];

			if (value !== undefined && value !== "") {
				data[key] = Number(value);
			}
		}

		const damageBonus = (overrides.damage_bonus || "").trim();

		if (damageBonus) {
			data.damage_bonus = damageBonus;
		}

		const textFields = [
			"gender",
			"residence",
			"birthplace",
			...historyFields.map(([key]) => key),
			...inventoryFields.map(([key]) => key),
		];

		for (const key of textFields) {
			const value = values[key].trim();

			if (value) {
				data[key] = value;
			}
		}

		for (const [key] of conditions) {
			data[key] = values[key];
		}

		setSaving(true);

		try {
			await onCreate(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	}

	return (
		<form className="investigator-form" onSubmit={handleSubmit}>
			<h2>Novo investigador</h2>

			<p className="page-description">
				Preencha os dados do personagem. Os campos marcados com * são
				obrigatórios.
			</p>

			<fieldset>
				<legend>Identificação</legend>

				<div className="investigator-form-grid">
					<label>
						Nome *
						<input
							type="text"
							value={values.name}
							onChange={(event) => handleChange("name", event.target.value)}
							maxLength={100}
							required
						/>
					</label>

					<label>
						Idade
						<input
							type="number"
							min="1"
							step="1"
							value={values.age}
							onChange={(event) => handleChange("age", event.target.value)}
						/>
					</label>

					{[
						["gender", "Gênero", 30],
						["residence", "Residência", 150],
						["birthplace", "Local de nascimento", 150],
					].map(([key, label, maxLength]) => (
						<label key={key}>
							{label}
							<input
								type="text"
								value={values[key]}
								maxLength={maxLength}
								onChange={(event) => handleChange(key, event.target.value)}
							/>
						</label>
					))}
				</div>
			</fieldset>

			<fieldset>
				<legend>Características</legend>

				<div className="attributes-toolbar">
					<p>Informe os atributos manualmente ou gere valores aleatórios.</p>

					<button
						type="button"
						className="secondary-button"
						onClick={handleGenerateAttributes}
					>
						🎲 Gerar atributos
					</button>
				</div>

				<div className="investigator-form-grid">
					{attributes.map(([key, label]) => (
						<label key={key}>
							{label} *
							<input
								type="number"
								min="0"
								max="100"
								step="1"
								required
								value={values[key]}
								onChange={(event) => handleChange(key, event.target.value)}
							/>
						</label>
					))}
				</div>
			</fieldset>

			<details className="investigator-form-optional" open>
				<summary>Vida, Sanidade e Combate — Valores calculados</summary>

				<p>
					Os valores são preenchidos automaticamente conforme os atributos. Você
					pode alterá-los para usar regras da casa. Para restaurar um cálculo
					automático, apague o valor do campo e saia dele.
				</p>

				<div className="investigator-form-grid">
					{customFields.map(([key, label, min, max]) => (
						<label key={key}>
							{label}

							<input
								type="number"
								min={min}
								max={max}
								step="1"
								value={overrides[key] ?? calculated[key] ?? ""}
								onChange={(event) =>
									handleOverrideChange(key, event.target.value)
								}
								onBlur={() => {
									if (overrides[key] === "") {
										restoreAutomatic(key);
									}
								}}
							/>

							<small className="calculated-hint">
								{overrides[key] !== undefined && overrides[key] !== ""
									? "Personalizado"
									: "Automático"}
							</small>
						</label>
					))}

					<label>
						Bônus de dano
						<input
							type="text"
							maxLength={20}
							placeholder="Ex.: +1D4"
							value={overrides.damage_bonus ?? calculated.damage_bonus ?? ""}
							onChange={(event) =>
								handleOverrideChange("damage_bonus", event.target.value)
							}
							onBlur={() => {
								if (overrides.damage_bonus === "") {
									restoreAutomatic("damage_bonus");
								}
							}}
						/>
						<small className="calculated-hint">
							{overrides.damage_bonus !== undefined &&
							overrides.damage_bonus !== ""
								? "Personalizado"
								: "Automático"}
						</small>
					</label>
				</div>
			</details>

			<details className="investigator-form-optional">
				<summary>Condições iniciais</summary>

				<div className="investigator-conditions">
					{conditions.map(([key, label]) => (
						<label key={key}>
							<input
								type="checkbox"
								checked={values[key]}
								onChange={(event) => handleChange(key, event.target.checked)}
							/>
							{label}
						</label>
					))}
				</div>
			</details>

			<details className="investigator-form-optional">
				<summary>História e personalidade</summary>

				<div className="investigator-text-fields">
					{historyFields.map(([key, label]) => (
						<label key={key}>
							{label}
							<textarea
								rows={3}
								value={values[key]}
								onChange={(event) => handleChange(key, event.target.value)}
							/>
						</label>
					))}
				</div>
			</details>

			<details className="investigator-form-optional">
				<summary>Inventário e patrimônio</summary>

				<div className="investigator-text-fields">
					{inventoryFields.map(([key, label]) => (
						<label key={key}>
							{label}
							<textarea
								rows={3}
								value={values[key]}
								onChange={(event) => handleChange(key, event.target.value)}
							/>
						</label>
					))}
				</div>
			</details>

			{error && (
				<p className="error-message" role="alert">
					{error}
				</p>
			)}

			<div className="form-actions">
				<button
					type="button"
					className="secondary-button"
					onClick={onCancel}
					disabled={saving}
				>
					Cancelar
				</button>

				<button type="submit" className="primary-button" disabled={saving}>
					{saving ? "Cadastrando..." : "Cadastrar investigador"}
				</button>
			</div>
		</form>
	);
}
