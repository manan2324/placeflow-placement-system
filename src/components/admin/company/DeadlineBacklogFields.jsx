"use client";

export default function DeadlineBacklogFields({ applicationDeadline, backlogAllowed, error, onDeadlineChange, onBacklogChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline *</label>
        <input
          type="datetime-local"
          value={applicationDeadline}
          onChange={(e) => onDeadlineChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <div className="flex items-center mt-6">
        <input
          id="backlogAllowed"
          type="checkbox"
          checked={backlogAllowed}
          onChange={(e) => onBacklogChange(e.target.checked)}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
        />
        <label htmlFor="backlogAllowed" className="ml-2 block text-sm text-gray-700">
          Backlog allowed
        </label>
      </div>
    </div>
  );
}
