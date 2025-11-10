import { useState, useEffect } from "react"
import { getNewDeck, drawCards, shuffleDeck } from "../api/DeckOfCards"
import { translateCardValue, getCardSum } from "../gameUtils";
import { type Card, type GameState } from "../types";
import PlayerCards from "./PlayerCards";
import Sum from "./Sum";
import DealerCards from "./DealerCards";

export default function BlackJack() {
    const [loading, setLoading] = useState<boolean>(false);
    const [gameState, setGameState] = useState<GameState>("not active");
    const [deckId, setDeckId] = useState<string | null>(null);

    const [dealerCards, setDealerCards] = useState<Array<Card>>([]);
    const [playerCards, setPlayerCards] = useState<Array<Card>>([]);
    
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

    function startNewRound() {
        setGameState("active");
        setGameMessage("Hit or Stand ?");
        shuffle();
    }
    function shuffle() {
        if (deckId) {
            shuffleDeck(deckId);
            setPlayerCards([]);
            setDealerCards([]);
        }
    }

    async function playerHit() {
        if (!deckId) return;
        const data = await drawCards(deckId, 1);
        const card = data.cards[0];
        setPlayerCards(prev => {
            const newHand = [...prev, card];
            const sum = getCardSum(newHand);
            if (sum > 21) {
                setGameMessage("Player bust - Dealer Wins!");
                setGameState("not active");
            }
            return newHand;
        });
    }

    async function dealerHit() {
        if (!deckId) return 
        let dealerHand = [...dealerCards];
        let dealerSum = getCardSum(dealerHand);
        while (dealerSum < 17){
            const data = await drawCards(deckId, 1);
            const card = data.cards[0];
            dealerHand.push(card);
            dealerSum += Number(translateCardValue(card.value));
        }
        if (dealerSum > 21) {
            setDealerCards(dealerHand)
            setGameMessage("Dealer bust - Player Wins!");
            setGameState("not active");
        } else {
        setDealerCards(dealerHand);
        setGameMessage(determineWinner(dealerSum));
        setGameState("not active");
        }
    }

    async function stand() {
        await dealerHit();
    }

    function determineWinner(dealerSum: number) {
        const playerSum = getCardSum(playerCards);
        if (dealerSum > playerSum) return "Dealer wins!";
        else if (dealerSum < playerSum) return "Player wins!";
        return "It's a tie!";
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
            {gameState === "not active" && <button onClick={startNewRound}>Start new round</button>}
        </div>
    )
}