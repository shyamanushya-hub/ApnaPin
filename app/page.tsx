// Home page — PIN code search
// TODO (Phase 1, Step 3): wire up to DB once locations are seeded

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find your locality
        </h1>
        <p className="text-gray-500 text-base">
          Verified information about every PIN code, area, and neighbourhood in India.
        </p>
      </div>

      <form action="/search" method="GET" className="w-full max-w-sm">
        <div className="flex gap-2">
          <input
            type="text"
            name="pin"
            placeholder="Enter PIN code (e.g. 500032)"
            maxLength={6}
            pattern="[0-9]{6}"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-lg
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="bg-brand-blue text-white px-5 py-3 rounded-lg font-medium
                       hover:bg-blue-800 transition-colors"
          >
            Go
          </button>
        </div>
      </form>

      <p className="text-xs text-gray-400">
        Covers all 19,101 PIN codes across India
      </p>
    </div>
  )
}
