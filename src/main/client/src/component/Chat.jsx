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
} from "src/util.js"

export const Chat = ({chatId}) => {
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
        className="w-full rounded-lg p-2 border border-gray-500 bg-stone-800 text-stone-100 focus:outline-none"
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

function SplitPane({messageRef, topElement, bottomElement}) {
  let [dragging, setDragging] = useState(false)
  let [splitPos, setSplitPos] = useState(200.5)
  let draggingRef = useRef()
  let containerRef = useRef()
  draggingRef.current = dragging
  useEffect(() => {
    let mousemove = (e) => {
      if (!draggingRef.current) {
        return
      }
      setSplitPos(getSplitPos(e.clientY, containerRef))
    }
    let mouseup = (e) => {
      if (!draggingRef.current) {
        return
      }
      setSplitPos(getSplitPos(e.clientY, containerRef))
      setDragging(false)
    }
    window.document.addEventListener("mousemove", mousemove)
    window.document.addEventListener("mouseup", mouseup)
    return () => {
      window.document.removeEventListener("mousemove", mousemove)
      window.document.removeEventListener("mouseup", mouseup)
    }
  }, [draggingRef, setDragging])
  let onMouseDown = useCallback((e) => {
    e.preventDefault()
    setSplitPos(getSplitPos(e.clientY, containerRef))
    setDragging(true)
  }, [setDragging, setSplitPos])
  let topElementHeight = Math.trunc(splitPos)
  if (containerRef.current) {
    let rect = containerRef.current.getBoundingClientRect()
    topElementHeight = Math.trunc(splitPos - rect.top)
  }
  return (
    <div
      ref={(ref) => {
        containerRef.current = ref
      }}
      className={twJoin(
        "grow border border-gray-500 bg-gray-900 rounded-lg flex flex-col overflow-y-hidden",
        dragging && "cursor-row-resize",
      )}>
      <div
        style={{height: topElementHeight + "px"}}
        className="px-1 pt-1 pb-2 flex-none overflow-y-scroll">
        {topElement}
      </div>
      <SplitBar
        containerRef={containerRef}
        splitPos={splitPos}
        dragging={dragging}
        onMouseDown={onMouseDown} />
      <div ref={messageRef} className="px-1 pt-3 pb-1 overflow-y-scroll">
        {bottomElement}
      </div>
    </div>
  )
}

function SplitBar({splitPos, dragging, onMouseDown, containerRef}) {
  let width = 100, left = 10 // some default values
  if (containerRef.current) {
    let container = containerRef.current
    let rect = containerRef.current.getBoundingClientRect()
    let parentRect = container.parentNode.getBoundingClientRect()
    width = rect.width
    left = rect.left - parentRect.left
  }
  return <>
    <div
      onMouseDown={dragging ? undefined : onMouseDown}
      style={{top: Math.trunc(splitPos - 1) + 0.5, width: width, left: left}}
      className="absolute h-[1px] bg-gray-500 z-20 cursor-row-resize" />
    <div
      onMouseDown={dragging ? undefined : onMouseDown}
      style={{top: Math.trunc(splitPos) + 0.5, width: width, left: left}}
      className="absolute h-[5px] bg-slate-800 z-20 cursor-row-resize" />
    <div
      onMouseDown={dragging ? undefined : onMouseDown}
      style={{top: Math.trunc(splitPos + 5) + 0.5, width: width, left: left}}
      className="absolute h-[1px] bg-gray-500 z-20 cursor-row-resize" />
  </>
}

function getSplitPos(clientY, containerRef) {
  let rect = containerRef.current.getBoundingClientRect()
  let result = clientY
  result = Math.max(rect.top + 40, result)
  result = Math.min(rect.top + rect.height - 40, result)
  return Math.trunc(result)
}
