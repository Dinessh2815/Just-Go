"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default function Home() {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("hotels");
  const [listings, setListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [mainNavActive, setMainNavActive] = useState("home");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/auth/login");
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile?.username) {
        // If no username is found, fallback to email before '@'
        setUserData({
          username: session.user.email.split("@")[0],
        });
      } else {
        // Set the username from the profile
        setUserData({
          username: profile.username,
        });
      }
    };

    fetchData();
  }, [router, supabase]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch user session
      const {
        data: { session },
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
  }, [activeTab, searchQuery, router]);

  const fetchListingsWithSearch = async () => {
    const { data, error } = await supabase
      .from(activeTab)
      .select("*")
      .ilike("location", `%${searchQuery}%`)
      .order("created_at", { ascending: false });

    return { data, error };
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // The search is already triggered by the useEffect when searchQuery changes
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundImage: "url('/images/image 1@2x.png')" }}
    >
      <div className="min-h-screen bg-black/10">
        {/* Top Navigation */}
        <header className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link
            href="/"
            className="text-white text-2xl font-bold tracking-wider"
          >
            JUST GO
          </Link>
          <nav className="hidden md:flex space-x-8">
            {["HOME", "STAYS", "COMMUNITY", "SIGN UP"].map((item) => (
              <Link
                key={item}
                href="#"
                className={`text-white uppercase tracking-wider ${
                  item.toLowerCase() === mainNavActive
                    ? "border-b-2 border-white pb-1"
                    : ""
                }`}
                onClick={() => setMainNavActive(item.toLowerCase())}
              >
                {item}
              </Link>
            ))}
          </nav>
        </header>

        {/* Hero Section */}
        <div className="container mx-auto px-6 pt-20 pb-16">
          <div className="max-w-4xl">
            {/* Welcome Message */}
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Welcome, {userData?.username || "Guest"}!
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              THE WHOLE WORLD
              <br />
              AWAITS.
            </h2>

            {/* Search Bar */}
            <form
              onSubmit={handleSearch}
              className="flex w-full max-w-2xl glass-effect rounded-full overflow-hidden"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH FOR CITIES"
                className="w-full py-4 px-6 focus:outline-none text-gray-800 bg-transparent"
              />
              <button
                type="submit"
                className="bg-white text-gray-800 px-6 flex items-center justify-center font-bold"
              >
                SEARCH FOR CITIES
              </button>
            </form>
          </div>
        </div>

        {/* Categories Section */}
        <div className="container mx-auto px-6 pb-16">
          <h2 className="text-3xl font-bold text-white mb-8">TOP CATEGORIES</h2>

          <div className="flex flex-wrap gap-8 justify-center md:justify-between">
            {["HOTELS", "RESTAURANTS", "THINGS TO DO", "EVENTS"].map(
              (category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === "RESTAURANTS") setActiveTab("restaurants");
                    else if (category === "HOME") setActiveTab("hotels");
                  }}
                  className={`text-white text-xl uppercase tracking-wider pb-2 ${
                    (category === "HOME" && activeTab === "hotels") ||
                    (category === "RESTAURANTS" && activeTab === "restaurants")
                      ? "border-b-2 border-white"
                      : ""
                  }`}
                >
                  {category}
                </button>
              )
            )}
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length > 0 && (
          <div className="container mx-auto px-6 py-16 bg-white/90">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              {activeTab === "hotels"
                ? "Featured Hotels"
                : "Popular Restaurants"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {listings.map((item) => (
                <Link
                  key={item.id}
                  href={`/auth/${activeTab}/${item.id}`}
                  className="group block bg-white rounded-lg shadow hover:shadow-md transition-all"
                >
                  <div className="h-52 bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={item.image_url || "/placeholder-restaurant.png"}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-gray-600 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" /> {item.location}
                    </p>
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
        )}
      </div>
    </div>
  );
}
