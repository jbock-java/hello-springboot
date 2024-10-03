import {
  useForm,
  FormProvider,
} from "react-hook-form"

export const Form = ({ children, onSubmit, forwardedRef, ...rest }) => {
  let methods = useForm()
  return (
    <FormProvider {...methods}>
      <form ref={forwardedRef} onSubmit={methods.handleSubmit(onSubmit)} {...rest}>
        {children}
      </form>
    </FormProvider>
  )
}
