import { type Card } from "../types"

interface DealerCardsProps {
    cards: Array<Card>
}

export default function DealerCards({ cards }: DealerCardsProps ) {
    return (
        <div>
            <h3>Dealer Cards</h3>
            <div>
                {cards.map((card, index) => <img style={{width: "100px"}} key={card.code + index} src={card.image}/>)}
            </div>
        </div>
    )
}