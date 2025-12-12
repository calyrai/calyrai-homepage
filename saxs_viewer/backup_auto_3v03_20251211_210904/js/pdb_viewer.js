document.addEventListener("DOMContentLoaded", () => {
  const dropZone  = document.getElementById("pdbDropZone");
  const viewerDiv = document.getElementById("pdbViewer");
  const hint      = document.getElementById("pdbHint");

  if (!dropZone || !viewerDiv) return;

  // 3Dmol viewer with black background (CalyrAI-style)
  const viewer = $3Dmol.createViewer(viewerDiv, { backgroundColor: "black" });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover", "dragleave", "drop"].forEach(ev => {
    dropZone.addEventListener(ev, preventDefaults, false);
  });

  ["dragenter", "dragover"].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.add("dragover"));
  });

  ["dragleave", "drop"].forEach(ev => {
    dropZone.addEventListener(ev, () => dropZone.classList.remove("dragover"));
  });

  dropZone.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;

    const file = dt.files[0];
    if (!file.name.toLowerCase().endsWith(".pdb")) {
      alert("Bitte eine PDB-Datei (*.pdb) ablegen.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const pdbText = String(evt.target.result || "");
      loadPDBIntoViewer(pdbText);
    };
    reader.readAsText(file);
  });

  function loadPDBIntoViewer(pdbText) {
    viewer.clear();
    const model = viewer.addModel(pdbText, "pdb");

    // Amino acids as spheres (coarse view)
    viewer.setStyle(
      { protein: true },
      { sphere: { radius: 0.6 } }
    );

    // Non-protein as smaller grey spheres
    viewer.setStyle(
      { protein: false },
      { sphere: { radius: 0.4, color: "grey" } }
    );

    viewer.zoomTo();
    viewer.render();

    if (hint) {
      hint.style.opacity = "0";
      hint.style.transition = "opacity 0.3s";
      setTimeout(() => { hint.style.display = "none"; }, 300);
    }
  }

  viewer.render();
});
