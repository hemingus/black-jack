import { useState, useEffect } from "react"
import { getNewDeck, drawCards, shuffleDeck } from "../api/DeckOfCards"
import { type Card, type GameState } from "../types";
import PlayerCards from "./PlayerCards";
import Sum from "./Sum";
import DealerCards from "./DealerCards";

export default function BlackJack() {
    const [loading, setLoading] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState>("active");
    const [deckId, setDeckId] = useState<string | null>(null);

    const [dealerCards, setDealerCards] = useState<Array<Card>>([]);
    const [dealerBust, setDealerBust] = useState<boolean>(false);
    const [playerCards, setPlayerCards] = useState<Array<Card>>([]);
    const [playerBust, setPlayerBust] = useState<boolean>(false);
    
    const [gameMessage, setGameMessage] = useState<string>("Hit or Stand ?");

    useEffect(() => {
        async function initDeck() {   
            setLoading(true) 
            try {
                const deck = await getNewDeck(5);
                setDeckId(deck.deck_id);          
            } catch (err) {
                console.error("Failed to initialize deck:", err);
            } finally {
                setLoading(false);
            }
        }
        initDeck();
    }, [])

    useEffect(() => {
        if (getCardSum(playerCards) > 21) {
            setGameMessage("Player bust... Dealer Wins!")
        } else if (getCardSum(dealerCards) > 21) {
            setGameMessage("Dealer bust... Player Wins!")
        }
    }, [playerCards, dealerCards])

    function shuffle() {
        setGameState("active");
        setGameMessage("Hit or Stand ?");
        if (deckId) {
            shuffleDeck(deckId);
            setPlayerCards([]);
            setDealerCards([]);
        }
    }

    async function playerHit() {
        if (deckId) {
            const data = await drawCards(deckId, 1);
            const card = data.cards[0];
            setPlayerCards(prev => [...prev, card]);
        }
    }

    async function dealerHit(dealerSum: number) {
        if (deckId) {
            const data = await drawCards(deckId, 1);
            const card = data.cards[0];
            setDealerCards(prev => [...prev, card]);
            dealerSum += Number(translateCardValue(card.value));
        }
        if (dealerSum < 17) {
            dealerHit(dealerSum);
        } else {
            determineWinner();
            setGameState("not active");
        }
    }

    function stand() {
        dealerHit(getCardSum(dealerCards));
        determineWinner();
    }

    function determineWinner() {
        if (playerBust) {
            return "Dealer Wins!"
        } else if (dealerBust) {
            return "Player Wins!"
        } else {
            if (getCardSum(playerCards) > getCardSum(dealerCards)) {
                return "Player Wins!"
            } else if (getCardSum(playerCards) < getCardSum(dealerCards)) {
                return "Dealer Wins!"
            } return "It's a tie!"
        }
    }

    function translateCardValue(value: string) {
        switch (value) {
            case "ACE":
                return "11";
            case "JACK":
                return "10";
            case "QUEEN":
                return "10";
            case "KING":
                return "10";
            default:
                return value;
        }
    }

    function getCardSum(cards: Array<Card>) {
        const values: number[] = []
        cards.forEach(card => {
            values.push(Number(translateCardValue(card.value)))
        })
        const sum = values.reduce((acc, current) => {
            return acc + current
        }, 0);
        return sum;
    }
    return (
        loading ? <p>loading...</p> :
        <div>
            {/* <button onClick={handleDealCards}>Get cards</button> */}            
            <div>
                <h2 style={{color: "gold"}}>{gameMessage}</h2>
                <DealerCards cards={dealerCards}/>
                <Sum title="Dealer" sum={getCardSum(dealerCards)}/>
                {gameState === "active" &&
                <>
                <button onClick={playerHit}>Hit</button>
                <button onClick={stand}>Stand</button>
                </>
                }
                {playerCards && <PlayerCards cards={playerCards}/>}
                <Sum title="Player" sum={getCardSum(playerCards)}/>
            </div>
            {gameState === "not active" && <button onClick={shuffle}>Start new game</button>}

        </div>
    )
}