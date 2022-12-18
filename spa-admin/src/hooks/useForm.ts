import { useState } from "react";
import { ObjectSchema, ValidationError } from "yup";
import { ObjectShape } from "yup/lib/object";

type useFormProps<T> = {
  default: T;
  schema: ObjectSchema<ObjectShape>;
};
export const useForm = <T>(props: useFormProps<T>) => {
  const [form, setForm] = useState<T>(props.default);
  const [errors, setErrors] = useState<any>();
  const clearErrors = () => {
    setErrors(() => undefined);
  };
  const clearErrorWithKey = (key: string) => {
    if (!errors) return;
    if (errors[key]?.length === 0) return;
    setErrors((prevErrors: any) => {
      return {
        ...prevErrors,
        [key]: "",
      };
    });
  };
  const validate = async () => {
    try {
      await props.schema.validate(form, { abortEarly: false });
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorObject = processSchemaError(error);
        setErrors({ ...errorObject });
        throw new Error("Validation failed");
      }
    }
  };
  const processSchemaError = (error: ValidationError) => {
    const errorObject: any = {};
    error.inner.forEach((err) => {
      const key: string = err.path ?? "";
      errorObject[key] = err.message;
    });
    return errorObject;
  };

  return {
    form,
    setForm,
    errors,
    validate,
    clearErrors,
    clearErrorWithKey,
  };
};
