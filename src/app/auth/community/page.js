"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchCities();
    fetchPosts();
  }, [selectedCity]);

  const fetchCities = async () => {
    const { data } = await supabase.from("city_tags").select("*").order("name");
    setCities(data || []);
  };

  const fetchPosts = async () => {
    let query = supabase
      .from("posts")
      .select(
        "id, title, content, image_url, created_at, likes_count, comments_count, post_cities(city_tags(name))"
      )
      .order("created_at", { ascending: false });
    if (selectedCity) {
      query = query.contains("post_cities", [
        { city_tags: { name: selectedCity } },
      ]);
    }
    const { data } = await query;
    setPosts(data || []);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Community Insights</h1>
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedCity(null)}
          className={`px-3 py-1 rounded-full ${
            !selectedCity ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All Cities
        </button>
        {cities.map((city) => (
          <button
            key={city.id}
            onClick={() => setSelectedCity(city.name)}
            className={`px-3 py-1 rounded-full ${
              selectedCity === city.name
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>
      <Link
        href="/auth/community/submit"
        className="mb-8 inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        + Create Post
      </Link>
      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.id} href={`/auth/community/post/${post.id}`}>
            <div className="bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition cursor-pointer">
              <div className="flex items-center gap-2 text-xs mb-2">
                {post.post_cities?.map((pc, i) => (
                  <span
                    key={i}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {pc.city_tags?.name}
                  </span>
                ))}
                <span className="text-gray-400 ml-auto">
                  {new Date(post.created_at).toLocaleString()}
                </span>
              </div>
              <h2 className="text-lg font-semibold mb-1">{post.title}</h2>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt=""
                  className="w-full max-h-56 object-cover rounded mb-2"
                />
              )}
              <p className="text-gray-700">
                {post.content?.slice(0, 120)}
                {post.content?.length > 120 && "..."}
              </p>
              <div className="flex gap-6 mt-2 text-sm text-gray-500">
                <span>👍 {post.likes_count}</span>
                <span>💬 {post.comments_count}</span>
              </div>
            </div>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500">No posts yet. Be the first to post!</p>
        )}
      </div>
    </div>
  );
}
