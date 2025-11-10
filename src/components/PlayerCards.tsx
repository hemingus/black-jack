import { useEffect } from "react"
import { type Card } from "../types"

interface PlayerCardsProps {
    cards: Array<Card>
}

export default function PlayerCards({cards}: PlayerCardsProps) {
    useEffect(() => {
        console.log(cards);
    }, []);

    
    return (
        <div className="player-cards">
            <h2>Player Cards</h2>
            <div className="card-container">
                {cards.map(card => <img key={card.code} style={{width: "100px"}} src={card.image}/>)}
            </div>
        </div>
    )
}