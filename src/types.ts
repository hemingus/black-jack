export type Card = {
    code: string,
    image: string,
    images: Object,
    value: string,
    suit: string
}

export type DeckResponse = {
    success: boolean,
    deck_id: string,
    remaining: number,
    shuffled: boolean
}