import Select, { GroupBase, Props } from "react-select";

interface CustomSelectProps<
  Option,
  IsMulti extends boolean,
  Group extends GroupBase<Option>
> extends Props<Option, IsMulti, Group> {
  label?: string;
  error?: any;
  wrapperclass?: string;
}
const CustomSelect = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: CustomSelectProps<Option, IsMulti, Group>
) => {
  const ErrorClass =
    "bg-red-50 border border-red-500 text-red-900 placeholder-red-700 text-sm rounded-lg dark:bg-gray-700 focus:border-red-500 block w-full p-0.5 dark:text-red-500 dark:placeholder-red-500 dark:border-red-500";
  const DefaultClass =
    "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-0.5 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white";
  const selectedClass = props.error ? ErrorClass : DefaultClass;
  return (
    <>
      <label className="text-gray-600 text-sm">{props.label}</label>
      <div className={`w-full ${props.wrapperclass}`}>
        <Select
          classNames={{
            option: (props) => {
              return props.isSelected
                ? "bg-yellow-400"
                : "bg-gray-50 dark:bg-gray-700 dark:text-white  ";
            },
            control: () => {
              return selectedClass;
            },
            menu: () => {
              return "bg-gray-50 dark:bg-gray-700";
            },
          }}
          {...{
            ...props,
            styles: {
              control: (baseStyles) => ({
                ...baseStyles,
                borderColor: props.error ? "red" : "none",
                boxShadow: "none",
                outline: "none",
              }),
              option: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: "none",
              }),
            },
          }}
        ></Select>

        <div>
          <small className="text-red-400">{props.error}</small>
        </div>
      </div>
    </>
  );
};

export default CustomSelect;
