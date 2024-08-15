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
      dragging: false,
      vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      sidebarWidth: 24 * getPixelRem(),
      setDragging: (dragging) => {
        set(produce(state => {
          state.dragging = dragging
        }))
      },
      setSidebarWidth: (width) => {
        let vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        width = Math.max(200, width)
        width = Math.min(Math.abs(get().vw - vh), width)
        set(produce(state => {
          state.sidebarWidth = width
        }))
      },
    }),
    {name: "layout-storage"},
  ),
)

function getPixelRem() {
    return parseFloat(window.getComputedStyle(window.document.documentElement).fontSize)
}
