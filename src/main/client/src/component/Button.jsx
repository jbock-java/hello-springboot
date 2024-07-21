import {
  twJoin,
} from "tailwind-merge"

export const Button = ({ type, children, disabled, className, onClick, ...rest }) => {
  let classes = twJoin(
    "px-4 py-1 rounded-lg",
    disabled ?
      "text-slate-500 bg-slate-200 border-slate-400 border-2" :
      "text-white bg-slate-700 hover:bg-slate-600",
    className,
  )
  return (
    <button
      type={type || "button"}
      disabled={disabled}
      className={classes}
      {...rest}
      onClick={!disabled ? onClick : undefined}>
        {children}
    </button>
  )
}
