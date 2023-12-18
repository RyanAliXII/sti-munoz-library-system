import React, {
  BaseSyntheticEvent,
  MutableRefObject,
  useRef,
  useState,
} from "react";
import { ObjectSchema, ValidationError } from "yup";
import { ObjectShape } from "yup/lib/object";
import get from "lodash/get";
import set from "lodash/set";
import scrollToElement from "scroll-to-element";

type UseFormProps<T> = {
  initialFormData: T;
  schema?: ObjectSchema<ObjectShape>;
  scrollToError?: boolean;
  parentElementScroll?: MutableRefObject<HTMLElement | null>;
};

enum InputTypes {
  Checkbox = "checkbox",
  Textarea = "textarea",
}
export interface UseFormType<T> {
  validate: () => Promise<T | undefined>;
  removeFieldError: (fieldName: string) => void;
  setFieldValue: (fieldName: string, value: any) => void;
  setForm: React.Dispatch<React.SetStateAction<T>>;
  removeErrors: () => void;
  handleFormInput: (event: BaseSyntheticEvent) => void;
  form: T;
  errors: any;
  resetForm: () => void;
  setErrors: (errors: {}) => void;
  registerFormGroup: (el: any) => (el: any) => void;
}
export const useForm = <T extends object>({
  initialFormData,
  schema,
  scrollToError = false,
  parentElementScroll,
}: UseFormProps<T>): UseFormType<T> => {
  const [form, setForm] = useState<T>({ ...initialFormData });
  const [errors, setErrors] = useState<any>();
  const removeErrors = () => {
    setErrors(() => undefined);
  };

  const formGroupRefs = useRef<any>({});
  const setFieldValue = (fieldName: string, value: any) => {
    const update = set(form, fieldName, value) as T;
    setForm(() => {
      return { ...update };
    });
  };
  const removeFieldError = (fieldName: string) => {
    try {
      const error = get(errors, fieldName);
      if (!error) return;
      const update = set(errors, fieldName, "") as T;
      setErrors({ ...update });
    } catch (error) {
      console.error(error);
    }
  };
  const handleFormInput = (event: BaseSyntheticEvent) => {
    const name = event.target.name;
    const type = event.target.type;
    let value;
    if (type === InputTypes.Checkbox) {
      value = event.target.checked;
    } else {
      value = event.target.value;
    }
    const update = set(form, name, value) as T;
    setForm(() => {
      return { ...update };
    });
    removeFieldError(name);
  };
  const validate = async () => {
    try {
      if (!schema) return;
      const data = await schema?.validate(form, { abortEarly: false });

      return data as T;
    } catch (error) {
      if (error instanceof ValidationError) {
        const errorObject = processSchemaError(error);
        setErrors((prev: any) => ({ ...prev, ...errorObject }));
        throw new Error("Validation failed: " + JSON.stringify(errorObject));
      }
    }
  };
  const processSchemaError = (error: ValidationError) => {
    let errorObject: any = {};
    error.inner.forEach((err) => {
      errorObject = set(errorObject, err?.path ?? "", err.message);
    });

    if (
      scrollToError &&
      error.inner.length > 0 &&
      !parentElementScroll?.current
    ) {
      const inputPath = error?.inner[0]?.path;
      const element = get(formGroupRefs.current, inputPath ?? "", null);
      if (!element) return errorObject;
      scrollToElement(element, {
        offset: -150,
        duration: 700,
      });
    }
    if (parentElementScroll?.current && scrollToError) {
      const inputPath = error?.inner[0]?.path;
      const element = get(
        formGroupRefs.current,
        inputPath ?? "",
        null
      ) as HTMLElement;
      parentElementScroll.current.scrollTo({
        behavior: "smooth",
        top: element.scrollTop,
      });
    }

    return errorObject;
  };

  const resetForm = () => {
    setForm({ ...initialFormData });
  };

  const registerFormGroup = (fieldName: string) => {
    return (el: any) => {
      formGroupRefs.current[fieldName] = el;
    };
  };

  return {
    setErrors: (errors: any) => {
      setErrors(errors);
    },
    form,
    setForm,
    errors,
    validate,
    setFieldValue,
    removeErrors,
    removeFieldError,
    handleFormInput,
    resetForm,
    registerFormGroup,
  };
};
