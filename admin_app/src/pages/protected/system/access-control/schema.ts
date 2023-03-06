import { object, string } from "yup"


export const RoleSchemaValidation =  object().shape(
    {
        name: string().required("Name cannot be empty.")
    }
)