import {
  twJoin,
} from "tailwind-merge"
import {
  useFormContext,
} from "react-hook-form"

export const Input = ({
  className,
  name,
  type,
  ...rest
}) => {
  let { register } = useFormContext()
  let classes = twJoin(
    "border border-black p-2",
    className,
  )
  return (
    <input
      className={classes}
      {...register(name)}
      type={type || "text"}
      {...rest}
    />
  )
}
