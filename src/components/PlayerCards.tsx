import { useState, useEffect } from "react"
import { type Card } from "../types"

interface PlayerCardsProps {
    cards: Array<Card>
}

export default function PlayerCards({cards}: PlayerCardsProps) {
    const [cardSum, setCardSum] = useState(0);
    useEffect(() => {
        console.log(cards);
    }, []);
  
    return (
        <div className="player-cards">
            <h3>Player Cards</h3>
            <div className="card-container">
                {cards.map((card, index) => <img key={card.code + index} style={{width: "100px"}} src={card.image}/>)}
            </div>
        </div>
    )
}