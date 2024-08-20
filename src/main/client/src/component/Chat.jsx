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
  useGameTicker,
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
  let [initialized, setInitialized] = useState(false)
  let [dragOffset, setDragOffset] = useState(Number.NaN)
  let [splitPos, setSplitPos] = useState(60)
  let splitPosRef = useRef()
  splitPosRef.current = splitPos
  let containerRef = useRef()
  let gameTicker = useGameTicker(state => state.gameTicker)

  // re-render after each move: sidebar layout may have changed
  useEffect(() => {
    let container = containerRef.current
    if (initialized && container) {
      setTimeout(() => {
        let pos = getSplitPos(splitPosRef.current, container)
        setSplitPos(pos)
      }, 0)
    }
  }, [gameTicker, initialized])

  useEffect(() => {
    let onMouseMove = (e) => {
      if (Number.isNaN(dragOffset)) {
        return
      }
      setSplitPos(getSplitPos(e.clientY + dragOffset, containerRef.current))
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

  let topElementHeight = Math.trunc(splitPos)
  if (containerRef.current) {
    let rect = containerRef.current.getBoundingClientRect()
    topElementHeight = Math.trunc(getSplitPos(splitPos, containerRef.current) - rect.top)
  }

  return (
    <div
      ref={(ref) => {
        if (!ref) {
          return
        }
        if (!containerRef.current) {
          let rect = ref.getBoundingClientRect()
          let pos = getSplitPos(rect.top + 60, ref)
          setSplitPos(pos)
          splitPosRef.current = pos
          setInitialized(true)
        }
        containerRef.current = ref
      }}
      className={twJoin(
        "grow flex flex-col gap-y-2 overflow-y-hidden",
        !Number.isNaN(dragOffset) && "cursor-row-resize",
        className,
      )}>
      <div
        style={{height: topElementHeight + "px"}}
        className="p-1 bg-gray-900 border border-gray-500 flex-none overflow-y-scroll">
        {topElement}
      </div>
      <SplitBar
        container={containerRef.current}
        splitPos={splitPos}
        dragOffset={dragOffset}
        onMouseDown={onMouseDown} />
      <div ref={messageRef} className="p-1 bg-gray-900 border-t border-x border-gray-500 h-full overflow-y-scroll">
        {bottomElement}
      </div>
    </div>
  )
}

function SplitBar({splitPos, dragOffset, onMouseDown, container}) {
  if (!container) {
    return <div />
  }
  let rect = container.getBoundingClientRect()
  let parentRect = container.offsetParent.getBoundingClientRect()
  return (
    <div
      onMouseDown={Number.isNaN(dragOffset) ? onMouseDown : undefined}
      style={{
        top: Math.trunc(getSplitPos(splitPos, container)) - 1,
        height: Math.trunc(getRemInPixel() * 0.5) + 2,
        width: rect.width,
        left: rect.left - parentRect.left,
      }}
      className="absolute z-20 cursor-row-resize bg-transparent" />
  )
}

function getSplitPos(clientY, container) {
  if (!container) {
    return Math.trunc(clientY)
  }
  let rect = container.getBoundingClientRect()
  let safety = 1 * getRemInPixel()
  let result = Math.max(rect.top + safety, clientY)
  result = Math.min(rect.bottom - safety - 5, result)
  return Math.trunc(result)
}
