import {object, string} from 'yup'

export const CreateAuthorSchema = object().shape({
    givenName : string().required("Given name cannot be empty."),
    surname: string().required("Surname cannot be empty.")

})