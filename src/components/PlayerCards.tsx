import { type Card } from "../types"

interface PlayerCardsProps {
    cards: Array<Card>
}

export default function PlayerCards({cards}: PlayerCardsProps) {
    return (
        <div className="player-cards">
            <h3 className="text-orange-200">Player Cards</h3>
            <div className="flex flex-row gap-1 flex-wrap">
                {cards.map((card, index) => <img key={card.code + index} style={{width: "100px"}} src={card.image}/>)}
            </div>
        </div>
    )
}