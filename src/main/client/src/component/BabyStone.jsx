import {
  FaCircle,
} from "react-icons/fa"
import {
  IconContext,
} from "react-icons"

export function BabyStone({color, className}) {
  return (
    <IconContext.Provider value={{ color: color, size: "1.5em", className: className }}>
      <FaCircle />
    </IconContext.Provider>
  )
}
