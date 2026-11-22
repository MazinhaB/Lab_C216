import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import InvestigatorCard from "../../src/components/InvestigatorCard";

const investigator = {
	id: 1,
	name: "Miguel",
	age: 27,
	current_sanity: 42,
	current_hit_points: 11,
	temporary_insanity: false,
	indefinite_insanity: false,
	major_wound: false,
	unconscious: false,
	dying: false,
};

function renderCard(data) {
	render(
		<InvestigatorCard
			investigator={data}
			expanded={false}
			deleting={false}
			onToggle={vi.fn()}
			onExpand={vi.fn()}
			onDelete={vi.fn()}
		/>,
	);
}

describe("Condições do investigador", () => {
	it("exibe todas as condições ativas", () => {
		renderCard({
			...investigator,
			temporary_insanity: true,
			major_wound: true,
		});

		expect(screen.getByText("Insanidade temporária")).toBeInTheDocument();

		expect(screen.getByText("Ferimento grave")).toBeInTheDocument();

		expect(screen.queryByText("Inconsciente")).not.toBeInTheDocument();
	});

	it("não exibe condições quando nenhuma está ativa", () => {
		renderCard(investigator);

		expect(screen.queryByText("Condições ativas")).not.toBeInTheDocument();
	});
});
