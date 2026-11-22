function rollDice(quantity) {
	let total = 0;

	for (let i = 0; i < quantity; i++) {
		total += Math.floor(Math.random() * 6) + 1;
	}

	return total;
}

export function generateRandomAttributes() {
	return {
		strength: rollDice(3) * 5,
		constitution: rollDice(3) * 5,
		dexterity: rollDice(3) * 5,
		appearance: rollDice(3) * 5,
		size: (rollDice(2) + 6) * 5,
		intelligence: (rollDice(2) + 6) * 5,
		power: rollDice(3) * 5,
		education: (rollDice(2) + 6) * 5,
		luck: rollDice(3) * 5,
	};
}

function toNumber(value) {
	if (value === "" || value === null || value === undefined) {
		return null;
	}

	const number = Number(value);

	return Number.isInteger(number) ? number : null;
}

function effectiveValue(key, overrides, automaticValue) {
	const override = overrides[key];

	if (override === undefined || override === "") {
		return automaticValue ?? null;
	}

	return toNumber(override);
}

export function calculateInvestigatorDefaults(values, overrides = {}) {
	const strength = toNumber(values.strength);
	const constitution = toNumber(values.constitution);
	const dexterity = toNumber(values.dexterity);
	const size = toNumber(values.size);
	const power = toNumber(values.power);
	const age = toNumber(values.age);

	const result = {
		max_sanity: 99,
	};

	// Pontos de Vida
	if (constitution !== null && size !== null) {
		result.max_hit_points = Math.floor((constitution + size) / 10);
	}

	const maxHitPoints = effectiveValue(
		"max_hit_points",
		overrides,
		result.max_hit_points,
	);

	if (maxHitPoints !== null) {
		result.current_hit_points = maxHitPoints;
	}

	// Pontos de Magia e Sanidade
	if (power !== null) {
		result.max_magic_points = Math.floor(power / 5);
		result.initial_sanity = Math.min(power, 99);
	}

	const maxMagicPoints = effectiveValue(
		"max_magic_points",
		overrides,
		result.max_magic_points,
	);

	if (maxMagicPoints !== null) {
		result.current_magic_points = maxMagicPoints;
	}

	const initialSanity = effectiveValue(
		"initial_sanity",
		overrides,
		result.initial_sanity,
	);

	const maxSanity = effectiveValue("max_sanity", overrides, result.max_sanity);

	if (initialSanity !== null && maxSanity !== null) {
		result.current_sanity = Math.min(initialSanity, maxSanity);
	}

	// Porte Físico e Bônus de Dano
	if (strength !== null && size !== null) {
		const total = strength + size;

		if (total <= 64) {
			result.build = -2;
			result.damage_bonus = "-2";
		} else if (total <= 84) {
			result.build = -1;
			result.damage_bonus = "-1";
		} else if (total <= 124) {
			result.build = 0;
			result.damage_bonus = "0";
		} else if (total <= 164) {
			result.build = 1;
			result.damage_bonus = "+1D4";
		} else {
			result.build = 2;
			result.damage_bonus = "+1D6";
		}
	}

	// Movimento
	if (strength !== null && dexterity !== null && size !== null) {
		let movement = 8;

		if (strength > size && dexterity > size) {
			movement = 9;
		} else if (strength < size && dexterity < size) {
			movement = 7;
		}

		if (age !== null && age >= 40) {
			movement -= Math.min(Math.floor(age / 10) - 3, 5);
		}

		result.movement_rate = Math.max(0, movement);
	}

	// Esquiva
	if (dexterity !== null) {
		result.dodge = Math.floor(dexterity / 2);
	}

	return result;
}
