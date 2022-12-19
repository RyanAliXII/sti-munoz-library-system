import {object, string} from 'yup'
import validator from 'validator';
export const CreateAuthorSchema = object().shape({
    givenName : string().required("Given name cannot be empty."),
    middleName: string().notRequired(),
    surname: string().required("Surname cannot be empty.")
    
})
export const CategorySchema = object().shape({
    name: string().test("is-alpha","Name should not contain numbers, symbols and whitespaces",  (value) => validator.isAlpha(value ?? "")).required("Name is required field")
})