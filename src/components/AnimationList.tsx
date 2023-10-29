import { Player } from "@lottiefiles/react-lottie-player";
import { SearchAnimationsQuery } from "../helpers/types";

type AnimaitionListProps = {
  animations: SearchAnimationsQuery;
};

const AnimationList = ({ animations }: AnimaitionListProps) => {
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
      {animations.searchPublicAnimations.edges.map((animation) => (
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
          <div className="px-6 py-2">
            <div className="font-bold text-xl mb-2">
              {animation.node.createdBy?.firstName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimationList;
