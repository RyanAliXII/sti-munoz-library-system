import React from "react";
import HeaderIcon from "@assets/images/library-icon.svg";
import { Link } from "react-router-dom";
const Search = () => {
  return (
    <div className="w-full flex flex-col justify-center items-center h-64  mt-32 gap-3">
      <div>
        <img src={HeaderIcon} alt="library-logo" className="w-28 ml-2"></img>
      </div>
      <div className="w-11/12 md:w-8/12" style={{ maxWidth: "826px" }}>
        <input
          type="text"
          className="input input-bordered w-full"
          // className="border w-full text-xs py-2 px-1 md:py-3 md:px-2 md:text-sm rounded text-gray-600 focus:outline-yellow-400"
          placeholder=" Search Books"
        ></input>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn btn-primary"
          // className="py-1.5 px-4 text-xs bg-blue-500 text-white rounded md:py-2.5 md:px-5 md:text-sm"
        >
          Search
        </button>
        <Link
          to="/catalog"
          className="btn btn-outline"
          // className="py-1.5 px-4 text-xs border text-gray-400 rounded md:py-2.5 md:px-5 md:text-sm"
        >
          Browse
        </Link>
      </div>
    </div>
  );
};

export default Search;
