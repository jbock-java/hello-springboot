import {
  twJoin,
} from "tailwind-merge"

export const Button = ({ type, children, disabled, className, onClick, ...rest }) => {
  let classes = twJoin(
    disabled && "text-slate-500 bg-slate-200 border-slate-400 border-2",
    !disabled && "hover:bg-slate-700",
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
