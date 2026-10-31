export function CharacterList({ characters }) {
	if (characters.length === 0) {
		return (
			<div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-5 py-10 text-center">
				<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9F1DF] text-2xl">
					⚔
				</div>
				<h3 className="font-semibold text-[#26364D]">
					Sua aventura começa aqui
				</h3>
				<p className="mt-2 max-w-xs text-sm text-slate-500">
					Você ainda não cadastrou nenhum personagem. Crie seu primeiro
					aventureiro para começar!
				</p>
			</div>
		);
	}

	return (
		<ul className="grid gap-3 sm:grid-cols-2">
			{characters.map((character) => (
				<li
					key={character.id}
					className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C7B17F] hover:shadow-md"
				>
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
							<p className="text-xs font-semibold uppercase tracking-wider text-[#A17B3F]">
								Aventureiro
							</p>
							<h3 className="mt-1 truncate text-lg font-bold text-[#26364D]">
								{character.name}
							</h3>
						</div>

						<div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#26364D] text-white">
							<span className="text-[9px] uppercase tracking-wider text-[#D9B979]">
								Nível
							</span>
							<span className="text-lg font-bold leading-tight">
								{character.level}
							</span>
						</div>
					</div>

					<div className="mt-4 flex flex-wrap gap-2">
						<span className="rounded-full bg-[#EDF1F6] px-3 py-1 text-xs font-medium text-[#354D6C]">
							{character.class_name}
						</span>
						<span className="rounded-full bg-[#F9F1DF] px-3 py-1 text-xs font-medium text-[#80612B]">
							{character.race}
						</span>
					</div>
				</li>
			))}
		</ul>
	);
}
