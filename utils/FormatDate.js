export function FormatDate(unformattedDate) {
	const date = new Date(unformattedDate)
	const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
	const day = String(date.getDate()).padStart(2, '0');
	const year = date.getFullYear();
	return `${month}-${day}-${year}`;	
}