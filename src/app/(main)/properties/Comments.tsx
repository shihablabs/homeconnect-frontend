
"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  propertyId: string;
  author: string;
  message: string; createdAt: string;
};

export default function Comments({ propertyId }: { propertyId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadComments() {
    try {
      setLoading(true);
      const res = await fetch(`/api/properties/${propertyId}/comments`, {
        cache: "no-store",
      });
      const data = await res.json();
      setComments(data.comments ?? []);
    } catch (e) {
      setError("Failed to load comments.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
    
  }, [propertyId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    setError(null);
    const optimistic: Comment = {
      id: `temp-${Math.random().toString(36).slice(2)}`,
      propertyId,
      author: author.trim() || "Anonymous",
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    
    setComments((prev) => [optimistic, ...prev]);

    try {
      const res = await fetch(`/api/properties/${propertyId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: optimistic.author, message: optimistic.message }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      const data = await res.json();

      
      setComments((prev) => {
        const withoutTemp = prev.filter((c) => c.id !== optimistic.id);
        return [data.comment, ...withoutTemp];
      });

      setMessage("");
      
    } catch (e) {
      
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setError("Could not post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="p-4">
      <h2 className="mb-3 text-lg font-semibold">Comments</h2>

      <form onSubmit={handleSubmit} className="mb-4 space-y-2">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="col-span-1 rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary sm:col-span-1"
          />
          <textarea
            placeholder="Write a comment..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="col-span-1 rounded-md border bg-background px-3 py-2 text-sm outline-none ring-0 focus:border-primary sm:col-span-2"
          />
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Be respectful. No spam or inappropriate content.
          </p>
          <button
            type="submit"
            disabled={submitting || message.trim().length < 2}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post comment"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-md border p-3">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-medium">{c.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-sm">{c.message}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}