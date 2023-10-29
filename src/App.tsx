import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Library from "./pages/library";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LibraryProvider } from "./hooks/libraryContext";

function App() {
  return (
    <LibraryProvider>
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/library" element={<Library />}></Route>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={1000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </LibraryProvider>
  );
}

export default App;
