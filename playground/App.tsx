import { createResource, For, Show } from "solid-js";

import { tryCatch } from "../src";

type Post = {
  readonly id: number;
  readonly userId: number;
  readonly title: string;
  readonly body: string;
};

const fetchPosts = async () => {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  return response.json() as Promise<Post[]>;
};

const getData = async () => {
  const [error, data] = await tryCatch(fetchPosts);
  if (error) throw error;
  return data;
};

export const App = () => {
  const [data] = createResource(getData);

  return (
    <div>
      <div>Playground App</div>
      <Show when={data()} fallback={<div>Loading data</div>}>
        {(posts) => <For each={posts()}>{(post) => <div>{post.title}</div>}</For>}
      </Show>
    </div>
  );
};
