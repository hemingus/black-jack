import { useState, useEffect } from "react"
import { getNewDeck, drawCards, shuffleDeck } from "../api/DeckOfCards"
import { type Card } from "../types";
import PlayerCards from "./PlayerCards";

export default function BlackJack() {
    const [deckId, setDeckId] = useState<string | null>(null);
    const [playerCards, setPlayerCards] = useState<Array<Card>>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        async function initDeck() {   
            setLoading(true) 
            try {
                const deck = await getNewDeck(5); // <-- get deck data
                setDeckId(deck.deck_id);          // <-- save the ID in state
            } catch (err) {
                console.error("Failed to initialize deck:", err);
            } finally {
                setLoading(false);
            }
        }
        initDeck();
    }, [])

    async function handleDealCards() {
        if (deckId) {
            const data = await drawCards(deckId, 5);
            const cards = data.cards;
            setPlayerCards(cards);
        } 
    }

    function shuffle() {
        if (deckId) {
            shuffleDeck(deckId);
        }
    }
    return (
        loading ? <p>loading...</p> :
        <div>
            <button onClick={handleDealCards}>Get cards</button>
            <button onClick={shuffle}>Shuffle deck</button>
            {playerCards && <PlayerCards cards={playerCards}/>}
        </div>
    )

}