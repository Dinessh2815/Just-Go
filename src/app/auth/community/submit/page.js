"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchCities = async () => {
      const { data, error } = await supabase
        .from("city_tags")
        .select("id, name")
        .order("name");

      if (error) {
        setError("Failed to load cities. Please refresh the page.");
        return;
      }
      setCities(data);
    };

    fetchCities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setUploading(true);

    try {
      // 1. Get current user session
      const {
        data: { session },
        error: authError,
      } = await supabase.auth.getSession();

      if (authError || !session?.user) {
        throw new Error("You must be logged in to create a post");
      }

      // 2. Upload image if exists
      let image_url = null;
      if (image) {
        const fileExt = image.name.split(".").pop();
        const filePath = `posts/${session.user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(filePath, image);

        if (uploadError)
          throw new Error("Image upload failed: " + uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(filePath);

        image_url = publicUrl;
      }

      // 3. Create post
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert([
          {
            title,
            content,
            image_url,
            user_id: session.user.id,
          },
        ])
        .select("id")
        .single();

      if (postError)
        throw new Error("Failed to create post: " + postError.message);

      // 4. Link to city (convert city_id to integer)
      if (selectedCityId) {
        const cityId = parseInt(selectedCityId);
        if (isNaN(cityId)) throw new Error("Invalid city selection");

        const { error: linkError } = await supabase.from("post_cities").insert([
          {
            post_id: postData.id,
            city_id: cityId,
          },
        ]);

        if (linkError)
          throw new Error("Failed to link post to city: " + linkError.message);
      }

      // 5. Redirect to community feed
      router.push("/auth/community");
      router.refresh(); // Ensure new post appears immediately
    } catch (err) {
      setError(err.message);
      console.error("Submission error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Create a Post</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <input
          className="w-full border rounded p-2"
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          required
        />

        <textarea
          className="w-full border rounded p-2"
          placeholder="Share your experience..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />

        <select
          className="w-full border rounded p-2"
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          required
        >
          <option value="">Select a city</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>

        <div className="form-group">
          <label className="block mb-2 text-sm font-medium">
            Optional Image Upload:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? "Creating Post..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
}
