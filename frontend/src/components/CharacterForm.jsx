import { useState } from "react";
import { validateCharacter } from "../validation";

export function CharacterForm({ onAdd }) {
	const [name, setName] = useState("");
	const [class_name, setClassName] = useState("");
	const [race, setRace] = useState("");
	const [level, setLevel] = useState("");
	const [errors, setErrors] = useState({});

	function handleSubmit(event) {
		event.preventDefault();
		const result = validateCharacter({ name, class_name, race, level });
		setErrors(result.errors);
		if (Object.keys(result.errors).length > 0) return;

		onAdd(result.values);
		setName("");
		setClassName("");
		setRace("");
		setLevel("");
		setErrors({});
	}
	const inputClass = (field) =>
		`w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:ring-2 ${
			errors[field]
				? "border-red-400 focus:border-red-400 focus:ring-red-100"
				: "border-slate-200 focus:border-[#526B8B] focus:ring-[#526B8B]/15"
		}`;

	return (
		<form
			onSubmit={handleSubmit}
			noValidate
			className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
		>
			<div className="flex items-center gap-3 border-b border-slate-100 pb-4">
				<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F9F1DF] text-xl">
					✦
				</div>
				<div>
					<h3 className="font-semibold text-[#26364D]">Dados do aventureiro</h3>
					<p className="text-xs text-slate-500">
						Preencha as informações do personagem.
					</p>
				</div>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				<div className="space-y-1.5 sm:col-span-2">
					<label
						htmlFor="character-name"
						className="block text-sm font-medium text-slate-700"
					>
						Nome
					</label>
					<input
						id="character-name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						aria-invalid={errors.name ? "true" : "false"}
						aria-describedby={errors.name ? "character-name-error" : undefined}
						placeholder="Ex.: Chloe"
						maxLength={100}
						className={inputClass("name")}
					/>
					{errors.name && (
						<p
							id="character-name-error"
							role="alert"
							className="text-xs text-red-600"
						>
							{errors.name}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="character-class"
						className="block text-sm font-medium text-slate-700"
					>
						Classe
					</label>
					<input
						id="character-class"
						value={class_name}
						onChange={(event) => setClassName(event.target.value)}
						aria-invalid={errors.class_name ? "true" : "false"}
						aria-describedby={
							errors.class_name ? "character-class-error" : undefined
						}
						placeholder="Ex.: Guerreiro"
						maxLength={100}
						className={inputClass("class_name")}
					/>
					{errors.class_name && (
						<p
							id="character-class-error"
							role="alert"
							className="text-xs text-red-600"
						>
							{errors.class_name}
						</p>
					)}
				</div>

				<div className="space-y-1.5">
					<label
						htmlFor="character-race"
						className="block text-sm font-medium text-slate-700"
					>
						Raça
					</label>
					<input
						id="character-race"
						value={race}
						onChange={(event) => setRace(event.target.value)}
						aria-invalid={errors.race ? "true" : "false"}
						aria-describedby={errors.race ? "character-race-error" : undefined}
						placeholder="Ex.: Humano"
						maxLength={100}
						className={inputClass("race")}
					/>
					{errors.race && (
						<p
							id="character-race-error"
							role="alert"
							className="text-xs text-red-600"
						>
							{errors.race}
						</p>
					)}
				</div>

				<div className="space-y-1.5 sm:col-span-2">
					<label
						htmlFor="character-level"
						className="block text-sm font-medium text-slate-700"
					>
						Nível
					</label>
					<input
						id="character-level"
						type="number"
						min={1}
						max={20}
						step={1}
						value={level}
						onChange={(event) => setLevel(event.target.value)}
						aria-invalid={errors.level ? "true" : "false"}
						aria-describedby={
							errors.level ? "character-level-error" : undefined
						}
						placeholder="Ex.: 5"
						className={inputClass("level")}
					/>
					{errors.level && (
						<p
							id="character-level-error"
							role="alert"
							className="text-xs text-red-600"
						>
							{errors.level}
						</p>
					)}
				</div>
			</div>

			<button
				type="submit"
				className="w-full rounded-lg bg-[#354D6C] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#26364D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#354D6C]"
			>
				Adicionar personagem
			</button>
		</form>
	);
}
