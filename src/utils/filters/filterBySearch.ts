/**
 * Filtra uma lista de objetos comparando o termo de busca com campos definidos.
 *
 * @param data - Lista de objetos a ser filtrada
 * @param term - Termo de busca digitado
 * @param fields - Lista de campos do objeto onde será feita a busca
 * @returns Lista de objetos filtrados
 */
export function filterBySearch<T extends Record<string, unknown>>(
    data: T[],
    term: string,
    fields: (keyof T)[]
): T[] {
    const normalizedTerm = term.trim().toLowerCase();

    if (!normalizedTerm) return data;

    return data.filter((item) =>
        fields.some((field) => {
            const value = item[field];
            return (
                typeof value === "string" &&
                value.toLowerCase().includes(normalizedTerm)
            );
        })
    );
}
