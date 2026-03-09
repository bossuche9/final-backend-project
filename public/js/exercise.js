function rowCount() {
  return document.querySelectorAll("#sets-body .set-row").length;
}

function renumberSets() {
  document.querySelectorAll("#sets-body .set-row").forEach(function (row, i) {
    row.cells[0].textContent = i + 1;
    row.querySelector('input[type="checkbox"]').value = i;
  });
}

function addSet() {
  var tbody = document.getElementById("sets-body");
  var n = rowCount();
  var tr = document.createElement("tr");
  tr.className = "set-row";
  tr.innerHTML =
    "<td>" +
    (n + 1) +
    "</td>" +
    '<td><input type="number" name="sets[weight][]" min="0" step="0.5" placeholder="0"/></td>' +
    '<td><input type="number" name="sets[reps][]" min="0" step="1" placeholder="0"/></td>' +
    '<td><input type="checkbox" name="sets[isCompleted][]" value="' +
    n +
    '"/></td>' +
    '<td><button type="button" data-action="remove-set">&#x2715;</button></td>';
  tbody.appendChild(tr);
}

function removeSet(btn) {
  var rows = document.querySelectorAll("#sets-body .set-row");
  if (rows.length <= 1) return;
  btn.closest("tr").remove();
  renumberSets();
}

document.getElementById("sets-body").addEventListener("click", function (e) {
  var btn = e.target.closest('[data-action="remove-set"]');
  if (btn) removeSet(btn);
});

document.getElementById("add-set-btn").addEventListener("click", addSet);
