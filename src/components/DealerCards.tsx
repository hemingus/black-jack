import { type Card } from "../types"
import { cardBackImageURL } from "../api/DeckOfCards"

interface DealerCardsProps {
    cards: Array<Card>
    showDown: boolean
}

export default function DealerCards({ cards, showDown }: DealerCardsProps ) {
    return (
        <div>
            <h3>Dealer Cards</h3>
            <div>
                {showDown ? 
                cards.map((card, index) => 
                    <img style={{width: "100px"}} key={card.code + index} src={card.image}/>)
                :
                cards.map((card, index) => {
                    if (index === 1) return <img key={card.code + index}style={{width: "100px"}} src={cardBackImageURL}/>
                    else return <img key={card.code + index} style={{width: "100px"}} src={card.image}/>
                })
                }
            </div>
        </div>
    )
}