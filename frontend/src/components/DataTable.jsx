import React from "react";

export default function DataTable({ headers, rows }) {
  return <div className="table-responsive"><table className="table align-middle"><thead><tr>{headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody></table>{!rows.length && <div className="empty-state">No records available yet.</div>}</div>;
}
