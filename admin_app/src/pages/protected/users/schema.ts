import { boolean, object, string } from "yup";

export const UserTypeValidation = object({
  name: string()
    .required("Name is required.")
    .max(50, "Name should cannot exceed 50 characters."),
  hasProgram: boolean().required("This field is required."),
});
