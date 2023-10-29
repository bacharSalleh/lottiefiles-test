/* eslint-disable */

export type AnimationNode = {
  lottieUrl?: string;
  jsonUrl?: string;
  createdBy?: { __typename?: "User"; firstName: string };
};

export type AnimationEdge = {
  cursor: string;
  node: AnimationNode;
}

export type SearchAnimationsQuery = {
  __typename?: "Query";
  searchPublicAnimations: {
    edges: Array<AnimationEdge>;
    pageInfo: {
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

export type SaveAnimationPayload = {
  cursor: string;
  lottieUrl: string;
  jsonUrl: string;
  createdByFirstName: string;
}
