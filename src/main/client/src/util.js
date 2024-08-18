import {
  createContext,
} from "react"
import toast from "react-hot-toast"

export const StompContext = createContext()

export const base = "/app"

export const BLACK = 32
export const WHITE = 64
export const TERRITORY_B = 2
export const TERRITORY_W = 4
export const REMOVED_B = 8
export const REMOVED_W = 16

export const TOGGLE_B = REMOVED_B | BLACK
export const TOGGLE_W = REMOVED_W | WHITE
export const TOGGLE_STUFF = TOGGLE_B | TOGGLE_W

export const TERRITORY = TERRITORY_W | TERRITORY_B
export const ANY_REMOVED = REMOVED_W | REMOVED_B

export const COLORS = BLACK | WHITE

export async function tfetch(url, options) {
  let response
  try {
    response = await fetch(base + url, options || {})
  } catch (e) {
    throw {
      options,
      message: (options?.method || "get") + " " + url + ": " + e,
      status: -1,
    }
  }
  let body = await getBody(response)
  if (response.status >= 400) {
    throw {
      options,
      message: body.message || (options?.method || "get") + " " + url + ": " + response.status,
      status: response.status,
    }
  }
  return body
}

function getBody(response) {
  let contentType = response.headers.get("content-type")
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json()
  } else {
    return response.text()
  }
}

export function getRandomString() {
  var arr = new Uint8Array(6)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, dec2hex).join("")
}

function dec2hex(dec) {
  return dec.toString(16).padStart(2, "0")
}

export function hasStone(color) {
  return (color & COLORS) !== 0
}

export function getBaseColor(color) {
  if ((color & (BLACK | TERRITORY_B | REMOVED_B)) !== 0) {
    return BLACK
  }
  if ((color & (WHITE | TERRITORY_W | REMOVED_W)) !== 0) {
    return WHITE
  }
  return 0
}

function hasWhite(color) {
  return (color & WHITE) !== 0
}

export function getColorClassName(color) {
  return hasWhite(color) ? "white" : "black"
}

export async function doTry(task, onError) {
  try {
    await task()
  } catch (e) {
    if (onError) {
      onError()
    } else {
      console.log(e)
    }
    toast.error(e.message)
  }
}

export function vw() {
  return Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
}

export function vh() {
  return Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
}

export function sanitizeSidebarWidth(width) {
  return Math.min(Math.abs(vw() - vh()), Math.max(200, width))
}

export function getRemInPixel() {
  let fontSize = window.getComputedStyle(document.documentElement).fontSize
  return parseFloat(fontSize)
}
