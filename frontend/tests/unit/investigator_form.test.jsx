import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import InvestigatorForm from "../../src/components/InvestigatorForm";

afterEach(() => {
	vi.restoreAllMocks();
});

describe("Cadastro de investigadores", () => {
	it("preenche os atributos e os valores calculados após o sorteio", async () => {
		const user = userEvent.setup();

		vi.spyOn(Math, "random").mockReturnValue(0);

		render(<InvestigatorForm onCreate={vi.fn()} onCancel={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /Gerar atributos/i }));

		expect(screen.getByRole("spinbutton", { name: /^FOR/ })).toHaveValue(15);
		expect(screen.getByRole("spinbutton", { name: /^TAM/ })).toHaveValue(40);
		expect(screen.getByRole("spinbutton", { name: /^PV máximos/ })).toHaveValue(
			5,
		);
		expect(screen.getByRole("spinbutton", { name: /^PM máximos/ })).toHaveValue(
			3,
		);

		expect(
			screen.getByRole("spinbutton", { name: /^Sanidade inicial/ }),
		).toHaveValue(15);
	});

	it("envia os atributos sem sobrescrever os cálculos do backend", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn().mockResolvedValue(undefined);

		vi.spyOn(Math, "random").mockReturnValue(0);

		render(<InvestigatorForm onCreate={onCreate} onCancel={vi.fn()} />);

		await user.type(screen.getByRole("textbox", { name: /Nome/ }), "Miguel");

		await user.click(screen.getByRole("button", { name: /Gerar atributos/i }));

		await user.click(
			screen.getByRole("button", { name: "Cadastrar investigador" }),
		);

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledOnce();
		});

		const data = onCreate.mock.calls[0][0];

		expect(data.name).toBe("Miguel");
		expect(data.strength).toBe(15);
		expect(data.size).toBe(40);

		expect(data).not.toHaveProperty("max_hit_points");
		expect(data).not.toHaveProperty("initial_sanity");
		expect(data).not.toHaveProperty("movement_rate");
	});

	it("permite cadastrar valores personalizados", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn().mockResolvedValue(undefined);

		vi.spyOn(Math, "random").mockReturnValue(0);

		render(<InvestigatorForm onCreate={onCreate} onCancel={vi.fn()} />);

		await user.type(screen.getByRole("textbox", { name: /Nome/ }), "Miguel");

		await user.click(screen.getByRole("button", { name: /Gerar atributos/i }));

		const hitPoints = screen.getByRole("spinbutton", {
			name: /^PV máximos/,
		});

		await user.clear(hitPoints);
		await user.type(hitPoints, "20");

		await user.click(
			screen.getByRole("button", { name: "Cadastrar investigador" }),
		);

		await waitFor(() => {
			expect(onCreate).toHaveBeenCalledOnce();
		});

		const data = onCreate.mock.calls[0][0];

		expect(data.max_hit_points).toBe(20);
		expect(data).not.toHaveProperty("current_hit_points");
	});
});
