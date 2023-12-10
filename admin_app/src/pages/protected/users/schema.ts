import { boolean, number, object, string } from "yup";

export const UserTypeValidation = object({
  name: string()
    .required("Name is required.")
    .max(50, "Name should cannot exceed 50 characters."),
  hasProgram: boolean().required("This field is required."),
});

export const UserProgramValidation = object({
  name: string()
    .required("Name is required.")
    .max(255, "Name should not exceed 255 characters."),
  code: string()
    .required("Code is required.")
    .max(50, "Code should not exceed 50 characters."),
  userTypeId: number()
    .required("User type is required.")
    .min(1, "User type is required."),
});
