// app/page.js
"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("hotels");
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, username")
        .eq("id", session.user.id)
        .single();

      // Set user data
      setUserData({
        name: profile?.name || "Guest",
        username: profile?.username || session.user.email.split("@")[0],
      });

      // Fetch listings with search query
      const { data, error } = await fetchListingsWithSearch();

      if (!error) setListings(data || []);
    };

    fetchData();
  }, [activeTab, searchQuery, router]); // Include searchQuery in dependency array

  const fetchListingsWithSearch = async () => {
    const { data, error } = await supabase
      .from(activeTab)
      .select("*")
      .ilike("location", `%${searchQuery}%`) // Use ilike for case-insensitive search
      .order("created_at", { ascending: false });

    return { data, error };
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-6">
        {/* Header */}
        <header className="mb-10 bg-white rounded-lg shadow-sm p-6">
          {userData && (
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {userData.name}!
            </h1>
          )}
        </header>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city"
            className="w-1/2 p-4 rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8 p-4">
          <div className="flex gap-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("hotels")}
              className={`pb-3 px-4 text-lg ${
                activeTab === "hotels"
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`pb-3 px-4 text-lg ${
                activeTab === "restaurants"
                  ? "border-b-2 border-blue-600 text-blue-600 font-medium"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Restaurants
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((item) => (
            <Link
              key={item.id}
              href={`/auth/${activeTab}/${item.id}`}
              className="group block bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <div className="h-52 bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={item.image_url || "/placeholder.png"}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {item.name}
                </h3>
                <p className="text-gray-600 mb-3">{item.location}</p>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-medium text-lg">
                    {Array(item.price_range).fill("$").join("")}
                  </span>
                  {activeTab === "restaurants" && (
                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                      {item.cuisine_type}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
