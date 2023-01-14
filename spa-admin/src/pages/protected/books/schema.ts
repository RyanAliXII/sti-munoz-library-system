import {array, date, DateSchema, number, object, string} from 'yup'
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


const NUMBER_NO_DECIMAL = "Value should be numeric and not in decimal format."


export const BookSchema = object().shape({
    title: string().max(150, "Character should not exceed 150").required("Book title is required."),
    author: array().notRequired(),
    category: string().test("check-length","Please select a category.", (value)=> (value ?? "").length > 0 ).required("Please select a category."),
    copies: number().integer("Value should not be decimal.").test("check-if-greater-than-0","Value should be greater than 0" ,(value)=> (value ?? 0) > 0).required("Number of copies is required."),
    dateReceived: date().notRequired(),
    authorNumber: object().shape({
        value: string().required("Author number is required."),
        surname: string().notRequired(),
        number: number().notRequired(),
    }),
    ddc: string().required("Classification is required."),
    costPrice: number().min(0, "The cost price must not be less than 0.").notRequired(),
    description: string().notRequired(),
    fundSource: number().integer(NUMBER_NO_DECIMAL).test("check-if-greater-than-0","Please select a source." ,(value)=> (value ?? 0) > 0).required("Source of fund is required."),
    edition : number().integer(NUMBER_NO_DECIMAL).notRequired(),
    pages: number().integer(NUMBER_NO_DECIMAL).test("check-if-greater-than-0","Value should be greater than 0" ,(value)=> (value ?? 0) > 0).required("Number of pages is required."),
    publisher: number().integer(NUMBER_NO_DECIMAL).test("check-if-greater-than-0","Please select a publisher." ,(value)=> (value ?? 0) > 0).required("Publisher is required."),
    year: number().integer(NUMBER_NO_DECIMAL).required("Year published is required.")
})


export const BookFormSchema = object().shape({
    title: string().max(150, "Character should not exceed 150").required("Book title is required."),
    author: array().notRequired(),
    category: string().test("check-length","Please select a category.", (value)=> (value ?? "").length > 0 ).required("Please select a category."),
    copies: number().integer("Value should not be decimal.").test("check-if-greater-than-0","Value should be greater than 0" ,(value)=> (value ?? 0) > 0).required("Number of copies is required."),
    dateReceived: date().notRequired(),
    authorNumber: object().shape({
        value: string().max(150, "Character should not exceed 150").required("Author number is required."),
        surname: string().notRequired(),
        number: number().notRequired(),
    }),
    ddc: string().required("Classification is required."),
    costPrice: number().integer().min(0).notRequired(),
    description: string().notRequired(),
    fundSource: number().integer(NUMBER_NO_DECIMAL).test("check-if-greater-than-0","Please select a source." ,(value)=> (value ?? 0) > 0).required("Source of fund is required."),
    edition : number().integer(NUMBER_NO_DECIMAL).notRequired(),
    pages: number().integer(NUMBER_NO_DECIMAL).test("check-if-greater-than-0","Value should be greater than 0" ,(value)=> (value ?? 0) > 0).required("Number of pages is required."),
    publisher: number().integer(NUMBER_NO_DECIMAL).test("check-if-greater-than-0","Please select a publisher." ,(value)=> (value ?? 0) > 0).required("Publisher is required."),
    year: number().integer(NUMBER_NO_DECIMAL).required("Year published is required.")
})