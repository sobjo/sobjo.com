/** A row of segments, one per build step. Finished steps are dark. */
export function ProgressBar({ done, total }: { done: number; total: number }) {
  return (
    <div className="flex gap-[3px]" role="img" aria-label={`Progress: ${done} of ${total}`}>
      {Array.from({ length: total }, (_, step) => (
        <span key={step} className={`h-2 flex-1 rounded-sm ${step < done ? 'bg-ink' : 'bg-line'}`} />
      ))}
    </div>
  )
}

/** The full green bar shown for a finished project that has no step count. */
export function CompleteBar() {
  return (
    <div className="flex" role="img" aria-label="Progress: complete">
      <span className="h-2 flex-1 rounded-sm bg-moss" />
    </div>
  )
}
