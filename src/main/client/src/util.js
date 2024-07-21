import {
  createContext,
} from "react"

export const StompContext = createContext()

export const base = "/app"
export const BLACK = 32
export const WHITE = 64
export const TERRITORY = 2
export const REMOVED = 4

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

export function hasColor(color) {
  return hasBlack(color) || hasWhite(color)
}

export function hasBlack(color) {
  return (color & BLACK) !== 0
}

export function hasWhite(color) {
  return (color & WHITE) !== 0
}
