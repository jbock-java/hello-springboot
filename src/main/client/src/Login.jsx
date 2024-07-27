import {
  Form,
} from "./component/Form.jsx"
import {
  Input,
} from "./component/Input.jsx"
import {
  Button,
} from "./component/Button.jsx"
import {
  useNavigate,
} from "react-router-dom"
import toast, {
  Toaster,
} from "react-hot-toast";
import {
  base,
  tfetch,
} from "./util.js"
import {
  useAuthStore,
} from "./store.js"

export function Login() {
  let navigate = useNavigate()
  let setAuth = useAuthStore(state => state.setAuth)
  let setPending = useAuthStore(state => state.setPending)
  let onSubmit = async (d) => {
    setPending(true)
    try {
      let response = await tfetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(d),
      })
      setAuth(response)
      navigate(base + "/lobby")
    } catch (e) {
      setPending(false)
      toast.error(e.message)
    }
  }
  return (
  <>
    <Form className="m-4" onSubmit={onSubmit}>
      <div>
        <Input name="name" />
      </div>
      <Button
        className="mt-2"
        type="submit">
          Join
      </Button>
    </Form>
    <Toaster position="top-right"/>
  </>
  )
}
