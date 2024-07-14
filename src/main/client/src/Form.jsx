import {
  useForm,
  FormProvider,
} from "react-hook-form"

export const Form = ({ children, onSubmit, ...rest }) => {
  let methods = useForm()
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...rest}>
        {children}
      </form>
    </FormProvider>
  )
}
