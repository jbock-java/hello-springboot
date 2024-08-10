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
  let {register} = useFormContext()
  let classes = twJoin(
    "border border-white rounded-lg p-2 bg-stone-800 text-stone-100",
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
