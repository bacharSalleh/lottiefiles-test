import { Player } from "@lottiefiles/react-lottie-player";
import { AnimationEdge } from "../helpers/types";
import { useLibrary } from "../hooks/libraryContext";
import { toast } from "react-toastify";

type AnimaitionListProps = {
  animations: AnimationEdge[];
  withsave: boolean;
  withremove: boolean;
};

const AnimationList = ({
  animations,
  withsave,
  withremove,
}: AnimaitionListProps) => {
  const { removeAnimation, saveAnimation } = useLibrary();

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      {animations.map((animation) => (
        <div
          key={animation.cursor}
          className="max-w-xs rounded overflow-hidden shadow-lg p-2 border bg-gray-100 border-gray-200"
        >
          <Player
            autoplay
            loop
            speed={0.7}
            src={animation.node.jsonUrl || ""}
            style={{ height: "300px", width: "300px" }}
          />
          {withsave && (
            <button
              onClick={async () => {
                if (await saveAnimation(animation)) {
                  toast.success("animation saved");
                } else {
                  toast.error("animation exist before");
                }
              }}
              className="bg-blue-500 w-full hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Save to Library
            </button>
          )}
          {withremove && (
            <button
              onClick={() => {
                toast.success("animation removed");
                removeAnimation(animation);
              }}
              className="bg-red-500 w-full hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4"
            >
              Remove from Library
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default AnimationList;
