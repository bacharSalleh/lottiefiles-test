/* eslint-disable */

export type SearchAnimationsQuery = {
  __typename?: "Query";
  searchPublicAnimations: {
    __typename?: "PublicAnimationConnection";
    edges: Array<{
      __typename?: "PublicAnimationEdge";
      cursor: string;
      node: {
        __typename?: "PublicAnimation";
        lottieUrl?: string;
        jsonUrl?: string;
        createdBy?: { __typename?: "User"; firstName: string };
      };
    }>;
    pageInfo: {
      __typename?: "PageInfo";
      endCursor?: string;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
      startCursor?: string;
    };
  };
};

export type SearchAnimationsQueryVariables = {
  query: string;
  first?: number;
  after?: string;
};


export type SearchPublicAnimations = Pick<
  SearchAnimationsQuery,
  "searchPublicAnimations"
>;