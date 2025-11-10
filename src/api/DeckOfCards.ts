import { type DeckResponse } from "../types";

const BASE_URL =  "https://deckofcardsapi.com/api/deck"

export async function getNewDeck(deckCount: number) {
    try {
        const res = await fetch(`${BASE_URL}/new/shuffle/?deck_count=${deckCount}`);
        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }
        const data: DeckResponse = await res.json();
        console.log(data);
        return data;
    }
    catch (err) {
        console.error("Network or HTTP problem:", err);
        throw err;
    }  
}

export async function drawCards(deckId: string, cardCount: number) {
    try {
        const res = await fetch(`${BASE_URL}/${deckId}/draw/?count=${cardCount}`);
        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }
        const data = await res.json();
        console.log(data);
        return data
    }
    catch (err) {
        console.error("Network or HTTP problem:", err);
        throw err;
    }
}

export async function shuffleDeck(deckId: string) {
    try {
        const res = await fetch(`${BASE_URL}/${deckId}/shuffle/`);
        if (!res.ok) {
            throw new Error(`HTTP error: ${res.status}`);
        }
        const data: DeckResponse = await res.json();
        console.log(data);
        return data;
    }
    catch (err) {
        console.error("Network or HTTP problem:", err);
        throw err;
    }  
}