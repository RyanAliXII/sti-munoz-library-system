import { boolean, number, object, string } from "yup";

export const UserTypeValidation = object({
  name: string()
    .required("Name is required.")
    .max(50, "Name should cannot exceed 50 characters."),
  hasProgram: boolean().required("This field is required."),
  maxAllowedBorrowedBooks: number()
    .required("Max allowed borrowed books is required.")
    .min(0, "Max allowed borrowed book cannot be less than 1")
    .integer("Max allowed borrowed book should be an valid integer.")
    .typeError("Max allowed borrowed book should be an valid integer."),
  maxUniqueDeviceReservationPerDay: number()
    .required("Max unique device reservation per day is required.")
    .min(0, "Max unique device reservation per day cannot be less than 1.")
    .integer("Max unique device reservation per day should be valid integer.")
    .typeError(
      "Max unique device reservation per day should be valid integer."
    ),
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
