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
            setPlayerBust(true);
        } else if (getCardSum(dealerCards) > 21) {
            setDealerBust(true);
        }
    }, [playerCards, dealerCards])

    useEffect(() => {
        if (gameState === "active") {
            determineWinner();
        }
    }, [playerBust, dealerBust])

    function startNewRound() {
        setPlayerBust(false);
        setDealerBust(false);
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
            await dealerHit(dealerSum);
        } else if (dealerSum > 21) {
            setDealerBust(true);
        }
    }

    async function stand() {
        await dealerHit(getCardSum(dealerCards));
        determineWinner();
        setGameState("not active");
    }

    function determineWinner() {
        console.log(`DealerSUM: ${getCardSum(dealerCards)}`)
        if (playerBust) {
            setGameMessage("Player bust... Dealer Wins!");
        } else if (dealerBust) {
            setGameMessage("Dealer bust... Player Wins!");
        } else {
            if (getCardSum(playerCards) > getCardSum(dealerCards)) {
                setGameMessage("Player Wins!");
            } else if (getCardSum(playerCards) < getCardSum(dealerCards)) {
                setGameMessage("Dealer Wins!");
            } else setGameMessage("It's a tie!");
        }
        setGameState("not active");
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