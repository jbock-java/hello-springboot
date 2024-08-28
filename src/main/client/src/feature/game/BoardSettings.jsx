import {
  IconContext,
} from "react-icons"
import {
  FaVolumeMute,
  FaVolumeUp,
  FaSearchPlus,
  FaSearchMinus,
} from "react-icons/fa"
import {
  useMuteStore,
} from "src/store.js"
import {
  useViewStateStore,
} from "src/layout.js"

export function BoardSettings() {
  return (
    <div className="absolute pl-2 pt-1 flex flex-col items-center">
      <MuteIcon />
      <Zoom />
    </div>
  )
}

function MuteIcon() {
  let toggleMuted = useMuteStore((state) => state.toggleMuted)
  let muted = useMuteStore(state => state.muted)
  return (
    <button onClick={toggleMuted}>
      <IconContext.Provider value={{
        size: "1.5em",
      }}>
        {muted ? <FaVolumeMute /> : <FaVolumeUp />}
      </IconContext.Provider>
    </button>
  )
}

function Zoom() {
  let zoom = useViewStateStore(state => state.zoom)
  let setZoom = useViewStateStore(state => state.setZoom)
  return (
    <>
      <button
        className="mt-[0.25rem]"
        onClick={() => setZoom(zoom + 1)}>
        <IconContext.Provider value={{
          size: "1.5em",
        }}>
          <FaSearchPlus />
        </IconContext.Provider>
      </button>
      <button onClick={() => setZoom(0)}>
        <span className="text-2xl">{Math.trunc(zoom)}</span>
      </button>
      <button
        className="mt-[0.125rem]"
        onClick={() => setZoom(zoom - 1)}>
        <IconContext.Provider value={{
          size: "1.5em",
        }}>
          <FaSearchMinus />
        </IconContext.Provider>
      </button>
    </>
  )
}
