import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getPostById } from "@/lib/supabase/actions/posts";
import EditPostForm from "./EditPostForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect(`/posts/${id}`);
  }

  const post = await getPostById(id);

  if (!post) {
    redirect("/posts");
  }

  if (post.author_id !== userId) {
    redirect(`/posts/${id}`);
  }

  return <EditPostForm post={post} />;
}
