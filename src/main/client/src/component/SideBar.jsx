import {
  useRef,
  useEffect,
  useState,
} from "react"
import {
  useLayoutStore,
} from "../layout.js"

export const SideBar = ({children}) => {
  let vw = useLayoutStore(state => state.vw)
  let dragging = useLayoutStore(state => state.dragging)
  let setDragging = useLayoutStore(state => state.setDragging)
  let sidebarWidth = useLayoutStore(state => state.sidebarWidth)
  let setSidebarWidth = useLayoutStore(state => state.setSidebarWidth)
  let [ghostWidth, setGhostWidth] = useState(sidebarWidth)
  let draggingRef = useRef()
  let ghostWidthRef = useRef()
  draggingRef.current = dragging
  ghostWidthRef.current = ghostWidth
  useEffect(() => {
    let mousemove = (e) => {
      if (!draggingRef.current) {
        return
      }
      setGhostWidth(Math.trunc(vw - e.clientX))
    }
    let mouseup = () => {
      if (!draggingRef.current) {
        return
      }
      setSidebarWidth(ghostWidthRef.current)
      setDragging(false)
    }
    window.document.addEventListener("mousemove", mousemove)
    window.document.addEventListener("mouseup", mouseup)
    return () => {
      window.document.removeEventListener("mousemove", mousemove)
      window.document.removeEventListener("mouseup", mouseup)
    }
  }, [vw, draggingRef, setDragging, setSidebarWidth])
  return (
    <div
        style={{width: sidebarWidth + "px"}}
        className="fixed top-0 right-0 h-full bg-slate-800">
      <div
        onMouseDown={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        style={{right: sidebarWidth + "px"}}
        className="fixed top-0 w-[3px] h-full bg-slate-700 z-10 cursor-col-resize" />
      {dragging && (
        <div
          style={{right: ghostWidth + "px"}}
          className="fixed top-0 w-[3px] h-full bg-slate-600 z-20" />
      )}
      {children}
    </div>
  )
}
