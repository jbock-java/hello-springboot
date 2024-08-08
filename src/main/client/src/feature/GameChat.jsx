import { 
  useState, 
  useEffect, 
  useCallback, 
  useContext, 
  useRef,
} from "react"
import {
  useParams,
} from "react-router-dom"
import {
  useAuthStore,
} from "./../store.js"
import {
  StompContext,
  tfetch,
  doTry,
} from "./../util.js"

export const GameChat = () => {
  let [messages, setMessages] = useState([]);
  let divRef = useRef(null)

  let stompClient = useContext(StompContext)
  let { gameId } = useParams()
  let auth = useAuthStore(state => state.auth)

  useEffect(() => {
    stompClient.subscribe("/topic/chat/" + gameId, (message) => {
      let newMessage = JSON.parse(message.body)
      setMessages(previous => [...previous, newMessage])
    })

    doTry(async () => {
      let chat = await tfetch("/api/chat/" + gameId, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
      })
      setMessages(chat.messages || [])
    })
  }, [stompClient, auth, gameId])

  useEffect(() => {
    divRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages]);

  let onSendMessage = useCallback((event) => doTry(async () => {
    event.preventDefault()
    let data = new FormData(event.target)
    document.getElementById("sending").reset();
    stompClient.publish({
      destination: "/app/chat/send/",
      body: JSON.stringify({
        message: data.get("message"),
        id: gameId,
      }),
    })
  }), [ stompClient, gameId ])

  return (

    <div className="border border-gray-500 bg-gray-900 rounded-lg shadow relative my-1 mr-1">
      <div>
        <div className="max-h-80 h-80 px-2 py-1 overflow-auto">
          {messages.map(message => (
              <p>{message.user + ": " + message.message}</p>
          ))}
          <div ref={divRef} />
        </div>
      </div>
      <form className="px-2 py-1" id="sending" onSubmit={onSendMessage}>
        <input
          type="text"
          name="message"
        />
      </form>
    </div>
  );
}
