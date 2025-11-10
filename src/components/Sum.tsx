interface SumProps {
    title: string
    sum: number
}

export default function Sum( { title, sum }: SumProps) {
    return <p>{`${title}: ${sum}`}</p>
}