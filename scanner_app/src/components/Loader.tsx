import Ellipsis from "../assets/images/Ellipsis.svg";

const Loader = () => {
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto h-screen lg:py-0">
        <img src={Ellipsis}></img>
      </div>
    </section>
  );
};

export default Loader;
