import { object, string } from "yup";

export const NewGameValidation = object({
  name: string()
    .required("Name is required.")
    .max(100, "Name should not exceed 100 characters"),
  description: string()
    .required("Description is required.")
    .max(255, "Description should not exceed 255 characters"),
});

export const LogGameValidation = object({
  accountId: string()
    .required("Client is required.")
    .uuid("Client is required."),
  gameId: string().required("Game is required.").uuid("Game is required."),
});
