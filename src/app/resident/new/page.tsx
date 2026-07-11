"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Cleanliness",
  "Security",
  "Lift/Elevator",
  "Parking",
  "Noise",
  "Other",
];

export default function NewComplaintPage() {
  const router = useRouter();

  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("category", category);
      formData.append("description", description);

      if (photo) {
        formData.append("photo", photo);
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ??
            "Could not submit complaint."
        );
        return;
      }

      router.push(
        `/resident/complaint/${data.complaint.id}`
      );

      router.refresh();
    } catch {
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold mb-2">
          Raise a Complaint
        </h1>

        <p className="text-slate-500 mb-6">
          Fill in the details below. You may
          also upload a photo to help the
          maintenance team understand the
          issue better.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="label">
              Category
            </label>

            <select
              className="input"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              {CATEGORIES.map((category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Description
            </label>

            <textarea
              className="input"
              rows={5}
              placeholder="Describe the issue in detail..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              required
            />
          </div>

          <div>
            <label className="label">
              Upload Photo (Optional)
            </label>

            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(
                e: ChangeEvent<HTMLInputElement>
              ) =>
                setPhoto(
                  e.target.files?.[0] ?? null
                )
              }
            />

            <p className="text-xs text-slate-500 mt-2">
              Supported formats: JPG, PNG,
              JPEG
            </p>
          </div>

          {error && (
            <p className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn w-full"
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Submit Complaint"}
          </button>
        </form>
      </div>
    </div>
  );
}