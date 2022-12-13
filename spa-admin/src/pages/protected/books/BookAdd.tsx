import axios from "axios";
import React, { BaseSyntheticEvent, useEffect, useState } from "react";
import Autocomplete from "../../../components/autocomplete-input/Autocomplete";
import { BaseProps } from "../../../definitions/props.definition";
import { constructQuery, falsyValidate} from "../../../helpers/helper";
import useDebounce from "../../../hooks/useDebounce";
import { Input } from "../../../components/forms/Forms";
const BookAdd = () => {
  const ONE_SECOND = 1000;
  const [bookSuggestions, setBookSuggestions] = useState<BookSuggestion[]>([]);
  const typingDebounce = useDebounce()
  const [selectedBookSuggestion, setSelectedBookSuggestion] =
    useState<BookSuggestion>({
      key: "",
      title: "",
      author_name: [],
      cover: "",
      ddc: [],
    });

  const searchBookByTitle = async (value:any) => {
    if (value.length === 0) {
      setBookSuggestions(() => []);
      return;
    }
    const query = constructQuery(value);
    const { data } = await axios.get(
      `http://openlibrary.org/search.json?title=${query}`
    );
    setBookSuggestions(() => data.docs);
  };

  const handleSearchOnChange= (event: BaseSyntheticEvent) => {
    const value = event.target.value;
    typingDebounce(searchBookByTitle, value ,ONE_SECOND)
  };
  const handleSearchResultClick = (bookSuggestion: BookSuggestion) => {
    setSelectedBookSuggestion({ ...bookSuggestion });
  };
  return (
    <div className="w-full h-full">
      <h1 className="text-3xl font-bold ml-9">Add Book</h1>
      <div className="w-9/12 ml-9 mt-6 flex items-center gap-2">
        <select className="w-44 border rounded border-gray-300 h-11">
          <option value={"title"}>Title</option>
          <option value={"author"}>Author</option>
          <option value={"all"}>All</option>
        </select>
        <div className="w-7/12 flex flex-col items-end">
          <Autocomplete
            className="w-full indent-1 h-11 border rounded border-gray-300"
            placeholder="Search books on openlibrary.org"
            onInput={handleSearchOnChange}
          >
            {bookSuggestions?.map((bkSuggestion) => {
              return (
                <li
                  key={bkSuggestion.key}
                  onClick={() => {
                      handleSearchResultClick(bkSuggestion);
                  }}
                  className="h-10 w-full cursor-pointer border flex items-center rounded"
                >
                  <span className="ml-1">{bkSuggestion.title}</span>
                </li>
              );
            })}
          </Autocomplete>
        </div>
        <button className="border border-gray-200 px-6 h-11 bg-blue-600 text-white rounded">
          Add to collection
        </button>
      </div>
      <BookAddForm
        selectedBookSuggestion={selectedBookSuggestion}
      ></BookAddForm>
    </div>
  );
};

const BookAddForm: React.FC<BookAddFormProps> = ({
  selectedBookSuggestion,
}) => {
  const [bookForm, setBookForm] = useState<BookForm>({
    title: "",
    author: "",
    copies: 1,
    cutterNumber: "",
    ddc: "",
  });

  useEffect(() => {
    try {
      setBookForm({
        title: selectedBookSuggestion.title,
        author:
          falsyValidate<Array<String>>(selectedBookSuggestion.author_name, [])
            .length === 0
            ? " "
            : selectedBookSuggestion.author_name[0],
        copies: 1,
        ddc:
          falsyValidate<Array<String>>(selectedBookSuggestion.ddc, [])
            .length === 0
            ? " "
            : selectedBookSuggestion.ddc[0],
        cutterNumber: "",
      });
    } catch (err) {
       alert(err)
    }
  }, [selectedBookSuggestion]);
  const handleBookAddForm = (event: BaseSyntheticEvent) => {
    const value = event.target.value;
    const name = event.target.name;
    setBookForm((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  return (
    <div className="ml-9 mt-5">
      <form>
        <div className="mb-3 xl:w-96">
          <Input
            labelText="Title"
            props={{
              value: bookForm.title,
              onChange: handleBookAddForm,
              placeholder: "Book title",
              name: "title",
            }}
          />
        </div>
        <div className="mb-3 xl:w-96">
          <Input
            labelText="Author"
            props={{
              value: bookForm.author,
              onChange: handleBookAddForm,
              placeholder: "Book author",
              name: "author",
            }}
          />
        </div>
        <div className="mb-3 xl:w-96">
          <Input
            labelText="Book copies"
            props={{
              type: "number",
              min: 1,
              max: 1000,
              value: bookForm.copies,
              onChange: handleBookAddForm,
              placeholder: "Book copies",
              name: "copies",
            }}
          />
        </div>
        <div className="mb-3 xl:w-96">
          <Input
            labelText="Dewey Decimal Class"
            props={{
              value: bookForm.ddc,
              onChange: handleBookAddForm,
              placeholder: "Book classification",
              name: "ddc",
            }}
          />
        </div>
        <div className="mb-3 xl:w-96">
          <Input
            labelText="Cutter number"
            props={{
              value: bookForm.cutterNumber,
              onChange: handleBookAddForm,
              placeholder: "Book cutter",
              name: "cutterNumber",
            }}
          />
        </div>
        <button type="submit" className="bg-blue-600 p-2 rounded text-white">
          Add Book
        </button>
      </form>
    </div>
  );
};

interface BookAddFormProps extends BaseProps {
  selectedBookSuggestion: BookSuggestion;
}

interface BookForm {
  title?: string;
  author?: string;
  copies?: number;
  ddc?: string;
  cutterNumber?: string;
}
interface BookSuggestion {
  title: string;
  key: string;
  author_name: string[];
  cover: string;
  ddc: string[];
}
export default BookAdd;
