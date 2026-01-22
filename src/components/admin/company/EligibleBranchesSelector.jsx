"use client";

export default function EligibleBranchesSelector({ branches, selected, error, onToggle }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Eligible Branches *</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
        {branches.map((b) => (
          <label
            key={b}
            className="flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
          >
            <input
              type="checkbox"
              checked={selected.includes(b)}
              onChange={() => onToggle(b)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <span className="text-gray-700">{b}</span>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
