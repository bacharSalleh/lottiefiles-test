import { useCallback, useEffect, useState } from "react";
import { searchForAnimations } from "../helpers/http";
import {
  SearchAnimationsQueryVariables,
  SearchPublicAnimations,
} from "../helpers/types";
import { BACKGROUND_SEARCH_QUERY_RESULT } from "../helpers/constants";

export function useLottieAnimations({
  query,
}: Pick<SearchAnimationsQueryVariables, "query">) {
  const [data, setData] = useState<SearchPublicAnimations | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<Error | null>();
  const [page, setPage] = useState(0);

  const nextPage = useCallback(() => {
    setPage((prevPage) => prevPage + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage((prevPage) => prevPage - 1);
  }, []);

  const storeNextPageInfo = useCallback(
    (data: SearchPublicAnimations) => {
      const { hasNextPage, endCursor } = data.searchPublicAnimations.pageInfo;
      if (hasNextPage) {
        Page.savePage(page + 1, {
          first: 10,
          after: endCursor,
        });
      }
    },
    [page]
  );

  useEffect(() => {
    const pageMeta = Page.getPage(page);
    setFetching(true);
   
    searchForAnimations({ query, ...pageMeta })
      .then((data) => {
        setError(null);
        setData(data);
        storeNextPageInfo(data);
      })
      .catch(setError)
      .finally(() => setFetching(false));
  }, [page, query, storeNextPageInfo]);

  useEffect(() => {
    function handleServiceWorkerMessage(
      event: MessageEvent<{ type: string; msg: SearchPublicAnimations }>
    ) {
      if (event.data.type === BACKGROUND_SEARCH_QUERY_RESULT) {
        const searchData = event.data.msg;
        setError(null);
        setData(searchData);
        storeNextPageInfo(searchData);
      }
    }

    navigator.serviceWorker.addEventListener(
      "message",
      handleServiceWorkerMessage
    );

    return () => {
      navigator.serviceWorker.removeEventListener(
        "message",
        handleServiceWorkerMessage
      );
    };
  }, [page, storeNextPageInfo]);

  return [fetching, data, error, nextPage, prevPage] as const;
}

type PageInfo = Pick<SearchAnimationsQueryVariables, "after" | "first">;

class Page {
  static savePage(pageNumber: number, pageInfo: PageInfo) {
    localStorage.setItem(`page_${pageNumber}`, JSON.stringify(pageInfo));
  }

  static getPage(pageNumber: number): PageInfo {
    if (pageNumber === 0) return this.PAGE_0;
    const pageInfo = localStorage.getItem(`page_${pageNumber}`);
    return pageInfo ? JSON.parse(pageInfo) : null;
  }

  static PAGE_0: PageInfo = {
    first: 10,
  };
}
