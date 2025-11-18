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

    const [betAmount, setBetAmount] = useState<number>(0);
    const [playerMoney, setPlayerMoney] = useState<number>(500);
    const [showDown, setShowDown] = useState<boolean>(true);
    const [gameMessage, setGameMessage] = useState<string>("Welcome to the blackjack table!");

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
        if (betAmount > playerMoney) {
            setGameMessage(`Max bet is ${playerMoney}`);
            return
        }
        setPlayerMoney(prev => prev - betAmount);
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
        <div className="w-full flex flex-col justify-center items-center">            
            <div className="w-full flex items-center justify-center flex-col gap-2 bg-linear-to-r from-green-950 via-green-900 to-green-950 p-4 rounded-xl">
                <h2 className="text-emerald-300 text-2xl">{gameMessage}</h2>
                
                {dealerCards.length > 0 && 
                    <div>
                        <DealerCards cards={dealerCards} showDown={showDown}/>
                        <Sum title="Dealer" sum={showDown ? getCardSum(dealerCards) : getCardSum([dealerCards[0]])}/>
                    </div>
                }
                {gameState === "active" &&
                    <div className="flex gap-1">
                        <button className="bg-slate-900 text-white p-2 border-2 rounded-xl cursor-pointer" onClick={playerHit}>Hit</button>
                        <button className="bg-slate-900 text-white p-2 border-2 rounded-xl cursor-pointer" onClick={stand}>Stand</button>
                    </div>
                }
                {playerCards.length > 0 && 
                    <div>
                        <PlayerCards cards={playerCards}/>
                        <Sum title="Player" sum={getCardSum(playerCards)}/>
                    </div>
                }
            </div>
            {gameState === "not active" && 
                <div className="flex flex-col gap-2">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                        Bet amount:
                    </label>
                    <input
                        type="number"
                        className="
                            rounded-md bg-gray-800 border border-gray-700 
                            px-3 py-2 text-gray-100 
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                        "
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.valueAsNumber)}
                    />
                    <button className="bg-slate-900 text-white p-2 border-2 rounded-xl" onClick={startNewRound}>Start new round</button>
                </div>
            }
            <p>Money: <span className="text-green-500">{` ${playerMoney} €`}</span></p>
        </div>
    )
}