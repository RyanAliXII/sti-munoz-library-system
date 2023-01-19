import { AuthorNumber } from "@definitions/types";
import { useState } from "react";

import { useBookAddFormContext } from "../BookAddFormContext";
import { Input } from "@components/forms/Forms";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";

import axiosClient from "@definitions/configs/axios";

import {
  BodyRow,
  HeadingRow,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
} from "@components/table/Table";

import { useEffect } from "react";

import useDebounce from "@hooks/useDebounce";

const BrowseTab = () => {
  const OFFSET_INCREMENT = 50;
  const { form, setFieldValue, removeFieldError } = useBookAddFormContext();
  const [searchKeyword, setKeyword] = useState("");
  const fetchCuttersTable = async ({ pageParam = 0 }) => {
    try {
      const { data: response } = await axiosClient.get(`/author-numbers/`, {
        params: {
          offset: pageParam,
          keyword: searchKeyword,
        },
      });
      return response.data.table ?? [];
    } catch (error) {
      return [];
    }
  };
  const queryClient = useQueryClient();
  const search = () => {
    queryClient.setQueryData(["authorNumbers"], () => {
      return {
        pageParams: [],
        pages: [],
      };
    });
    refetch();
  };
  const { data, fetchNextPage, refetch } = useInfiniteQuery<AuthorNumber[]>({
    queryFn: fetchCuttersTable,
    queryKey: ["authorNumbers"],
    refetchOnWindowFocus: false,
    getNextPageParam: (_, allPages) => {
      return allPages.length * OFFSET_INCREMENT;
    },
  });
  const debounceSearch = useDebounce();
  useEffect(() => {
    const MODAL_CLASS = ".react-responsive-modal-modal";
    const OFFSET = 30;
    const modal = document.querySelector(MODAL_CLASS);
    const listenScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      if (
        target.scrollTop + OFFSET >=
        target.scrollHeight - target.offsetHeight
      ) {
        fetchNextPage();
      }
    };
    modal?.addEventListener("scroll", listenScroll);
    return () => {
      modal?.removeEventListener("scroll", listenScroll);
    };
  }, []);
  const selectAuthorNumber = (cutter: Omit<AuthorNumber, "id">) => {
    setFieldValue("authorNumber", {
      number: cutter.number,
      surname: cutter.surname,
      value: `${cutter.surname.charAt(0)}${cutter.number}`,
    });

    removeFieldError("authorNumber.value");
  };
  return (
    <div>
      <div className="flex gap-2 items-center mb-3">
        <div>
          <Input
            label="Author Number"
            wrapperclass="flex items-center"
            className="disabled:bg-gray-100"
            type="text"
            readOnly
            disabled
            value={form.authorNumber.value}
          />
        </div>
        <Input
          wrapperclass="flex items-end h-14 mt-1"
          onChange={(event) => {
            setKeyword(event.target.value);
            debounceSearch(search, {}, 300);
          }}
          type="text"
          placeholder="Search..."
        ></Input>
      </div>

      <Table>
        <Thead>
          <HeadingRow>
            <Th></Th>
            <Th>Surname</Th>
            <Th>Number</Th>
          </HeadingRow>
        </Thead>

        <Tbody>
          {data?.pages.map((authorNumbers) => {
            return authorNumbers?.map((authorNumber, index) => {
              return (
                <BodyRow
                  key={authorNumber.surname}
                  onClick={() => {
                    selectAuthorNumber(authorNumber);
                  }}
                  className="cursor-pointer"
                >
                  <Td>
                    <Input
                      wrapperclass="flex items-center"
                      type="checkbox"
                      className="h-4"
                      readOnly
                      checked={
                        authorNumber.surname === form.authorNumber.surname
                          ? true
                          : false
                      }
                    ></Input>
                  </Td>
                  <Td>{authorNumber.surname}</Td>
                  <Td>{authorNumber.number}</Td>
                </BodyRow>
              );
            });
          })}
        </Tbody>
      </Table>
    </div>
  );
};

export default BrowseTab;
