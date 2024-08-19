import {
  useRef,
  useEffect,
  useCallback,
} from "react"
import {
  vw,
  sanitizeSidebarWidth,
  getRemInPixel,
} from "src/util.js"
import {
  useLayoutStore,
  useViewStateStore,
} from "src/layout.js"

export const SideBar = ({page, children}) => {
  let dragging = useViewStateStore(state => state.dragging)
  let setDragging = useViewStateStore(state => state.setDragging)
  let dragOffset = useRef(0)
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth[page])
  let sidebarWidthRef = useRef()
  sidebarWidthRef.current = sidebarWidth
  let setSidebarWidth = useLayoutStore(state => state.setSidebarWidth)
  let draggingRef = useRef()
  draggingRef.current = dragging

  useEffect(() => {
    let onMouseMove = (e) => {
      if (!draggingRef.current) {
        return
      }
      let offset = dragOffset.current
      let width = sanitizeSidebarWidth(vw() - e.clientX + offset)
      setSidebarWidth(page, width)
    }
    let onMouseUp = () => setDragging(false)
    window.document.addEventListener("mousemove", onMouseMove)
    window.document.addEventListener("mouseup", onMouseUp)
    return () => {
      window.document.removeEventListener("mousemove", onMouseMove)
      window.document.removeEventListener("mouseup", onMouseUp)
    }
  }, [page, setDragging, setSidebarWidth])

  let onMouseDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
    let sidebarWidth = sidebarWidthRef.current
    dragOffset.current = sidebarWidth + e.clientX - vw()
  }, [setDragging])

  let ghostWidth = Math.trunc(getRemInPixel() * 0.5) + 2
  return (
    <div
        style={{width: sidebarWidth + "px"}}
        className="absolute border-l border-gray-500 top-0 right-0 h-full bg-slate-800">
      <div
        onMouseDown={!dragging ? onMouseDown : undefined}
        style={{
          right: (sidebarWidth - ghostWidth + 1),
          width: Math.trunc(getRemInPixel() * 0.5) + 2,
        }}
        className="absolute top-0 h-full bg-transparent z-20 cursor-col-resize" />
      {children}
    </div>
  )
}
