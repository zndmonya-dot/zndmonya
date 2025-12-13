(function() {
  const themes = [
    { id: 'default', icon: '📰', name: 'Magazine' },
    { id: 'midnight', icon: '🌙', name: 'Midnight' },
    { id: 'zunda', icon: '🟢', name: 'Zunda' },
    { id: 'terminal', icon: '📟', name: 'Terminal' }
  ];

  // Create UI
  const container = document.createElement('div');
  container.className = 'theme-switcher';
  
  themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.textContent = t.icon;
    btn.title = t.name;
    btn.onclick = () => setTheme(t.id);
    container.appendChild(btn);
  });
  
  document.body.appendChild(container);

  // Set Theme
  function setTheme(id) {
    if (id === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', id);
    }
    localStorage.setItem('zndmonya-theme', id);
  }

  // Init
  const saved = localStorage.getItem('zndmonya-theme');
  if (saved) setTheme(saved);
})();

