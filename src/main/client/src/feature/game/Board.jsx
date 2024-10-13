import {
  twJoin,
} from "tailwind-merge"
import {
  useEffect,
  useCallback,
  useState,
  useContext,
  useRef,
} from "react"
import {
  Howl,
} from "howler"
import {
  base,
  StompContext,
} from "src/util.js"
import {
  useAuthStore,
  useMuteStore,
} from "src/store.js"
import {
  useLayoutStore,
} from "src/layout.js"
import {
  paintShadow,
  paintGrid,
  paintBoardDecorations,
  paintStones,
  paintStonesCounting,
  paintLastMove,
  paintNumber,
  paintMoveNumbers,
} from "./paint.js"
import {
  currentPlayer,
  isSelfPlay,
  currentColor,
  gameHasEnded,
  addMove,
  isKibitz,
  isReviewing,
  isCounting,
  teleport,
} from "./state.js"

export function Board({
    gameState,
    setGameState,
    cursor_x,
    setCursor_x,
    cursor_y,
    setCursor_y,
    context,
    resetCountdown,
    timeRemaining,
  }) {
  let stompClient = useContext(StompContext)
  let [ctrlKeyDown, setCtrlKeyDown] = useState(false)
  let auth = useAuthStore(state => state.auth)
  let lastMove = gameState.lastMove
  let myColor = gameState.myColor
  let counting = isCounting(gameState)
  let board = gameState.board
  let [forbidden_x, forbidden_y] = gameState.forbidden
  let dragging = useLayoutStore(state => state.dragging)
  let muted = useMuteStore(state => state.muted)
  let howler = useRef({})
  let end = gameHasEnded(gameState)
  let showMoveNumbers = ctrlKeyDown && (isKibitz(gameState, auth) || end)
  let howlerActive = useRef(false)

  let playSound = useCallback(({file, volume}) => {
    if (!howlerActive.current) {
      return
    }
    if (muted) {
      return
    }
    if (!howler.current[file]) {
      howler.current[file] = new Howl({
        src: [base + "/" + file + ".wav"],
        volume: volume,
      })
    }
    return howler.current[file].play()
  }, [howler, muted])

  useEffect(() => {
    if (!end && !counting && timeRemaining >= 1 && timeRemaining <= 9) {
      playSound({file: "" + timeRemaining, volume: 1})
    }
  }, [playSound, timeRemaining, end, counting])

  useEffect(() => {
    let onKeyDown = (e) => {
      let activeElement = window.document.activeElement
      if (e.shiftKey && activeElement?.id === "chat-input") {
        return
      }
      if (e.ctrlKey || e.shiftKey) {
        setCtrlKeyDown(true)
      }
    }
    let onKeyUp = (e) => {
      if (!e.shiftKey && !e.shiftKey) {
        setCtrlKeyDown(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [setCtrlKeyDown])

  let isCursorInBounds = useCallback(() => {
    let dim = board.length
    let x = context.cursorXref.current
    let y = context.cursorYref.current
    return x >= 0 && x < dim && y >= 0 && y < dim
  }, [context.cursorXref, context.cursorYref, board.length])

  let getCountingGroup = useCallback(() => {
    if (end || !counting) {
      return undefined
    }
    if (!isCursorInBounds()) {
      return undefined
    }
    let x = context.cursorXref.current
    let y = context.cursorYref.current
    let {has, hasStone} = board[y][x]
    if (!hasStone) {
      return undefined
    }
    return has
  }, [context, counting, board, isCursorInBounds, end])

  useEffect(() => {
    if (!context.canvasRef.current) {
      return
    }
    if (!showMoveNumbers && !counting && !end) {
      paintLastMove(context, lastMove, timeRemaining)
    }
  }, [showMoveNumbers, context, lastMove, timeRemaining, counting, end])

  let onMouseMove = useCallback((e) => {
    if (dragging) {
      return
    }
    if (!context.canvasRef.current) {
      return
    }
    let dim = board.length
    setCtrlKeyDown(e.shiftKey || e.ctrlKey)
    let cursor_x = Math.round((e.nativeEvent.offsetX - context.margin) / context.step)
    let cursor_y = Math.round((e.nativeEvent.offsetY - context.margin) / context.step)
    if (cursor_x >= 0 && cursor_x < dim && cursor_y >= 0 && cursor_y < dim) {
      setCursor_x(cursor_x + 0)
      setCursor_y(cursor_y + 0)
    } else {
      setCursor_x(-1)
      setCursor_y(-1)
    }
  }, [context, setCursor_x, setCursor_y, board.length, dragging])

  let onClick = useCallback(() => {
    howlerActive.current = true
    if (!context.canvasRef.current) {
      return
    }
    let cursor_x = context.cursorXref.current
    let cursor_y = context.cursorYref.current
    if (showMoveNumbers) {
      let historyEntry = board[cursor_y][cursor_x].historyEntry
      if (historyEntry.n !== -1) {
        setGameState(teleport(gameState, historyEntry.n + 1))
      }
      return
    }
    if (end) {
      return
    }
    if (!isCursorInBounds()) {
      return
    }
    if (counting) {
      if (!board[cursor_y][cursor_x].hasStone) {
        return
      }
    } else {
      if (board[cursor_y][cursor_x].isForbidden(currentColor(gameState))) {
        return
      }
      if (cursor_x == forbidden_x && cursor_y == forbidden_y) {
        return
      }
      if (currentPlayer(gameState) !== auth.name) {
        return
      }
    }
    let move = {
      x: cursor_x,
      y: cursor_y,
    }
    if (!isSelfPlay(gameState)) { // can't add early in self play; myColor is 0
      // early add move
      setGameState(addMove(gameState, {
        ...move,
        color: myColor,
        n: gameState.moves.length,
      }))
    }
    resetCountdown()
    playSound({file: "stone1", volume: 0.04})
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify(move),
    })
  }, [context, gameState, setGameState, auth, board, stompClient, counting, forbidden_x, forbidden_y, myColor, playSound, isCursorInBounds, showMoveNumbers, resetCountdown, end])

  useEffect(() => {
    if (!context.canvasRef.current) {
      return
    }
    paintBoardDecorations(context)
  }, [context, board.length])

  useEffect(() => {
    if (!context.canvasRef.current) {
      return
    }
    paintGrid(context)
    if (counting && !showMoveNumbers && !isReviewing(gameState)) {
      paintStonesCounting(context, board, getCountingGroup())
      return
    }
    paintStones(context, board, showMoveNumbers)
    if (showMoveNumbers) {
      paintMoveNumbers(context, board)
    } else if (!counting && !end) {
      paintLastMove(context, lastMove, timeRemaining)
    } else if (lastMove && !lastMove.action) {
      let bold = !isReviewing(gameState)
      paintNumber(context, lastMove.x, lastMove.y, lastMove.n + 1, lastMove.color, bold)
    }
    if (currentPlayer(gameState) !== auth.name) {
      return
    }
    if (!isCursorInBounds()) {
      return
    }
    if (board[cursor_y][cursor_x].hasStone) {
      return
    }
    if (board[cursor_y][cursor_x].isForbidden(currentColor(gameState))) {
      return
    }
    if (cursor_x === forbidden_x && cursor_y === forbidden_y) {
      return
    }
    if (!showMoveNumbers && !counting && !end) {
      paintShadow(context, cursor_x, cursor_y, currentColor(gameState))
    }
  }, [gameState, timeRemaining, context, cursor_x, cursor_y, ctrlKeyDown, auth, board, counting, forbidden_x, forbidden_y, lastMove, isCursorInBounds, getCountingGroup, showMoveNumbers, end])

  return (
    <div className="grid h-full">
      <canvas className={twJoin(
          "place-self-center",
          isCursorInBounds() && showMoveNumbers && board[cursor_y][cursor_x].historyEntry.n !== -1 && "cursor-pointer",
        )}
        ref={context.canvasRef}
        onMouseLeave={() => {
          setCursor_x(-1)
          setCursor_y(-1)
        }}
        onMouseMove={onMouseMove}
        onClick={onClick}
        width={context.width} height={context.width}>
      </canvas>
    </div>
  )
}
