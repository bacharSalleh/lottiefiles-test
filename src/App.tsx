import debounce from "lodash.debounce";
import { useCallback, useState } from "react";
import AnimationList from "./components/AnimationList";
import { useLottieAnimations } from "./hooks/useLottieAnimations";
import Spinner from "./components/Spinner";

function App() {
  const [query, setQuery] = useState("");
  const debouncedSetQuery = useCallback(
    debounce((value) => setQuery(value), 600),
    []
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSetQuery(event.target.value);
  };

  const [fetchingData, animations, error, nextPage, prevPage] =
    useLottieAnimations({ query });

  const hasNextPage = animations?.searchPublicAnimations.pageInfo.hasNextPage;
  const hasPrevPage =
    animations?.searchPublicAnimations.pageInfo.hasPreviousPage;
  const isWaitingNetwork = error && error.cause === 503;

  return (
    <main className="min-h-screen flex flex-col">
      <section className="max-w-7xl w-full mx-auto pt-20 pb-10">
        <div className="flex justify-center p-2">
          <input
            className="shadow bg-white appearance-none border rounded w-full max-w-3xl py-3 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            placeholder="Search..."
            onChange={handleInputChange}
          />
        </div>
      </section>

      {fetchingData ? (
        <Spinner />
      ) : (
        <section className="max-w-7xl w-full mx-auto pb-20 pt-10">
          {!animations?.searchPublicAnimations ? (
            <></>
          ) : (
            <AnimationList animations={animations} />
          )}

          <div className="flex justify-center mt-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded mr-4"
              onClick={prevPage}
              disabled={!hasPrevPage} // Disable Back button on first page
            >
              Back
            </button>

            <button
              className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-2 px-4 rounded"
              onClick={nextPage}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </section>
      )}

      {isWaitingNetwork ? (
        <div className="fixed inset-0 bg-gray-200 opacity-90 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded shadow-lg text-center">
            <p className="mb-4 text-xl font-bold">Waiting for network...</p>
            <p className="text-gray-700">
              Please wait while we retry fetching the data.
            </p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
