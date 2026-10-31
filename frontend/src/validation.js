export const NAME_MAX_LENGTH = 100;
export const CLASS_NAME_MAX_LENGTH = 100;
export const RACE_MAX_LENGTH = 100;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 20;

export function validateCharacter({ name, class_name, race, level }) {
	const errors = {};
	const trimmedName = name.trim();
	const trimmedClassName = class_name.trim();
	const trimmedRace = race.trim();
	const numericLevel = Number(level);

	if (!trimmedName) {
		errors.name = "O nome é obrigatório.";
	} else if (trimmedName.length > NAME_MAX_LENGTH) {
		errors.name = `O nome deve ter no máximo ${NAME_MAX_LENGTH} caracteres.`;
	}

	if (!trimmedClassName) {
		errors.class_name = "A classe é obrigatória.";
	} else if (trimmedClassName.length > CLASS_NAME_MAX_LENGTH) {
		errors.class_name = `A classe deve ter no máximo ${CLASS_NAME_MAX_LENGTH} caracteres.`;
	}

	if (!trimmedRace) {
		errors.race = "A raça é obrigatória.";
	} else if (trimmedRace.length > RACE_MAX_LENGTH) {
		errors.race = `A raça deve ter no máximo ${RACE_MAX_LENGTH} caracteres.`;
	}

	if (
		level === "" ||
		level === null ||
		level === undefined ||
		!Number.isInteger(numericLevel) ||
		numericLevel < MIN_LEVEL ||
		numericLevel > MAX_LEVEL
	) {
		errors.level = `O nível deve ser um número inteiro entre ${MIN_LEVEL} e ${MAX_LEVEL}.`;
	}

	return {
		errors,
		values: {
			name: trimmedName,
			class_name: trimmedClassName,
			race: trimmedRace,
			level: numericLevel,
		},
	};
}
