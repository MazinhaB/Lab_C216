import { useState } from "react";
import { CharacterForm } from "./components/CharacterForm";
import { CharacterList } from "./components/CharacterList";

export default function App() {
	const [characters, setCharacters] = useState([]);

	function addCharacter({ name, class_name, race, level }) {
		setCharacters((current) => [
			...current,
			{ id: crypto.randomUUID(), name, class_name, race, level },
		]);
	}

	return (
		<main className="min-h-screen bg-[#F5F6F8] text-slate-800">
			<header className="border-b border-slate-200 bg-[#26364D] text-white">
				<div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-5 sm:px-8">
					<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D9B979] text-xl text-[#26364D]">
						⚔
					</div>
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D9B979]">
							Taverna do Aventureiro
						</p>
						<p className="text-lg font-bold tracking-wide">
							Gerenciador de Personagens de RPG
						</p>
					</div>
				</div>
			</header>

			<div className="mx-auto max-w-5xl space-y-8 px-5 py-8 sm:px-8 sm:py-10">
				<section className="space-y-3">
					<div className="flex flex-wrap items-center gap-3">
						<span className="rounded-full border border-[#D9B979] bg-[#F9F1DF] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#80612B]">
							Sistema ativo
						</span>
						<span className="text-sm text-slate-500">Dungeons & Dragons</span>
					</div>

					<div>
						<h1 className="text-3xl font-bold tracking-tight text-[#26364D] sm:text-4xl">
							Seu grupo de aventureiros
						</h1>
						<p className="mt-2 text-slate-500">
							Crie, organize e acompanhe seus personagens.
						</p>
					</div>
				</section>

				<div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
					<section className="space-y-4">
						<div>
							<p className="text-xs font-semibold uppercase tracking-widest text-[#A17B3F]">
								Novo aventureiro
							</p>
							<h2 className="mt-1 text-xl font-bold text-[#26364D]">
								Criar personagem
							</h2>
						</div>

						<CharacterForm onAdd={addCharacter} />
					</section>

					<section aria-labelledby="characters-heading" className="space-y-4">
						<div className="flex items-end justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-widest text-[#A17B3F]">
									Sua coleção
								</p>
								<h2
									id="characters-heading"
									className="mt-1 text-xl font-bold text-[#26364D]"
								>
									Personagens cadastrados
								</h2>
							</div>

							<span className="rounded-full bg-[#26364D] px-3 py-1 text-sm font-semibold text-white">
								{characters.length}
							</span>
						</div>

						<CharacterList characters={characters} />
					</section>
				</div>

				<footer className="border-t border-slate-200 pt-5 text-center text-xs text-slate-400">
					· Taverna do Aventureiro ·
				</footer>
			</div>
		</main>
	);
}
