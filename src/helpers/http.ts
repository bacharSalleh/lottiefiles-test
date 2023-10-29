import {
  SaveAnimationPayload,
  SearchAnimationsQuery,
  SearchAnimationsQueryVariables,
  SearchPublicAnimations,
} from "./types";


const BASE_URL = import.meta.env.VITE_API_URL || ""


export async function searchForAnimations({
  query,
  first,
  after,
}: SearchAnimationsQueryVariables): Promise<SearchPublicAnimations> {
  const graphqlQuery = {
    operationName: "searchAnimations",
    query: `
        query searchAnimations(
            $query: String!
            $first: Int
            $after: String
          ) {
            searchPublicAnimations(
              query: $query
              first: $first
              after: $after
            ) {
              edges {
                cursor
                node {
                  lottieUrl
                  jsonUrl
                  imageUrl
                  createdBy {
                    firstName
                  }
                }
              }
              pageInfo {
                endCursor
                hasNextPage
                hasPreviousPage
                startCursor
              }
            }
          }
        `,
    variables: { query, first, after },
  };

  const response = await postSearch(JSON.stringify(graphqlQuery));

  if (!response.ok) {
    const msg = await response.text();
    throw new Error(msg, {
      cause: response.status,
    });
  }

  const result: { data: SearchAnimationsQuery } = await response.json();

  return { searchPublicAnimations: result.data.searchPublicAnimations };
}

export async function postSearch(body: string) {
  return fetch("https://graphql.lottiefiles.com/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  });
}

export async function saveAnimationToServer(
  animationData: SaveAnimationPayload
) {
  return fetch(`${BASE_URL}/api`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(animationData),
  });
}

export async function removeAnimationFromServer(cursor: string) {
  return fetch(`${BASE_URL}/api/${cursor}`, {
    method: "DELETE",
  });
}
