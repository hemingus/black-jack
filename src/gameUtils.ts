import { type Card } from "./types";
    
    export function translateCardValue(value: string) {
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
    
    export function getCardSum(cards: Array<Card>) {
        const values: number[] = []
        cards.forEach(card => {
            values.push(Number(translateCardValue(card.value)))
        })
        const sum = values.reduce((acc, current) => {
            return acc + current
        }, 0);
        return sum;
    }

    export function determineWinner(playerBust: boolean, dealerBust: boolean, playerCards: Array<Card>, dealerCards: Array<Card>) {
        if (playerBust) {
            return "Player bust... Dealer Wins!"
        } else if (dealerBust) {
            return "Dealer bust... Player Wins!"
        } else {
            if (getCardSum(playerCards) > getCardSum(dealerCards)) {
                return "Player Wins!"
            } else if (getCardSum(playerCards) < getCardSum(dealerCards)) {
                return "Dealer Wins!"
            } return "It's a tie!"
        }
    }