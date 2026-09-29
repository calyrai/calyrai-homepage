(() => {
  const root = document.getElementById('biotope');
  if (!root) return;
  const key = 'calyr-research-biotope-copy-v1';
  const fields = [...root.querySelectorAll('[data-edit]')];
  const status = document.getElementById('editStatus');
  let editing = false;

  function setEditing(value) {
    editing = value;
    root.classList.toggle('edit-active', value);
    fields.forEach((field) => field.contentEditable = value ? 'true' : 'false');
    document.getElementById('editText').textContent = value ? 'Finish editing' : 'Edit text';
    status.textContent = value ? 'Editing locally' : 'View mode';
  }

  function restore() {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    fields.forEach((field) => {
      if (saved[field.dataset.edit]) field.textContent = saved[field.dataset.edit];
    });
  }

  document.getElementById('editText').addEventListener('click', () => setEditing(!editing));
  document.getElementById('saveText').addEventListener('click', () => {
    const saved = {};
    fields.forEach((field) => saved[field.dataset.edit] = field.textContent.trim());
    localStorage.setItem(key, JSON.stringify(saved));
    setEditing(false);
    status.textContent = 'Saved in this browser';
  });
  document.getElementById('resetText').addEventListener('click', () => {
    localStorage.removeItem(key);
    location.reload();
  });
  fields.forEach((field) => field.contentEditable = 'false');
  restore();
})();
