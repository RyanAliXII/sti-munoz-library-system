import { Item } from "@definitions/types";
import useDebounce from "@hooks/useDebounce";
import { useRequest } from "@hooks/useRequest";
import { useQuery } from "@tanstack/react-query";
import Downshift from "downshift";
import { Label } from "flowbite-react";
import { BaseSyntheticEvent, useState } from "react";
import { ClipLoader } from "react-spinners";
import { string } from "yup";

type ItemSearchBoxProps = {
  setItem: (item: Item) => void;
  className?: string;
  initialValue?: Item;
  label?: string;
  value?: string;
};
const HIGHLIGHTED_CLASS = "bg-gray-100 dark:bg-gray-600";
const ItemSearchBox = ({
  setItem,
  className,
  initialValue,
  value,
  label,
}: ItemSearchBoxProps) => {
  const [searchKeyword, setKeyword] = useState("");
  const debounce = useDebounce();
  const DELAY_IN_MILLISECOND = 500;
  const handleSearchBoxChange = (event: BaseSyntheticEvent) => {
    debounce(() => setKeyword(event.target.value), null, DELAY_IN_MILLISECOND);
  };
  const { Get } = useRequest();
  const fetchItems = async () => {
    try {
      const { data: response } = await Get("/items", {
        params: {
          offset: 0,
          keyword: searchKeyword,
        },
      });
      return response?.data?.items ?? [];
    } catch {
      return [];
    }
  };
  const { data: items, isRefetching } = useQuery<Item[]>({
    refetchOnMount: false,
    initialData: [],
    queryKey: ["items", searchKeyword],
    queryFn: fetchItems,
  });

  return (
    <>
      <Downshift
        initialSelectedItem={initialValue}
        itemToString={(item) => (item ? item.name : "")}
        onChange={(item) => {
          if (!item) return;
          setItem(item);
        }}
      >
        {({
          getInputProps,
          isOpen,
          getItemProps,
          getMenuProps,
          highlightedIndex,
        }) => (
          <div
            className={
              className ? className + " relative" : "w-10/12  relative"
            }
          >
            <Label>{label ? label : "Search item"}</Label>
            <input
              {...getInputProps({
                placeholder: "Search item, can be book title, game, or device",
                onChange: handleSearchBoxChange,
                className:
                  "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500",
              })}
            />

            {isOpen && items.length > 0 ? (
              !isRefetching ? (
                <ul
                  {...getMenuProps({
                    className:
                      "w-full absolute list-none max-h-80 bg-white overflow-y-auto cursor-pointer border mt-2 rounded z-20 dark:bg-gray-700 dark:border-gray-600 small-scroll",
                  })}
                >
                  {items?.map((item, index) => {
                    return (
                      <li
                        {...getItemProps({
                          key: item.id,
                          item: item,
                          className: `p-3 border flex dark:border-gray-600 flex-col ${
                            index === highlightedIndex ? HIGHLIGHTED_CLASS : ""
                          }`,
                        })}
                      >
                        <span className="text-gray-600 dark:text-gray-100">
                          {item.name}
                        </span>
                        <small className="text-gray-300 capitalize">
                          {item.type}
                        </small>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="w-full absolute list-none h-52 overflow-y-auto cursor-pointer items-center flex justify-center bg-white border rounded mt-2 dark:bg-gray-700 z-20">
                  <ClipLoader color="#C5C5C5" />
                </div>
              )
            ) : null}

            {isOpen && items.length === 0 ? (
              <div className="w-full absolute list-none h-52 bg-white overflow-y-auto cursor-pointer border mt-2 rounded flex items-center justify-center dark:bg-gray-700 dark:border-none z-20">
                <span className="text-gray-400 text-sm">
                  No result found for {searchKeyword}
                </span>
              </div>
            ) : null}
          </div>
        )}
      </Downshift>
    </>
  );
};

export default ItemSearchBox;
