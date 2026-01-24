type Logo = { name: string; imagePath?: string }

/**
 * SlidingLogos: horizontal auto-scrolling logo strip.
 * Provide either imagePath (preferred) or name fallback text.
 */
export default function SlidingLogos({ logos, speed = 25 }: { logos: Logo[]; speed?: number }) {
  // Duplicate to create seamless loop
  const track = [...logos, ...logos]

  return (
    <div className="relative w-full overflow-hidden">
      {/* optional fade edges */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-blue-50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-blue-50 to-transparent z-10" />

      <div
        className="flex w-max animate-marquee gap-8 py-4"
        style={{ animationDuration: `${speed}s` }}
      >
        {track.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex items-center justify-center min-w-[140px] h-12 rounded-lg border border-gray-200 bg-white px-6 opacity-70 hover:opacity-100 transition shadow-sm"
          >
            {logo.imagePath ? (
              <img src={logo.imagePath} alt={logo.name} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-lg font-semibold text-gray-700">{logo.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
