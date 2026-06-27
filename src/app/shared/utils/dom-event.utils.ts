export function readInputValue(event: Event): string | null {
	const element = event.target;
	return element instanceof HTMLInputElement ? element.value : null;
}

export function readCheckedValue(event: Event): boolean | null {
	const element = event.target;
	return element instanceof HTMLInputElement ? element.checked : null;
}

export function readSelectValue(event: Event): string | null {
	const element = event.target;
	return element instanceof HTMLSelectElement ? element.value : null;
}