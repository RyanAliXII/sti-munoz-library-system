import React, { BaseSyntheticEvent, useState } from "react";
import { ObjectSchema, ValidationError } from "yup";
import { ObjectShape } from "yup/lib/object";
import {set} from 'lodash'
type useFormProps<T> = {
  default: T;
  schema: ObjectSchema<ObjectShape>;
};

export type useFormType<T> = {
  validate:()=>Promise<void>;
  clearErrorWithKey:(key: string)=>void;
  setForm:React.Dispatch<React.SetStateAction<T>>
  clearErrors:()=>void;
  handleFormInput:(event: BaseSyntheticEvent)=>void
  form: T
  errors:any
}
export const useForm = <T extends object>(props: useFormProps<T>): useFormType<T> => {
  const [form, setForm] = useState<T>(props.default);
  const [errors, setErrors] = useState<any>();
  const clearErrors = () => {
    setErrors(() => undefined);
  };
  const clearErrorWithKey = (key: string) => {
    try{
    if (!errors) return;
    if (errors[key]?.length === 0) return;
    setErrors((prevErrors: any) => {
      return {
        ...prevErrors,
        [key]: "",
      };
    });
  } catch(error){
    console.error(error)
  }
  };
  const handleFormInput = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const value = event.target.value;
    const update = set(form, name, value) as T
    setForm(() => {
      return {...update}
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
    let errorObject: any = {};
    error.inner.forEach((err) => {
      errorObject = set(errorObject,err?.path ?? '', err.message )
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
    handleFormInput
  } 
};
