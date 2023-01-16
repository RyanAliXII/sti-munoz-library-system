import React, { BaseSyntheticEvent, useState } from "react";
import { ObjectSchema, ValidationError } from "yup";
import { AssertsShape, ObjectShape } from "yup/lib/object";
import {get, set} from 'lodash'
import { name } from "@azure/msal-common/dist/packageMetadata";
type useFormProps<T> = {
  default: T;
  schema: ObjectSchema<ObjectShape>;
};

enum InputTypes{
  Checkbox= "checkbox"
}
export type useFormType<T> = {
  validate:() => Promise< T | undefined>
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
    const error = get(errors, key)
    if(!error) return
    console.log(errors)
    const update = set({...errors}, key, "") as T
    setErrors({...update})
  } catch(error){
    console.error(error)
  }
  };
  const handleFormInput = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const type = event.target.type
    let value;
    
    if(type === InputTypes.Checkbox ){
      value = event.target.checked
    }
    else{
      value = event.target.value
    }
    const update = set({...form}, name, value) as T
    setForm(() => {
      return {...update}
    });
    clearErrorWithKey(name)
  };
  const validate = async () => {
    try {
     const data =  await props.schema.validate(form, { abortEarly: false });
      
     return data as T
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
    let firstInputWithError;
    error.inner.forEach((err, index) => {
      if(index === 0) firstInputWithError = err?.path
      console.log(err?.path)
      errorObject = set(errorObject, err?.path ?? '', err.message )
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
