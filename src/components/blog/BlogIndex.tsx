"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  category: string;
  kind: string;
  meta: string;
  date: string;
};

type Props = {
  posts: BlogPost[];
  categories: string[];
};

export function BlogIndex({ posts, categories }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filters = ["All", ...categories];

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: posts.length };
    for (const c of categories) {
      map[c] = posts.filter((p) => p.category === c).length;
    }
    return map;
  }, [posts, categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const inCategory = category === "All" || p.category === category;
      const inQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return inCategory && inQuery;
    });
  }, [posts, query, category]);

  return (
    <div className="mt-10">
      {/* Search */}
      <div className="flex items-center gap-3 border-b border-ink/25 pb-2 focus-within:border-ink">
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          className="h-4 w-4 flex-none text-ink/40"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <circle cx="9" cy="9" r="6" />
          <path d="m14 14 3.5 3.5" strokeLinecap="round" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search guides — mortgages, surveys, stamp duty…"
          aria-label="Search home buying guides"
          className="flex-1 bg-transparent py-2 text-base text-ink placeholder:text-ink/35 focus:outline-none"
        />
      </div>

      {/* Category filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((c) => {
          const isActive = c === category;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={isActive}
              className={
                isActive
                  ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-bone"
                  : "rounded-full border border-ink/20 px-3.5 py-1.5 text-xs font-medium text-ink/65 transition-colors hover:border-ink/40"
              }
            >
              {c}
              <span className={isActive ? "text-bone/60" : "text-ink/35"}>
                {" "}
                {counts[c] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/guides/${p.slug}`}
                className="flex h-full flex-col rounded-2xl border border-ink/10 bg-bone-50 p-5 transition-colors hover:border-ink/30 hover:bg-bone sm:p-6"
              >
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-ink/50">
                    {p.kind}
                  </span>
                  <span className="text-[11px] text-ink/40">{p.category}</span>
                </div>
                <p className="mt-3 font-serif text-xl leading-snug tracking-tightish text-ink sm:text-2xl">
                  {p.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink/60">
                  {p.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-ink/45">{p.meta}</span>
                  <span className="text-xs font-medium text-ink/45">
                    Read the guide →
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-10 rounded-2xl border border-dashed border-ink/15 p-10 text-center">
          <p className="text-ink/70">
            No guides match “{query}”.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
            className="mt-3 text-sm font-medium text-accent-400 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </div>
  );
}
