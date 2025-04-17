"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PostDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const postId = Number(id);

        if (isNaN(postId)) {
          router.replace("/community");
          return;
        }

        // Fetch post with explicit inner joins
        const { data: postData, error: postError } = await supabase
          .from("posts")
          .select(
            `
            *,
            post_cities!inner(
              city_tags!inner(
                name
              )
            )
          `
          )
          .eq("id", postId)
          .single();

        if (postError || !postData) {
          router.replace("/community");
          return;
        }

        // Fetch comments with username
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(
            `
            *,
            profiles:user_id(
              username
            )
          `
          )
          .eq("post_id", postId)
          .order("created_at", { ascending: true });

        if (commentsError) {
          console.error("Error fetching comments:", commentsError);
        }

        setPost(postData);
        setComments(commentsData || []);
      } catch (err) {
        setError(err.message);
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    id && fetchData();
  }, [id, router]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase.from("comments").insert([
        {
          post_id: Number(id),
          content: comment,
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;

      // Optimistic update
      setComments((prev) => [
        ...prev,
        {
          content: comment,
          created_at: new Date().toISOString(),
          profiles: { username: session.user.email?.split("@")[0] },
          user_id: session.user.id,
        },
      ]);
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Add a function to handle liking the post
  const handleLikePost = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("likes")
        .insert([{ post_id: Number(id), user_id: session.user.id }]);

      if (error) throw error;

      // Optimistically update the likes count
      setPost((prev) => ({
        ...prev,
        likes_count: (prev.likes_count || 0) + 1,
      }));
    } catch (err) {
      setError(err.message);
      console.error("Error liking post:", err);
    }
  };

  // Add a function to handle liking a comment
  const handleLikeComment = async (commentId) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth/login");
        return;
      }

      const { error } = await supabase
        .from("likes")
        .insert([{ comment_id: commentId, user_id: session.user.id }]);

      if (error) throw error;

      // Optimistically update the likes count for the comment
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, likes_count: (c.likes_count || 0) + 1 }
            : c
        )
      );
    } catch (err) {
      setError(err.message);
      console.error("Error liking comment:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 text-xs mb-2">
          {post.post_cities?.map((pc, i) => (
            <span
              key={i}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
            >
              {pc.city_tags?.name || "Unknown"}
            </span>
          ))}
          <span className="text-gray-400 ml-auto">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-1">{post.title}</h2>
        {post.image_url && (
          <img
            src={post.image_url}
            alt=""
            className="w-full max-h-80 object-cover rounded mb-2"
          />
        )}
        <p className="text-gray-700">{post.content}</p>
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={handleLikePost}
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            👍 {post.likes_count || 0} Likes
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">Comments</h3>
        <form onSubmit={handleComment} className="mb-4 flex gap-2">
          <input
            className="flex-1 border rounded p-2"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Comment
          </button>
        </form>
        <div className="space-y-3">
          {comments.map((c, index) => (
            <div key={index} className="bg-gray-100 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">
                {new Date(c.created_at).toLocaleString()}
              </div>
              <div>{c.content}</div>
              <button
                onClick={() => handleLikeComment(c.id)}
                className="flex items-center gap-1 text-blue-600 hover:underline mt-2"
              >
                👍 {c.likes_count || 0} Likes
              </button>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
