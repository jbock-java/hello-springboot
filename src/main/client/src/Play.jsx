import {
  useEffect,
  useCallback,
  useContext,
  useRef,
} from "react"
import {
  useParams,
} from "react-router-dom"
import {
  twJoin,
} from "tailwind-merge"
import {
  isForbidden,
} from "./model/board.js"
import {
  StompContext,
  BLACK,
  TERRITORY,
  getColorClassName,
} from "./util.js"
import {
  Button,
} from "./component/Button.jsx"
import {
  IconContext,
} from "react-icons"
import {
  FaCircle,
} from "react-icons/fa"
import {
  useAuthStore,
  useGameStore,
} from "./store.js"

const gridTileClasses = "w-12 h-12 border-r border-b border-asch"
const tileClasses = "w-12 h-12 grid place-items-center"

export const Play = () => {
  let { gameId } = useParams()
  let stompClient = useContext(StompContext)
  let auth = useAuthStore(state => state.auth)
  let setGameState = useGameStore(state => state.setGameState)
  let black = useGameStore(state => state.black)
  let white = useGameStore(state => state.white)
  let { board, currentPlayer, counting } = useGameStore(state => state.gameState)
  let initialized = useRef()
  let opponent = auth.name === black.name ? white : black
  useEffect(() => {
    if (initialized.current) {
      return
    }
    initialized.current = true
    let sub1 = stompClient.subscribe("/topic/game/" + gameId, (message) => {
      let game = JSON.parse(message.body)
      setGameState(game)
    })
    stompClient.publish({
      destination: "/app/game/hello",
      body: JSON.stringify({
        id: gameId,
      }),
    })
    return () => {
      sub1.unsubscribe()
    }
  }, [setGameState, initialized, stompClient, auth, gameId])
  let onPass = useCallback(() => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        pass: true,
      }),
    })
  }, [stompClient, gameId])
  let onClick = useCallback(({ x, y }) => {
    stompClient.publish({
      destination: "/app/game/move",
      body: JSON.stringify({
        id: gameId,
        x: x,
        y: y,
      }),
    })
  }, [stompClient, gameId])
  if (!board) {
    return <div>Spieldaten werden geladen...</div>
  }
  return (
    <div className="mt-2 ml-4">
      <div className="relative w-full h-1">
        <div className="absolute bg-kirsch p-6">
          <div className="m-6 inline-grid grid-cols-8 border-l border-t border-asch">
          {
            Array.from({length: (board.length - 1) * (board.length - 1)}).map((_, index) => (
              <GridTile key={index} />
            ))
          }
          </div>
        </div>
        <div className="absolute z-5 left-6 top-6 inline-grid grid-cols-9">
          {
            board.map((row) => (
              row.map((groupInfo) => (
                <Tile
                  groupInfo={groupInfo}
                  key={groupInfo.ptId}
                  onClick={() => onClick(groupInfo)} />
              ))
            ))
          }
        </div>
      </div>
      <div className="fixed right-12 ml-4">
      <div>
        <Button
          onClick={onPass}
          disabled={counting || currentPlayer !== auth.name}>
          Pass
        </Button>
      </div>
      <div className="mt-2">
      {
        counting ? "" : (
        currentPlayer === auth.name ?
          "Jetzt bin ich dran" : 
          (opponent.name + " ist dran...")
        )
      }
      </div>
      </div>
    </div>
  )
}

function GridTile() {
  return <div className={gridTileClasses} />
}

function Tile({ groupInfo, onClick }) {
  let { counting } = useGameStore(state => state.gameState)
  let { color, hasStone } = groupInfo
  if (!hasStone) {
    return <EmptyTile groupInfo={groupInfo} onClick={onClick} />
  }
  if (counting) {
    return (
      <CountingTile groupInfo={groupInfo} onClick={onClick} />
    )
  }
  return (
    <div className={tileClasses}>
      <IconContext.Provider value={{ color: getColorClassName(color), size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function EmptyTile({ groupInfo, onClick }) {
  let { board, counting, currentPlayer, currentColor } = useGameStore(state => state.gameState)
  let auth = useAuthStore(state => state.auth)
  let setIsInCountingGroup = useGameStore(state => state.setIsInCountingGroup)
  let setNoCountingGroup = useCallback(() => {
    setIsInCountingGroup(undefined)
  }, [setIsInCountingGroup])
  let { color } = groupInfo
  if ((color & TERRITORY) !== 0) {
    return (
      <div onMouseEnter={setNoCountingGroup} className={tileClasses}>
        <IconContext.Provider value={{ color: getColorClassName(color), size: "1em" }}>
          <FaCircle />
        </IconContext.Provider>
      </div>
    )
  }
  if (counting || currentPlayer !== auth.name || isForbidden(board, groupInfo, currentColor)) {
      return <div onMouseEnter={setNoCountingGroup} className={tileClasses} />
  }
  let classes = twJoin(
    tileClasses,
    "cursor-pointer",
    "text-transparent",
    "opacity-25",
    currentColor === BLACK ? "hover:text-black" : "hover:text-white",
  )
  return (
    <div className={classes} onClick={onClick}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}

function CountingTile({ groupInfo, onClick }) {
  let { color, has, x, y } = groupInfo
  let isInCountingGroup = useGameStore(state => state.isInCountingGroup)
  let setIsInCountingGroup = useGameStore(state => state.setIsInCountingGroup)
  let setCountingGroup = useCallback(() => {
    setIsInCountingGroup(has)
  }, [has, setIsInCountingGroup])
  let classes = twJoin(
    tileClasses,
    "cursor-pointer",
    color === BLACK ? "text-black" : "text-white",
    isInCountingGroup && isInCountingGroup(x, y) && "opacity-25",
  )
  return (
    <div onMouseEnter={setCountingGroup} className={classes} onClick={onClick}>
      <IconContext.Provider value={{ size: "2.75em" }}>
        <FaCircle />
      </IconContext.Provider>
    </div>
  )
}
