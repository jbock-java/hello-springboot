import {
  twMerge,
} from "tailwind-merge"

export const Button = ({ type, children, disabled, className, onClick, ...rest }) => {
  let classes = twMerge(
    "border-2 border-slate-600 rounded-lg px-8 py-2",
    disabled && "text-slate-500 bg-slate-200 border-slate-400 border-2",
    !disabled && "hover:text-white text-slate-200 hover:border-sky-700",
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
