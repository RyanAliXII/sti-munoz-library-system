import {array, number, object, string} from 'yup'
export const CheckoutSchemaValidation = object().shape({
    client: object().shape({
        id: string().typeError("Invalid client id.").uuid("Invalid client id.")
    }),
    accessions: array().of(object().shape({
            bookId: string().typeError("Invalid book id.").uuid("Invalid book.id"),
            number: number().integer("Invalid accession number.").min(1, "Invalid accession number.")
    })).min(1),
    dueDate: string().required().test("check if valid time", "Invalid due date value." , (val)=>{
        const d = new Date(val ?? "")
        return d instanceof Date && !isNaN(d.getTime())
    },  )
})