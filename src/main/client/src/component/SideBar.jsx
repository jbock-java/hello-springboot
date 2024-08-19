import {
  useRef,
  useEffect,
  useCallback,
} from "react"
import {
  vw,
  sanitizeSidebarWidth,
} from "src/util.js"
import {
  useLayoutStore,
  useViewStateStore,
} from "src/layout.js"

export const SideBar = ({page, children}) => {
  let dragging = useViewStateStore(state => state.dragging)
  let setDragging = useViewStateStore(state => state.setDragging)
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth[page])
  let setSidebarWidth = useLayoutStore(state => state.setSidebarWidth)
  let draggingRef = useRef()
  let ghostWidthRef = useRef()
  draggingRef.current = dragging
  ghostWidthRef.current = sidebarWidth
  useEffect(() => {
    let mousemove = (e) => {
      if (!draggingRef.current) {
        return
      }
      let width = sanitizeSidebarWidth(vw() - e.clientX)
      setSidebarWidth(page, width)
    }
    let mouseup = () => setDragging(false)
    window.document.addEventListener("mousemove", mousemove)
    window.document.addEventListener("mouseup", mouseup)
    return () => {
      window.document.removeEventListener("mousemove", mousemove)
      window.document.removeEventListener("mouseup", mouseup)
    }
  }, [page, draggingRef, setDragging, setSidebarWidth])
  let onMouseDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
  }, [setDragging])
  return (
    <div
        style={{width: sidebarWidth + "px"}}
        className="fixed top-0 right-0 h-full bg-slate-800">
      <div
        onMouseDown={onMouseDown}
        style={{right: sidebarWidth + "px"}}
        className="fixed top-0 w-[3px] h-full bg-slate-700 z-10 cursor-col-resize" />
      {dragging && (
        <div
          style={{right: sidebarWidth + "px"}}
          className="fixed top-0 w-[3px] h-full bg-slate-600 z-20" />
      )}
      {children}
    </div>
  )
}
