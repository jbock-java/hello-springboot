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
} from "../../store.js"
import {
  StompContext,
  tfetch,
  doTry,
} from "../../util.js"

export const GameChat = () => {
  let [messages, setMessages] = useState([])
  let divRef = useRef()
  let messageRef = useRef()
  let needsScroll = useRef(false)
  let stompClient = useContext(StompContext)
  let {gameId} = useParams()
  let auth = useAuthStore(state => state.auth)

  useEffect(() => {
    stompClient.subscribe("/topic/chat/" + gameId, (m) => {
      let message = JSON.parse(m.body)
      let msg = messageRef.current
      needsScroll.current = msg.scrollHeight <= msg.scrollTop + msg.offsetHeight
      setMessages(previous => {
        if (previous.length && previous[previous.length - 1].n === message.n) {
          return previous
        }
        return [...previous, message]
      })
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
    if (!needsScroll.current) {
      return
    }
    window.setTimeout(() => divRef.current?.scrollIntoView({behavior: "smooth"}), 0)
  }, [messages])

  let onSendMessage = useCallback((event) => doTry(async () => {
    event.preventDefault()
    let data = new FormData(event.target)
    event.target.reset()
    stompClient.publish({
      destination: "/app/chat/send/",
      body: JSON.stringify({
        message: data.get("message"),
        id: gameId,
      }),
    })
  }), [stompClient, gameId])

  return <>
    <div ref={messageRef}
      className="grow border border-gray-500 bg-gray-900 rounded-lg p-1 overflow-y-scroll">
      {messages.map(message => (
          <p key={message.n}>{message.user + ": " + message.message}</p>
      ))}
      <div ref={divRef} />
    </div>
    <form className="flex-0 mb-2" onSubmit={onSendMessage}>
      <input
        className="w-full rounded-lg p-2 border border-gray-500 bg-stone-800 text-stone-100"
        type="text"
        name="message"
      />
    </form>
  </>
}
