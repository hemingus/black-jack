import './App.css'
import BlackJack from './components/BlackJack'

function App() {

  return (
    <div className="flex flex-col justify-center items-center bg-indigo-950 w-[clamp(300px,90vw,1000px)] p-4 rounded-2xl">
      <h1 className= "text-sky-600 text-4xl p-2">Black Jack</h1>
      <BlackJack />
    </div>
  )
}

export default App
