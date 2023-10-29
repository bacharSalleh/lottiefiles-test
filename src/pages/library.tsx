import AnimationList from "../components/AnimationList";
import Spinner from "../components/Spinner";
import { useLibrary } from "../hooks/libraryContext";
import { Link } from "react-router-dom";

const Library = () => {
  const {animations} = useLibrary();

  return (
    <main className="min-h-screen flex flex-col">
      <section className="max-w-7xl w-full mx-auto pb-4 pt-4">
        <Link to="/">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Back to Main
          </button>
        </Link>
      </section>
      {!animations ? (
        <Spinner />
      ) : (
        <section className="max-w-7xl w-full mx-auto pb-20 pt-10">
          <AnimationList
            animations={animations}
            withsave={false}
            withremove={true}
          />
        </section>
      )}
    </main>
  );
};

export default Library;
