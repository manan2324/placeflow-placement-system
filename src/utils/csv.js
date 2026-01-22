export function csvEscape(val, preserveAsText = false) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  
  // If preserveAsText is true, prepend with tab to force text formatting
  if (preserveAsText) {
    return `"\t${str.replace(/"/g, '""')}"`;
  }
  
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildCsv(headers, rows) {
  return `${headers.join(",")}\n${rows.map((r) => r.join(",")).join("\n")}`;
}
