/** The cardboard box mark, with an orange cat peeking out. `withTape` adds the strip of tape used in the footer. */
export function Logo({ size = 28, withTape = false }: { size?: number; withTape?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="flex-none">
      {/* open flaps at the back */}
      <path d="M4 14L16 8L14 5.5L2 11.5Z" fill="#B57E45" />
      <path d="M28 14L16 8L18 5.5L30 11.5Z" fill="#C9925A" />
      {/* inside of the box */}
      <path d="M4 14L16 8L28 14L16 20Z" fill="#5E3B1C" />
      {/* the cat */}
      <path d="M10.2 10.5L10.6 3.6L14.6 7.4Z" fill="#E8913A" />
      <path d="M21.8 10.5L21.4 3.6L17.4 7.4Z" fill="#E8913A" />
      <path d="M11.2 8.6L11.4 5.4L13.3 7.2Z" fill="#F2A07B" />
      <path d="M20.8 8.6L20.6 5.4L18.7 7.2Z" fill="#F2A07B" />
      <circle cx="16" cy="12.6" r="6.6" fill="#E8913A" />
      <path d="M14.7 6.9v1.6M16 6.6v1.9M17.3 6.9v1.6" stroke="#C46A1E" strokeWidth="0.9" strokeLinecap="round" />
      <path d="M12 12q1.3-1.5 2.6 0M17.4 12q1.3-1.5 2.6 0" stroke="#2A2F36" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="11.9" cy="14.3" r="1.1" fill="#F2A07B" opacity="0.8" />
      <circle cx="20.1" cy="14.3" r="1.1" fill="#F2A07B" opacity="0.8" />
      <path d="M15.1 13.9h1.8L16 15Z" fill="#D9665A" />
      {/* front of the box, hiding the bottom of the cat */}
      <path d="M4 14L16 20V30L4 24Z" fill="#D49A5E" />
      <path d="M28 14L16 20V30L28 24Z" fill="#B9844A" />
      {withTape && <path d="M9 16.5L11 17.5V27.5L9 26.5Z" fill="#E9CFA6" />}
      {/* paws on the rim */}
      <ellipse cx="12.4" cy="18" rx="1.9" ry="1.3" fill="#F2A65A" />
      <ellipse cx="19.6" cy="18" rx="1.9" ry="1.3" fill="#F2A65A" />
    </svg>
  )
}
