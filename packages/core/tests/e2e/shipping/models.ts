export type Item = {
    id: string;
    weight: number;
}

export type ClassifiedItem = Item & { agency: string };