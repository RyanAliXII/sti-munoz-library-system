import { array, number, object, string } from "yup";
export const CheckoutSchemaValidation = object().shape({
  client: object().shape({
    id: string()
      .typeError("Please select client.")
      .uuid("Please select a client."),
  }),
  accessions: array()
    .of(
      object().shape({
        bookId: string().typeError("Invalid book id.").uuid("Invalid book.id"),
        number: number()
          .integer("Invalid accession number.")
          .min(1, "Invalid accession number."),
        dueDate: string().required("Date is required."),
      })
    )
    .min(1, "Please select book."),
});
