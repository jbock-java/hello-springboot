import {
  create,
} from "zustand"
import {
  produce,
} from "immer"
import {
  persist,
} from "zustand/middleware"

const TINY = 0.0001220703125

export const useViewStateStore = create((set, get) => ({
  zoom: 0,
  dragging: false,
  setDragging: (dragging) => {
    set(produce(state => {
      state.dragging = dragging
    }))
  },
  setZoom: (zoom) => {
    set(produce(state => {
      if (Math.trunc(zoom)) {
        state.zoom = zoom
      } else {
        state.zoom = get().zoom ? 0 : TINY // force re-render
      }
    }))
  },
}))

export const useLayoutStore = create(
  persist(
    (set, get) => ({
      sidebarWidth: {
        "game": 24 * getRemInPixel(),
        "lobby": 24 * getRemInPixel(),
      },
      setSidebarWidth: (page, width) => {
        set(produce(state => {
          let newSidebarWidth = {...get().sidebarWidth}
          newSidebarWidth[page] = Math.trunc(width)
          state.sidebarWidth = newSidebarWidth
        }))
      },
    }),
    {name: "layout-storage"},
  ),
)

function getRemInPixel() {
  let fontSize = window.getComputedStyle(window.document.documentElement).fontSize
  return Math.trunc(parseFloat(fontSize))
}
