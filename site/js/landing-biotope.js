(() => {
  const root = document.getElementById('landingBiotope');
  if (!root) return;
  const key = 'calyr-landing-biotope-copy-v1';
  const fields = [...root.querySelectorAll('[data-landing-edit]')];
  const edit = document.getElementById('landingEdit');
  const save = document.getElementById('landingSave');
  const status = document.getElementById('landingStatus');
  let editing = false;

  const setEditing = (value) => {
    editing = value;
    root.classList.toggle('landing-is-editing', value);
    fields.forEach((field) => field.contentEditable = value ? 'true' : 'false');
    edit.textContent = value ? 'Finish editing' : 'Edit landing text';
    status.textContent = value ? 'Editing locally — subsystem navigation is paused.' : 'Click a subsystem to enter its workspace.';
  };

  const saved = JSON.parse(localStorage.getItem(key) || '{}');
  fields.forEach((field) => {
    field.contentEditable = 'false';
    if (saved[field.dataset.landingEdit]) field.textContent = saved[field.dataset.landingEdit];
  });

  root.querySelectorAll('.landing-node').forEach((link) => link.addEventListener('click', (event) => {
    if (editing) event.preventDefault();
  }));
  edit.addEventListener('click', () => setEditing(!editing));
  save.addEventListener('click', () => {
    const copy = {};
    fields.forEach((field) => copy[field.dataset.landingEdit] = field.textContent.trim());
    localStorage.setItem(key, JSON.stringify(copy));
    setEditing(false);
    status.textContent = 'Landing-page text saved in this browser.';
  });
})();
