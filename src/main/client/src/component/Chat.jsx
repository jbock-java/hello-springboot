import { 
  useState, 
  useEffect, 
  useCallback, 
  useContext, 
  useRef,
} from "react"
import {
  twJoin,
} from "tailwind-merge"
import {
  useAuthStore,
} from "src/store.js"
import {
  StompContext,
  tfetch,
  doTry,
  getRemInPixel,
} from "src/util.js"

export const Chat = ({chatId, className}) => {
  let [messages, setMessages] = useState([])
  let [users, setUsers] = useState([])
  let messageRef = useRef()
  let needsScroll = useRef(false)
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)

  useEffect(() => {
    let sub1 = stompClient.subscribe("/topic/users/" + chatId, (message) => {
      let r = JSON.parse(message.body)
      setUsers(r.users)
    })
    let sub2 = stompClient.subscribe("/topic/chat/" + chatId, (m) => {
      let message = JSON.parse(m.body)
      needsScroll.current = isLastChildVisible(messageRef.current)
      setMessages(previous => {
        if (previous.length && previous[previous.length - 1].n === message.n) {
          return previous
        }
        return [...previous, message]
      })
    })
    let intervalId = setInterval(() => {
      stompClient.publish({
        destination: "/app/chat/status",
        body: JSON.stringify({
          room: chatId,
        }),
      })
    }, 30 * 1000)

    doTry(async () => {
      let chat = await tfetch("/api/chat/" + chatId, {
        method: "GET",
        headers: {
          "Authorization": "Bearer " + auth.token,
          "Content-Type": "application/json",
        },
      })
      setMessages(chat.messages || [])
      setUsers(chat.users || [])
    })
    return () => {
      sub1.unsubscribe()
      sub2.unsubscribe()
      clearInterval(intervalId)
    }
  }, [stompClient, auth, chatId])

  useEffect(() => {
    if (!needsScroll.current) {
      return
    }
    window.setTimeout(() => {
      if (!messageRef.current) {
        return
      }
      let lastChild = messageRef.current.lastChild
      if (!lastChild) {
        return
      }
      lastChild.scrollIntoView({behavior: "smooth"})
    }, 0)
  }, [messages])

  let onSendMessage = useCallback((event) => doTry(async () => {
    event.preventDefault()
    let data = new FormData(event.target)
    event.target.reset()
    stompClient.publish({
      destination: "/app/chat/send",
      body: JSON.stringify({
        message: data.get("message"),
        id: chatId,
      }),
    })
  }), [stompClient, chatId])

  return <>
    <SplitPane
      className={className}
      messageRef={messageRef}
      topElement={<>
        {users.map(user => (
          <p key={user}>{user}</p>
        ))}
      </>}
      bottomElement={<>
        {messages.map(message => (
            <p key={message.n}>{message.user + ": " + message.message}</p>
        ))}
      </>}
    />
    <form className="flex-none mb-2" onSubmit={onSendMessage}>
      <input
        className="w-full px-1 py-1 border border-gray-500 bg-stone-800 text-stone-100 focus:outline-none"
        type="text"
        name="message"
      />
    </form>
  </>
}

function isLastChildVisible(container) {
  let lastChild = container.lastChild
  if (!lastChild) {
    return false
  }
  let lastChildTop = lastChild.offsetTop
  let containerTop = container.scrollTop + container.offsetTop
  let containerBottom = containerTop + container.clientHeight
  return lastChildTop < containerBottom
}

function SplitPane({className, messageRef, topElement, bottomElement}) {
  let [dragOffset, setDragOffset] = useState(Number.NaN)
  let [splitPos, setSplitPos] = useState(60)
  let splitPosRef = useRef()
  splitPosRef.current = splitPos
  let containerRef = useRef()

  useEffect(() => {
    let onMouseMove = (e) => {
      if (Number.isNaN(dragOffset)) {
        return
      }
      setSplitPos(e.clientY + dragOffset)
    }
    let onMouseUp = () => setDragOffset(Number.NaN)
    window.document.addEventListener("mousemove", onMouseMove)
    window.document.addEventListener("mouseup", onMouseUp)
    return () => {
      window.document.removeEventListener("mousemove", onMouseMove)
      window.document.removeEventListener("mouseup", onMouseUp)
    }
  }, [dragOffset, setDragOffset])

  let onMouseDown = useCallback((e) => {
    e.preventDefault()
    setDragOffset(splitPosRef.current - e.clientY)
  }, [setDragOffset])

  return (
    <div
      ref={containerRef}
      className={twJoin(
        "grow flex flex-col overflow-hidden",
        !Number.isNaN(dragOffset) && "cursor-row-resize",
        className,
      )}>
      <div
        style={{height: getTopHeight(splitPos, containerRef.current)}}
        className="p-1 bg-gray-900 border border-gray-500 flex-none overflow-x-hidden overflow-y-scroll">
        {topElement}
      </div>
      <SplitBar
        container={containerRef.current}
        dragOffset={dragOffset}
        onMouseDown={onMouseDown} />
      <div ref={messageRef} className="p-1 bg-gray-900 border-t border-x border-gray-500 h-full overflow-x-hidden overflow-y-scroll">
        {bottomElement}
      </div>
    </div>
  )
}

function SplitBar({dragOffset, onMouseDown, container}) {
  if (!container) {
    return <div />
  }
  let rect = container.getBoundingClientRect()
  let parentRect = container.offsetParent.getBoundingClientRect()
  return (
    <div
      onMouseDown={Number.isNaN(dragOffset) ? onMouseDown : undefined}
      style={{
        height: Math.trunc(getRemInPixel() * 0.5) + 2,
        width: rect.width,
        left: rect.left - parentRect.left,
      }}
      className="flex-none cursor-row-resize bg-transparent" />
  )
}

function getTopHeight(splitPos, container) {
  if (!container) {
    return Math.trunc(splitPos)
  }
  let rect = container.getBoundingClientRect()
  let safety = 1 * getRemInPixel()
  let result = Math.max(safety, splitPos)
  result = Math.min(rect.height - safety - Math.trunc(getRemInPixel() * 0.5) - 2, result)
  return Math.trunc(result)
}
