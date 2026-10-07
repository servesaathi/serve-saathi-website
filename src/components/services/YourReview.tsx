"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { useAdminQuery } from "@/lib/admin/useAdminQuery";
import { reviewService, type ProviderReview } from "@/lib/api/services/review.service";
import { getErrorMessage } from "@/lib/api/types";
import { useIsSignedIn } from "@/lib/useHydrated";
import { RatingStars } from "./RatingStars";

// The signed-in user's own review of a provider, above "Recent Feedback" on
// the detail page's Review tab. Contract (review.service.ts): one review per
// customer per provider, PUT creates or replaces it, GET /me returns null
// when there's none. After any write, router.refresh() re-renders the server
// page so the feedback list and the rating stat pick up the change.

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
const MAX_COMMENT = 1000;

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const name = useId();
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-[16px] leading-[22px] font-semibold text-text-primary">
        Your rating <span className="text-error">*</span>
      </legend>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={n}
              checked={value === n}
              onChange={() => onChange(n)}
              className="peer sr-only"
            />
            <span className="flex size-11 items-center justify-center rounded-control peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
              <Image
                src="/icons/services/star.svg"
                alt=""
                width={32}
                height={32}
                className={n <= value ? "" : "opacity-30 grayscale"}
              />
            </span>
            <span className="sr-only">
              {n} {n === 1 ? "star" : "stars"} — {RATING_LABELS[n]}
            </span>
          </label>
        ))}
        <span className="pl-2 text-[16px] leading-[22px] text-text-secondary" aria-hidden>
          {RATING_LABELS[value]}
        </span>
      </div>
    </fieldset>
  );
}

function ReviewForm({
  providerId,
  existing,
  onSaved,
  onCancel,
}: {
  providerId: string;
  existing: ProviderReview | null;
  onSaved: (review: ProviderReview) => void;
  onCancel?: () => void;
}) {
  const commentId = useId();
  const [rating, setRating] = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      setError("Please choose a star rating.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const trimmed = comment.trim();
      onSaved(await reviewService.upsert(providerId, { rating, ...(trimmed ? { comment: trimmed } : {}) }));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-card bg-bg-base p-4">
      <StarPicker value={rating} onChange={setRating} />

      <div className="flex flex-col gap-2">
        <label htmlFor={commentId} className="text-[16px] leading-[22px] font-semibold text-text-primary">
          Your experience <span className="font-normal text-text-tertiary">(optional)</span>
        </label>
        <textarea
          id={commentId}
          rows={4}
          maxLength={MAX_COMMENT}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What went well? What could be better?"
          className="w-full rounded-input border-[1.5px] border-border-hairline bg-bg-base px-4 py-3 text-[16px] leading-[22px] text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
        />
        <p className="self-end text-[13px] leading-[17px] text-text-muted">
          {comment.length}/{MAX_COMMENT}
        </p>
      </div>

      {error && (
        <p role="alert" className="text-[16px] leading-[22px] text-error">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" loading={saving} className="sm:flex-1">
          {existing ? "Update review" : "Submit review"}
        </Button>
        {onCancel && (
          <Button type="button" variant="light" onClick={onCancel} disabled={saving} className="sm:flex-1">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

function SignedInReview({ providerId, providerName }: { providerId: string; providerName: string }) {
  const router = useRouter();
  const { data, error, loading, reload } = useAdminQuery(`my-review-${providerId}`, () =>
    reviewService.getMine(providerId)
  );
  // Set after a write so the panel updates without waiting on a refetch;
  // undefined = trust the query.
  const [local, setLocal] = useState<ProviderReview | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const mine = local !== undefined ? local : data;

  if (loading && data === undefined) {
    return <div aria-busy className="h-32 animate-pulse rounded-card bg-bg-base" />;
  }
  if (error && data === undefined) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-bg-base p-4">
        <p className="text-[16px] leading-[22px] text-text-secondary">Couldn&apos;t load your review. {error}</p>
        <Button variant="light" onClick={reload}>
          Try again
        </Button>
      </div>
    );
  }

  function saved(review: ProviderReview) {
    setLocal(review);
    setEditing(false);
    router.refresh();
  }

  async function remove() {
    setDeleting(true);
    setDeleteError(null);
    try {
      await reviewService.remove(providerId);
      setLocal(null);
      setConfirmDelete(false);
      router.refresh();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  }

  if (!mine || editing) {
    return (
      <div className="flex flex-col gap-3">
        <h3 className="text-[20px] leading-7 font-semibold text-text-primary">
          {mine ? "Edit your review" : `Rate ${providerName}`}
        </h3>
        <ReviewForm
          providerId={providerId}
          existing={mine ?? null}
          onSaved={saved}
          onCancel={mine ? () => setEditing(false) : undefined}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[20px] leading-7 font-semibold text-text-primary">Your review</h3>
      <div className="flex flex-col gap-3 rounded-card border-[1.5px] border-border-card bg-bg-base p-4">
        <div className="flex items-center justify-between gap-4">
          <RatingStars count={Math.round(mine.rating)} />
          <p className="text-[16px] leading-5 text-text-muted">
            {new Date(mine.updatedAt ?? mine.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        {mine.comment && <p className="text-[18px] leading-7 text-text-secondary">{mine.comment}</p>}

        {confirmDelete ? (
          <div className="flex flex-col gap-3 border-t border-border-hairline pt-3">
            <p className="text-[16px] leading-[22px] text-text-secondary">Delete your review? This can&apos;t be undone.</p>
            {deleteError && (
              <p role="alert" className="text-[16px] leading-[22px] text-error">
                {deleteError}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="destructive" loading={deleting} onClick={remove} className="sm:flex-1">
                Delete review
              </Button>
              <Button variant="light" disabled={deleting} onClick={() => setConfirmDelete(false)} className="sm:flex-1">
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-6">
            <Button variant="hyperlink" onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button variant="hyperlink" onClick={() => setConfirmDelete(true)} className="text-error">
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function YourReview({ providerId, providerName }: { providerId: string; providerName: string }) {
  const signedIn = useIsSignedIn();

  if (signedIn === null) return null;

  if (!signedIn) {
    return (
      <div className="flex flex-col items-start gap-3 rounded-card bg-bg-base p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[18px] leading-7 text-text-secondary">Used {providerName}? Sign in to share your experience.</p>
        <Button href={`/verify-phone?next=${encodeURIComponent(`/services/${providerId}`)}`} variant="primary">
          Sign in to review
        </Button>
      </div>
    );
  }

  return <SignedInReview providerId={providerId} providerName={providerName} />;
}

export default YourReview;
