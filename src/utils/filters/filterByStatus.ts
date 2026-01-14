export function filterByStatus<T extends { status: string }>(
    items: T[],
    selectedStatus: string
): T[] {
    if (selectedStatus === "Todos") return items;
    return items.filter((item) =>
        item.status.toUpperCase() === selectedStatus.toUpperCase()
    );
}
