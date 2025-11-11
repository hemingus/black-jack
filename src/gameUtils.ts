import { type Card } from "./types";
    
    export function translateCardValue(value: string) {
            switch (value) {
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
        const values: number[] = [];
        const aces: string[] = [];
        cards.forEach(card => {
            if (card.value === "ACE") {
                aces.push(card.value);
            } else {
                values.push(Number(translateCardValue(card.value)))
            }
        })
        let sum = values.reduce((acc, curr) => {
            return acc + curr;
        }, 0);
        if (aces.length === 0) {
            return sum;
        }
        for (let i = 0; i < aces.length; i++) {
            if (sum <= 10) {
                sum += 11;
            } else {
                sum += 1;
            }
        }
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