export const base = "/app"

export const tfetch = async (url, options) => {
  let response
  try {
    response = await fetch(base + url, options || {})
  } catch (e) {
    throw {
      options,
      message: (options?.method || "GET") + " " + url + ": " + e,
      status: -1,
    }
  }
  if (response.status >= 400) {
    throw {
      options,
      message: (options?.method || "GET") + " " + url + ": " + response.status,
      status: response.status,
    }
  }
  let contentType = response.headers.get("content-type")
  if (contentType && contentType.indexOf("application/json") !== -1) {
    return response.json()
  } else {
    return response.text()
  }
}
