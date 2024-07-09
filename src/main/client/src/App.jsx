import {
  useEffect,
  useState,
} from "react"

export const App = () => {
  let [ data, setData ] = useState("")
  useEffect(() => {
    let timer = setInterval(async () => {
      let d = await fetchAsync("/app/data")
      setData(d)
    }, 2000)
    return () => clearInterval(timer)
  })
  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">{data}</h1>
    </div>
  )
}

async function fetchAsync (url) {
  let response = await fetch(url)
  let data = await response.json()
  return data;
}
