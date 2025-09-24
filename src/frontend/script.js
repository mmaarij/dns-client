document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("dnsForm");
  const resultsTableBody = document.querySelector("#resultsTable tbody");

  // Initial message
  const initRow = document.createElement("tr");
  const initCell = document.createElement("td");
  initCell.colSpan = 2;
  initCell.classList.add("text-muted", "text-center");
  initCell.textContent = "Enter a domain and record type to start a query.";
  initRow.appendChild(initCell);
  resultsTableBody.appendChild(initRow);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const domain = document.getElementById("domainInput").value.trim();
    const type = document.getElementById("recordTypeSelect").value;

    // Reset table while loading
    resultsTableBody.innerHTML = "";
    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");
    loadingCell.colSpan = 2;
    loadingCell.classList.add("text-center", "text-info");
    loadingCell.textContent = "Querying DNS...";
    loadingRow.appendChild(loadingCell);
    resultsTableBody.appendChild(loadingRow);

    try {
      const params = new URLSearchParams({ domain, type });
      const response = await fetch(`/query?${params.toString()}`);
      const json = await response.json();
      const results = json.results;

      resultsTableBody.innerHTML = "";

      if (Array.isArray(results) && results.length > 0) {
        results.forEach((record) => {
          const row = document.createElement("tr");

          const typeCell = document.createElement("td");
          typeCell.textContent = record[0] || type;
          typeCell.classList.add("fw-bold");

          const valueCell = document.createElement("td");
          valueCell.textContent = record[1] || "";
          valueCell.classList.add("font-monospace");

          row.appendChild(typeCell);
          row.appendChild(valueCell);
          resultsTableBody.appendChild(row);
        });
      } else {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 2;
        cell.classList.add("text-muted", "text-center");
        cell.textContent = "No results found.";
        row.appendChild(cell);
        resultsTableBody.appendChild(row);
      }
    } catch (err) {
      resultsTableBody.innerHTML = "";
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 2;
      cell.classList.add("text-danger", "text-center");
      cell.textContent = `Error: ${err.message}`;
      row.appendChild(cell);
      resultsTableBody.appendChild(row);
    }
  });
});
