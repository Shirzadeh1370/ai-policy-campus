// Keep a valid preferred tool selected for new or empty course records.
(() => {
  const originalLoadCourse = window.loadCourse;
  window.loadCourse = function () {
    originalLoadCourse();
    if (!document.getElementById('tool').value) document.getElementById('tool').value = 'ChatGPT';
  };
  if (!document.getElementById('tool').value) document.getElementById('tool').value = 'ChatGPT';
  document.getElementById('readPage').onclick = () => window.speakBrowserText(document.querySelector('main').innerText);
})();
