import {object, string} from 'yup'
import validator from 'validator';
export const CreateAuthorSchema = object().shape({
    givenName : string().max(100, "Input should not exceed 100 characters.").required("Given name cannot be empty."),
    middleName: string().max(100, "Input should not exceed 100 characters.").notRequired(),
    surname: string().max(100, "Input should not exceed 100 characters.").required("Surname cannot be empty.")
    
})
export const CategorySchema = object().shape({
    name: string().test("is-alpha","Name should not contain symbols and whitespaces.",  (value) => validator.isAlphanumeric(value ?? "")).required("Name is required field")
})
// 
export const PublisherSchema = object().shape({
        name: string().max(150, "Character should not exceed 150", ).required("Publisher name is required")
})
export const SourceofFundSchema = object().shape({
    name: string().max(150, "Character should not exceed 150", ).required("Source name is required")
})