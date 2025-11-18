import { useState, useEffect } from "react"
import { getNewDeck, drawCards, shuffleDeck } from "../api/DeckOfCards"
import { getCardSum } from "../gameUtils";
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
    const [showDown, setShowDown] = useState<boolean>(true);
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

    async function startNewRound() {
        setShowDown(false);
        setGameState("active");
        setGameMessage("Hit or Stand ?");
        await shuffle()
            .then(async () => await dealNewHands());
    }
    async function shuffle() {
        if (deckId) {
            await shuffleDeck(deckId);
        }
    }

    function resolveRound() {
        setShowDown(true);
        setGameState("not active");
    }

    function checkBlackJack(playerHand: Card[], dealerHand: Card[]) {
        const playerSum: number = getCardSum(playerHand);
        const dealerSum: number = getCardSum(dealerHand);
        if (playerSum === 21 || dealerSum === 21) {
            resolveRound();
        }
        if (playerSum === 21 && dealerSum === 21) {
            setGameMessage("Double BlackJack! - It's a tie!");
        } else if (playerSum === 21) {
            setGameMessage("BlackJack! - Player Wins!");
        } else if (dealerSum === 21) {
            setGameMessage("Dealer has BlackJack! - Dealer Wins!");
        }
    }

    async function dealNewHands() {
        if (deckId) {
            const playerDraw = await drawCards(deckId, 2);
            const dealerDraw = await drawCards(deckId, 2);
            checkBlackJack(playerDraw.cards, dealerDraw.cards);
            setPlayerCards(playerDraw.cards);
            setDealerCards(dealerDraw.cards);
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
        setShowDown(true);
        if (!deckId) return 
        let dealerHand = [...dealerCards];
        let dealerSum = getCardSum(dealerHand);
        while (dealerSum < 17){
            const data = await drawCards(deckId, 1);
            const card = data.cards[0];
            dealerHand.push(card);
            dealerSum = getCardSum(dealerHand);
        }
        if (dealerSum > 21) {
            setDealerCards(dealerHand)
            setGameMessage("Dealer bust - Player Wins!");
            setGameState("not active");
        } else {
        setDealerCards(dealerHand);
        setGameMessage(determineWinner(dealerSum));
        }
        resolveRound();
    }

    async function stand() {
        await dealerHit();
    }

    function determineWinner(dealerSum: number) {
        const playerSum = getCardSum(playerCards);
        console.log(`dealer sum: ${dealerSum}, player sum: ${playerSum}`);
        
        if (dealerSum > playerSum) return "Dealer wins!";
        else if (dealerSum < playerSum) return "Player wins!";
        return "It's a tie!";
    }

    return (
        loading ? <p>loading...</p> :
        <div>
            {/* <button onClick={handleDealCards}>Get cards</button> */}            
            <div className="flex-col bg-slate-700">
                <h2 style={{color: "orange"}}>{gameMessage}</h2>
                <DealerCards cards={dealerCards} showDown={showDown}/>
                {dealerCards.length > 0 && <Sum title="Dealer" sum={showDown ? getCardSum(dealerCards) : getCardSum([dealerCards[0]])}/>}
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