import { object, string, array, number } from "yup";

export const RoleSchemaValidation = object().shape({
  name: string().required("Name cannot be empty."),
});

export const AssignRoleFormSchemaValidation = array()
  .of(
    object({
      account: object().shape({
        id: string()
          .typeError("Invalid account id")
          .uuid("Invalid account id")
          .required(),
      }),
      role: object().shape({
        id: number()
          .typeError("Invalid role id")
          .required()
          .min(1, "Invalid role id"),
      }),
    })
  )
  .min(1);

export const NewAccountValidation = object({
  username: string().required("Username is required."),
  password: string()
    .required("Password is required.")
    .min(10, "Password must be at least 10 characters"),
  description: string()
    .required("Description is required.")
    .min(1, "Description is required."),
});

export const EditAccountValidation = object({
  username: string().required("Username is required."),
  description: string()
    .required("Description is required.")
    .min(1, "Description is required."),
});
