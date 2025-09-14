"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loginSuccess } from "@/store/authSlice";

const CreateGigPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    tags: "",
    startingPrice: "",
    deliveryDays: "",
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/auth/login");
        return;
      }

      if (!isAuthenticated || !user) {
        try {
          const axios = (await import("axios")).default;
          const response = await axios.get("http://localhost:8080/api/auth/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          dispatch(
            loginSuccess({
              user: response.data,
              accessToken: accessToken,
              refreshToken: localStorage.getItem("refreshToken") || "",
            })
          );

          if (response.data.role !== "FREELANCER") {
            router.push("/dashboard");
            return;
          }
        } catch {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          router.push("/auth/login");
          return;
        }
      } else if (user.role !== "FREELANCER") {
        router.push("/dashboard");
        return;
      }

      setAuthLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const axios = (await import("axios")).default;
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        setError("You are not authenticated. Please login again.");
        router.push("/auth/login");
        return;
      }

      const payload = {
        ...form,
        tags: form.tags
          .split(",")
          .map((tag: string) => tag.trim())
          .filter(Boolean),
        startingPrice: Number(form.startingPrice),
        deliveryDays: Number(form.deliveryDays),
      };

      const response = await axios.post(
        "http://localhost:8080/api/gigs/my-gigs",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setSuccess("🚀 Gig posted successfully!");
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/auth/login");
      } else {
        setError(err.response?.data?.message || "Failed to post gig.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-green-100 px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-2xl p-10 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Gig
          </h2>
          <p className="text-gray-500 text-sm">
            Share your skills, attract clients, and start earning today.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-sm text-center"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-600 text-sm text-center"
            >
              {success}
            </motion.div>
          )}

          {["title", "category", "tags"].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field === "tags" ? "Tags (comma separated)" : field}
              </label>
              <Input
                name={field}
                type="text"
                placeholder={
                  field === "title"
                    ? "I will design a professional logo for your business"
                    : field === "category"
                    ? "e.g., Graphic Design, Web Development"
                    : "logo design, branding, vector graphics"
                }
                value={(form as any)[field]}
                onChange={handleChange}
                required={field !== "tags"}
                className="w-full"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Describe your gig and what makes it special..."
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "startingPrice", label: "Starting Price ($)", min: 5 },
              { name: "deliveryDays", label: "Delivery Days", min: 1 },
            ].map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {f.label}
                </label>
                <Input
                  name={f.name}
                  type="number"
                  placeholder={f.min.toString()}
                  value={(form as any)[f.name]}
                  onChange={handleChange}
                  required
                  min={f.min}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-500 to-green-400 text-white font-semibold py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-green-500 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Creating Gig..." : "Create Gig"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-gray-500 hover:text-gray-800 text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateGigPage;
