import { 
  useState, 
  useEffect, 
  useCallback, 
  useContext, 
  useRef,
} from "react"
import {
  useAuthStore,
} from "../store.js"
import {
  StompContext,
  tfetch,
  doTry,
} from "../util.js"

export const Chat = ({chatId}) => {
  let [messages, setMessages] = useState([])
  let messageRef = useRef()
  let needsScroll = useRef(false)
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)

  useEffect(() => {
    stompClient.subscribe("/topic/chat/" + chatId, (m) => {
      let message = JSON.parse(m.body)
      needsScroll.current = isLastChildVisible(messageRef.current)
      setMessages(previous => {
        if (previous.length && previous[previous.length - 1].n === message.n) {
          return previous
        }
        return [...previous, message]
      })
    })

    doTry(async () => {
      let chat = await tfetch("/api/chat/" + chatId, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
      })
      setMessages(chat.messages || [])
    })
  }, [stompClient, auth, chatId])

  useEffect(() => {
    if (!needsScroll.current) {
      return
    }
    window.setTimeout(() => messageRef.current?.lastChild?.scrollIntoView({behavior: "smooth"}), 0)
  }, [messages])

  let onSendMessage = useCallback((event) => doTry(async () => {
    event.preventDefault()
    let data = new FormData(event.target)
    event.target.reset()
    stompClient.publish({
      destination: "/app/chat/send/",
      body: JSON.stringify({
        message: data.get("message"),
        id: chatId,
      }),
    })
  }), [stompClient, chatId])

  return <>
    <div
      className="grow border border-gray-500 bg-gray-900 rounded-lg flex flex-col overflow-y-hidden">
        <div className="px-1 flex-none h-14 overflow-y-scroll">
          <p>Radolf!</p>
          <p>Radolf!</p>
          <p>Radolf!</p>
          <p>Radolf!</p>
        </div>
      <div className="w-full flex-none h-[2px] bg-gray-500" />
      <div ref={messageRef} className="px-1 overflow-y-scroll">
        {messages.map(message => (
            <p key={message.n}>{message.user + ": " + message.message}</p>
        ))}
      </div>
    </div>
    <form className="flex-none mb-2" onSubmit={onSendMessage}>
      <input
        className="w-full rounded-lg p-2 border border-gray-500 bg-stone-800 text-stone-100"
        type="text"
        name="message"
      />
    </form>
  </>
}

function isLastChildVisible(container) {
  let lastChild = container.lastChild
  let lastChildTop = lastChild.offsetTop
  let containerTop = container.scrollTop + container.offsetTop
  let containerBottom = containerTop + container.clientHeight
  return lastChildTop < containerBottom
}
