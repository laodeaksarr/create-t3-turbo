import { RouterInputs, RouterOutputs } from "@aksar/api";
import { InfiniteData, QueryClient } from "@tanstack/react-query";

const updateCache = ({
  client,
  variables,
  data,
  action,
  input,
}: {
  client: QueryClient;
  input: RouterInputs["post"]["infinite"];
  variables: {
    postId: string;
  };
  data: {
    userId: string;
  };
  action: "like" | "unlike";
}) => {
  client.setQueryData(
    [
      ["post", "infinite"],
      {
        input,
        type: "infinite",
      },
    ],
    (oldData) => {
      const newData = oldData as InfiniteData<
        RouterOutputs["post"]["infinite"]
      >;

      const value = action === "like" ? 1 : -1;

      const newPosts = newData.pages.map((page) => {
        return {
          posts: page.posts.map((post) => {
            if (post.id === variables.postId) {
              return {
                ...post,
                likes: action === "like" ? [data.userId] : [],
                _count: {
                  likes: post._count.likes + value,
                },
              };
            }

            return post;
          }),
        };
      });

      return {
        ...newData,
        pages: newPosts,
      };
    },
  );
};

export default updateCache;
