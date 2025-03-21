import { TextInput } from "flowbite-react";
import { KeyboardEvent, ChangeEvent } from "react";

type SearchBarParamsType = {
  value: string,
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSearch: () =>void
}
const SearchBar = ({ value, onChange, onSearch, onKeyDown }: SearchBarParamsType) => (
  <div className="pt-5 px-5 lg:px-10">
    
    <TextInput
      type="text"
      placeholder="Search by title, subject, description, or authors"
      className="w-full"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
    />
  </div>
);

export default SearchBar;
