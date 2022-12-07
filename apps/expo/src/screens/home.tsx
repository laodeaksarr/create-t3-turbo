import React, { useEffect } from "react";

import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { FlashList } from "@shopify/flash-list";
import type { RouterInputs, RouterOutputs } from "@aksar/api";

import { trpc } from "../utils/trpc";
import { updateCache, useScrollPosition } from "@aksar/utils";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

const LIMIT = 10;

const PostCard: React.FC<{
  post: RouterOutputs["post"]["infinite"]["posts"][number];
  client: QueryClient;
  input: RouterInputs["post"]["infinite"];
}> = ({ post, client, input }) => {
  const likeMutation = trpc.post.like.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, input, action: "like" });
    },
  }).mutateAsync;
  const unlikeMutation = trpc.post.unlike.useMutation({
    onSuccess: (data, variables) => {
      updateCache({ client, data, variables, input, action: "unlike" });
    },
  }).mutateAsync;

  const hasLiked = post.likes.length > 0;

  return (
    <View className="rounded-lg border-2 border-gray-500 p-4">
      <Text className="text-xl font-semibold text-[#cc66ff]">{post.title}</Text>
      <Text className="text-white">{post.content}</Text>

    </View>
  );
};

const CreatePost: React.FC = () => {
  const utils = trpc.useContext();
  const { mutate } = trpc.post.create.useMutation({
    async onSuccess() {
      await utils.post.all.invalidate();
    },
  });

  const [title, onChangeTitle] = React.useState("");
  const [content, onChangeContent] = React.useState("");

  return (
    <View className="flex flex-col border-t-2 border-gray-500 p-4">
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeTitle}
        placeholder="Title"
      />
      <TextInput
        className="mb-2 rounded border-2 border-gray-500 p-2 text-white"
        onChangeText={onChangeContent}
        placeholder="Content"
      />
      <TouchableOpacity
        className="rounded bg-[#cc66ff] p-2"
        onPress={() => {
          mutate({
            title,
            content,
          });
        }}
      >
        <Text className="font-semibold text-white">Publish post</Text>
      </TouchableOpacity>
    </View>
  );
};

export const HomeScreen = ({
  where = {},
}: {
  where: RouterInputs["post"]["infinite"]["where"];
}) => {
  const [showPost, setShowPost] = React.useState<string | null>(null);

  const scrollPosition = useScrollPosition();

  const { data, hasNextPage, fetchNextPage, isFetching } =
    trpc.post.infinite.useInfiniteQuery(
      { limit: LIMIT, where },
      { getNextPageParam: (lastPage) => lastPage.nextCursor },
    );

  const client = useQueryClient();

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  useEffect(() => {
    if (scrollPosition > 90 && hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [scrollPosition, hasNextPage, isFetching, fetchNextPage]);

  return (
    <SafeAreaView className="bg-[#2e026d] bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <View className="h-full w-full p-4">
        <Text className="mx-auto pb-2 text-5xl font-bold text-white">
          Create <Text className="text-[#cc66ff]">T3</Text> Turbo
        </Text>

        <View className="py-2">
          {showPost ? (
            <Text className="text-white">
              <Text className="font-semibold">Selected post:</Text>
              {showPost}
            </Text>
          ) : (
            <Text className="font-semibold italic text-white">
              Press on a post
            </Text>
          )}
        </View>

        <FlashList
          data={posts}
          estimatedItemSize={20}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={(p) => (
            <TouchableOpacity onPress={() => setShowPost(p.item.id)}>
              <PostCard
                post={p.item}
                client={client}
                input={{
                  where,
                  limit: LIMIT,
                }}
              />
            </TouchableOpacity>
          )}
        />
        <CreatePost />
      </View>
    </SafeAreaView>
  );
};
