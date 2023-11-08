import ReactPaginate, { ReactPaginateProps } from "react-paginate";

interface PaginationProps extends ReactPaginateProps {
  isHidden?: boolean;
}
const CustomPagination = (props: PaginationProps) => {
  const hiddenClass = props.isHidden ? "hidden" : "";
  return (
    <ReactPaginate
      {...props}
      nextLabel="Next"
      pageLinkClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      pageRangeDisplayed={5}
      pageCount={props.pageCount}
      forcePage={props.forcePage}
      disabledClassName="opacity-60 pointer-events-none"
      onPageChange={props.onPageChange}
      className={"inline-flex space-x-px text-sm" + " " + hiddenClass}
      previousLabel="Previous"
      previousClassName="flex items-center justify-center px-4 h-10 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      nextClassName="flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      activeLinkClassName="text-blue-700 bg-blue-200 dark:bg-blue-700 dark:text-gray-100"
      renderOnZeroPageCount={null}
    />
  );
};

export const CustomPaginationMd = (props: PaginationProps) => {
  const hiddenClass = props.isHidden ? "hidden" : "";
  return (
    <ReactPaginate
      {...props}
      nextLabel="Next"
      pageLinkClassName="flex items-center justify-center px-3 h-8 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      pageRangeDisplayed={5}
      pageCount={props.pageCount}
      forcePage={props.forcePage}
      disabledClassName="opacity-60 pointer-events-none"
      onPageChange={props.onPageChange}
      className={"inline-flex space-x-px text-sm" + " " + hiddenClass}
      previousLabel="Previous"
      previousClassName="flex items-center justify-center px-3 h-8 ml-0  text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      nextClassName="flex items-center justify-center px-3 h-8  text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      activeLinkClassName="text-blue-700 bg-blue-200 dark:bg-blue-700 dark:text-gray-100"
      renderOnZeroPageCount={null}
    />
  );
};

export const CustomPaginationSmall = (props: PaginationProps) => {
  const hiddenClass = props.isHidden ? "hidden" : "";
  return (
    <ReactPaginate
      {...props}
      nextLabel="Next"
      pageLinkClassName="flex items-center justify-center px-2 h-7 text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      pageRangeDisplayed={5}
      pageCount={props.pageCount}
      forcePage={props.forcePage}
      disabledClassName="opacity-60 pointer-events-none"
      onPageChange={props.onPageChange}
      className={"inline-flex space-x-px text-sm" + " " + hiddenClass}
      previousLabel="Previous"
      previousClassName="flex items-center justify-center px-2 h-7 ml-0  text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      nextClassName="flex items-center justify-center px-2 h-7  text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      activeLinkClassName="text-blue-700 bg-blue-200 dark:bg-blue-700 dark:text-gray-100"
      renderOnZeroPageCount={null}
    />
  );
};

export default CustomPagination;
