import { PropsWithChildren, useEffect, useState } from "react";
import {
  removeAnimationFromServer,
  saveAnimationToServer,
} from "../helpers/http";
import { AnimationEdge } from "../helpers/types";
import { createContext, useContext } from "react";

// Create a Context
type LibraryContextType = {
  animations: AnimationEdge[];
  saveAnimation: (animationData: AnimationEdge) => Promise<boolean>;
  removeAnimation: (animationData: AnimationEdge) => Promise<boolean>;
};
const LibraryContext = createContext<LibraryContextType>(null!);

export const useLibrary = () => {
  return useContext(LibraryContext);
};

export const LibraryProvider = ({ children }: PropsWithChildren) => {
  const [animations, setAnimations] = useState<AnimationEdge[]>([]);

  useEffect(() => {
    const storedAnimations: AnimationEdge[] = JSON.parse(
      localStorage.getItem("library") || "[]"
    );
    setAnimations(storedAnimations);
  }, []);

  async function saveAnimation(animationData: AnimationEdge) {
    const library: AnimationEdge[] = JSON.parse(
      localStorage.getItem("library") || "[]"
    );
    const isPresent = library.find(
      (animation) => animation.cursor === animationData.cursor
    );

    if (!isPresent) {
      library.push(animationData);
      localStorage.setItem("library", JSON.stringify(library));
      setAnimations(library);

      saveAnimationToServer({
        createdByFirstName: animationData.node.createdBy?.firstName || "",
        cursor: animationData.cursor,
        jsonUrl: animationData.node.jsonUrl || "",
        lottieUrl: animationData.node.lottieUrl || "",
      });
    }

    return !isPresent;
  }

  async function removeAnimation(animationData: AnimationEdge) {
    const library: AnimationEdge[] = JSON.parse(
      localStorage.getItem("library") || "[]"
    );
    const updatedLibrary = library.filter(
      (animation) => animation.cursor !== animationData.cursor
    );
    localStorage.setItem("library", JSON.stringify(updatedLibrary));
    setAnimations(updatedLibrary);

    removeAnimationFromServer(animationData.cursor);
    return true;
  }

  return (
    <LibraryContext.Provider
      value={{ animations, saveAnimation, removeAnimation }}
    >
      {children}
    </LibraryContext.Provider>
  );
};
