const data = [
    { district: "North Carolina 13", pctCounted: "95%", estimate: "Budd +7.3", winProb: "WON", winProbClass: "rep", margin: 7.3, side: "rep" },
    { district: "Florida 15", pctCounted: "95%", estimate: "Spano +5.4", winProb: "WON", winProbClass: "rep", margin: 5.4, side: "rep" },
    { district: "Ohio 12", pctCounted: ">95%", estimate: "Balderson -4.8", winProb: "LES", winProbClass: "res", margin: -4.8, side: "les" },
    // Add more data objects
];

const tbody = document.querySelector('tbody');

data.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>${row.district}</td>
        <td>${row.pctCounted}</td>
        <td>${row.estimate}</td>
        <td><span class="les ${row.winProbClass}">${row.winProb}</span></td>
        <td colspan="11">
            <div class="bar-container">
                <div class="bar ${row.side === 'rep' ? 'bar-rep' : 'bar-dem'}" style="width: ${Math.abs(row.margin)}%;"></div>
                <div class="bar-label">${row.side === 'rep' ? '+' : '-'}${row.margin}</div>
            </div>
        </td>
    `;
    tbody.appendChild(tr);
});
