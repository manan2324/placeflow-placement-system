"use client";

export default function DeadlineBacklogFields({ applicationDeadline, backlogCount, error, onDeadlineChange, onBacklogChange }) {
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

      <div>
        <label htmlFor="backlogCount" className="block text-sm font-medium text-gray-700 mb-2">
          Maximum Backlogs Allowed
        </label>
        <input
          id="backlogCount"
          type="number"
          min="0"
          max="10"
          value={backlogCount}
          onChange={(e) => onBacklogChange(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
        />
        <p className="mt-1 text-xs text-gray-500">0 means no backlogs allowed</p>
      </div>
    </div>
  );
}
