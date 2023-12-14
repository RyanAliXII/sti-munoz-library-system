import { object, string, array, number } from "yup";
import isISBN from "validator/lib/isISBN";
export const CreateAuthorSchema = object().shape({
  name: string()
    .max(100, "Name should not exceed 100 characters.")
    .required("Name is required."),
});
export const SectionSchema = object().shape({
  name: string(),
  prefix: string(),
});
export const EditSectionSchema = object().shape({
  name: string(),
  prefix: string(),
  lastValue: number()
    .integer("Counter value should be integer.")
    .typeError("Counter value should be numeric."),
});
//
export const PublisherSchema = object().shape({
  name: string()
    .max(150, "Character should not exceed 150")
    .required("Publisher name is required"),
});
export const SourceofFundSchema = object().shape({
  name: string()
    .max(150, "Character should not exceed 150")
    .required("Source name is required"),
});

const NUMBER_NO_DECIMAL = "Value should be numeric and not in decimal format.";

export const BookSchema = object().shape({
  title: string().required("Book title is required."),
  isbn: string()
    .notRequired()
    .test("check-isbn", "Invalid ISBN number.", (value: string | undefined) => {
      if (!value) return true;
      if (value.length === 0) return true;
      return isISBN(value ?? " ");
    }),
  copies: number()
    .typeError("Value must not be empty and should be numeric.")
    .integer("Value should not be decimal.")
    .min(1, "Value should be atleast 1")
    .required("Number of copies is required."),
  pages: number()
    .typeError("Value must not be empty and should be numeric.")
    .integer(NUMBER_NO_DECIMAL)
    .test(
      "check-if-greater-than-0",
      "Value should be greater than 0",
      (value) => (value ?? 0) > 0
    )
    .required("Number of pages is required."),
  sectionId: number()
    .integer(NUMBER_NO_DECIMAL)
    .required("Please select section")
    .min(1, "Please select a section."),
  publisherId: number()
    .integer(NUMBER_NO_DECIMAL)
    .required("Publisher is required.")
    .min(1, "Please select a publisher."),
  fundSourceId: number()
    .integer(NUMBER_NO_DECIMAL)
    .required("Source of fund is required.")
    .min(1, "Please select a source."),
  costPrice: number()
    .typeError("Value must not be empty and should be numeric.")
    .min(0, "The cost price must not be less than 0.")
    .notRequired(),
  edition: number()
    .typeError("Value must not be empty and should be numeric.")
    .integer(NUMBER_NO_DECIMAL)
    .notRequired(),
  yearPublished: number()
    .integer(NUMBER_NO_DECIMAL)
    .required("Year published is required."),
  receivedAt: string().notRequired(),
  description: string().notRequired(),
  author: array().notRequired(),
  authorNumber: string().required("Author number is required."),
  ddc: string().required("Dewey Decimal Classification is required."),
});

export const NewBookSchemaValidation = object().shape({
  title: string().required("Book title is required."),
  subject: string().notRequired(),
  isbn: string()
    .notRequired()
    .test("check-isbn", "Invalid ISBN number.", (value: string | undefined) => {
      if (!value) return true;
      if (value.length === 0) return true;
      return isISBN(value ?? " ");
    }),
  copies: number()
    .typeError("Value must not be empty and should be numeric.")
    .integer("Value should not be decimal.")
    .min(1, "Value should be atleast 1")
    .required("Number of copies is required."),
  pages: number()
    .integer(NUMBER_NO_DECIMAL)
    .notRequired()
    .min(0, "Pages should not be less than 0"),

  section: object().shape({
    name: string().notRequired(),
    id: number()
      .integer(NUMBER_NO_DECIMAL)
      .typeError("Please select a section")
      .required("Please select section")
      .min(1, "Please select a section."),
  }),

  publisher: object().shape({
    name: string().notRequired(),
    id: string()
      .required("Publisher is required.")
      .uuid("Please select a publisher"),
  }),
  costPrice: number()
    .typeError("Value must not be empty and should be numeric.")
    .min(0, "The cost price must not be less than 0.")
    .notRequired(),
  edition: number()
    .typeError("Value must not be empty and should be numeric.")
    .min(0, "The edition must not be less than 0.")
    .integer(NUMBER_NO_DECIMAL)
    .notRequired(),
  yearPublished: number()
    .integer(NUMBER_NO_DECIMAL)
    .required("Year published is required."),
  receivedAt: string().notRequired(),
  description: string().notRequired(),
  author: array().notRequired(),
  authorNumber: string()
    .notRequired()
    .test(
      "check-ddc",
      "Invalid author number.",
      (value: string | undefined) => {
        if (!value) return true;
        if (value.length === 0) return true;
        return value.length > 0;
      }
    ),
  ddc: string()
    .notRequired()
    .test("check-ddc", "Invalid DDC value.", (value: string | undefined) => {
      if (!value) return true;
      if (value.length === 0) return true;
      return value.length > 0;
    }),
});

export const UpdateBookSchemaValidation = object().shape({
  title: string().required("Book title is required."),
  isbn: string()
    .notRequired()
    .test("check-isbn", "Invalid ISBN number.", (value: string | undefined) => {
      if (!value) return true;
      if (value.length === 0) return true;
      return isISBN(value ?? " ");
    }),
  pages: number()
    .typeError("Value must not be empty and should be numeric.")
    .integer(NUMBER_NO_DECIMAL)
    .min(0, "Pages should not be less than 0"),
  section: object().shape({
    name: string().notRequired(),
    id: number()
      .integer(NUMBER_NO_DECIMAL)
      .required("Please select section")
      .min(1, "Please select a section."),
  }),

  publisher: object().shape({
    name: string().notRequired(),
    id: string()
      .required("Publisher is required.")
      .uuid("Please select a publisher"),
  }),

  costPrice: number()
    .typeError("Value must not be empty and should be numeric.")
    .min(0, "The cost price must not be less than 0.")
    .notRequired(),
  edition: number()
    .typeError("Value must not be empty and should be numeric.")
    .min(0, "The edition must not be less than 0.")
    .integer(NUMBER_NO_DECIMAL)
    .notRequired(),
  yearPublished: number()
    .integer(NUMBER_NO_DECIMAL)
    .required("Year published is required."),
  receivedAt: string().notRequired(),
  description: string().notRequired(),
  author: array().notRequired(),
  authorNumber: string()
    .notRequired()
    .test(
      "check-ddc",
      "Invalid author number.",
      (value: string | undefined) => {
        if (!value) return true;
        if (value.length === 0) return true;
        return value.length > 0;
      }
    ),
  ddc: string()
    .notRequired()
    .test("check-ddc", "Invalid DDC value.", (value: string | undefined) => {
      if (!value) return true;
      if (value.length === 0) return true;
      return value.length > 0;
    }),
});

export const AuditSchemaValidation = object().shape({
  name: string()
    .required("Name is required.")
    .max(150, "Name should not exceed 150 characters."),
});

export const OrganizationValidation = object().shape({
  name: string()
    .required("Name is required.")
    .max(250, "Name should not exceed 250 characters."),
});
