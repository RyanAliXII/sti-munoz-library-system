import { isBefore, isEqual, isMatch } from "date-fns";
import { array, number, object, string } from "yup";
export const CheckoutSchemaValidation = object().shape({
  client: object().shape({
    id: string()
      .typeError("Please select client.")
      .uuid("Please select a client."),
  }),
  accessions: array().of(
    object().shape({
      bookId: string().typeError("Invalid book id.").uuid("Invalid book.id"),
      number: number()
        .integer("Invalid accession number.")
        .min(1, "Invalid accession number."),
      dueDate: string().required("Date is required."),
    })
  ),
  ebooks: array().of(
    object().shape({
      bookId: string().typeError("Invalid book id.").uuid("Invalid book.id"),
      dueDate: string()
        .required("Date is required.")
        .test(
          "test-is-after-date",
          "Date must not be less than the date today.",
          (value) => {
            if (!value) return false;
            try {
              const now = new Date();
              now.setHours(0, 0, 0, 0);
              const selectedDate = new Date(value);
              selectedDate.setHours(0, 0, 0, 0);
              return !isBefore(selectedDate, now) || isEqual(now, selectedDate);
            } catch {
              return false;
            }
          }
        )
        .test("match-format", "Date is required.", (value) => {
          if (!value) return false;
          return isMatch(value, "yyyy-MM-dd");
        }),
    })
  ),
});
