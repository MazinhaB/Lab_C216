export function CharacterDetails({ character, onClose, onEdit, onDelete }) {
	function handleDelete() {
		const confirmed = window.confirm(
			`Tem certeza de que deseja excluir ${character.name}?`,
		);

		if (confirmed) {
			onDelete(character.id);
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center px-5 py-8">
			<button
				type="button"
				aria-label="Fechar detalhes"
				onClick={onClose}
				className="absolute inset-0 h-full w-full cursor-default bg-[#172235]/60"
			/>
			<section
				role="dialog"
				aria-modal="true"
				aria-labelledby="character-details-title"
				className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
			>
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-[#A17B3F]">
							Ficha do aventureiro
						</p>
						<h2
							id="character-details-title"
							className="mt-1 text-2xl font-bold text-[#26364D]"
						>
							{character.name}
						</h2>
					</div>

					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar detalhes"
						className="rounded-lg px-2 py-1 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
					>
						×
					</button>
				</div>

				<div className="mt-6 grid grid-cols-2 gap-3">
					<div className="rounded-xl bg-[#EDF1F6] p-4">
						<p className="text-xs font-semibold uppercase tracking-wider text-[#354D6C]">
							Classe
						</p>
						<p className="mt-1 font-semibold text-[#26364D]">
							{character.class_name}
						</p>
					</div>

					<div className="rounded-xl bg-[#F9F1DF] p-4">
						<p className="text-xs font-semibold uppercase tracking-wider text-[#80612B]">
							Raça
						</p>
						<p className="mt-1 font-semibold text-[#26364D]">
							{character.race}
						</p>
					</div>
				</div>

				<div className="mt-3 rounded-xl border border-slate-200 p-4">
					<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
						Nível
					</p>
					<p className="mt-1 text-2xl font-bold text-[#26364D]">
						{character.level}
					</p>
				</div>

				<div className="mt-6 flex flex-col gap-3 sm:flex-row">
					<button
						type="button"
						onClick={() => onEdit(character)}
						className="flex-1 rounded-xl bg-[#26364D] px-4 py-3 font-semibold text-white transition hover:bg-[#354D6C]"
					>
						Editar personagem
					</button>

					<button
						type="button"
						onClick={handleDelete}
						className="flex-1 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50"
					>
						Excluir personagem
					</button>
				</div>
			</section>
		</div>
	);
}
