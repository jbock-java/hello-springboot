import {
  create,
} from "zustand"
import {
  produce,
} from "immer"
import {
  persist,
} from "zustand/middleware"

export const useLayoutStore = create(
  persist(
    (set, get) => ({
      zoom: 0,
      dragging: false,
      vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      sidebarWidth: 24 * getPixelRem(),
      setZoom: (zoom) => {
        set(produce(state => {
          if (!zoom) {
            state.zoom = 0.000244140625 // force re-render
          } else {
            state.zoom = zoom
          }
        }))
      },
      setDragging: (dragging) => {
        set(produce(state => {
          state.dragging = dragging
        }))
      },
      sanitizeSidebarWidth: (width) => {
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        width = Math.max(200, width)
        return Math.min(Math.abs(get().vw - vh), width)
      },
      setSidebarWidth: (width) => {
        set(produce(state => {
          state.sidebarWidth = width
          if (!get().zoom) {
            state.zoom = 0.000244140625 // force re-render
          } else {
            state.zoom = 0
          }
        }))
      },
    }),
    {name: "layout-storage"},
  ),
)

function getPixelRem() {
    return parseFloat(window.getComputedStyle(window.document.documentElement).fontSize)
}
