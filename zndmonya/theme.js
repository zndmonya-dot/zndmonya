(function() {
  const themes = [
    { id: 'default', icon: '📰', name: 'マガジン風 (標準)' },
    { id: 'midnight', icon: '🌙', name: 'ダークモード' },
    { id: 'zunda', icon: '🟢', name: 'ずんだカラー' },
    { id: 'terminal', icon: '📟', name: 'ハッカー風' }
  ];

  // UI作成
  const container = document.createElement('div');
  container.className = 'theme-switcher';
  
  themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.textContent = t.icon;
    btn.title = t.name; // ホバー時に日本語で出る
    btn.onclick = () => setTheme(t.id);
    container.appendChild(btn);
  });
  
  document.body.appendChild(container);

  // テーマ適用
  function setTheme(id) {
    if (id === 'default') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', id);
    }
    localStorage.setItem('zndmonya-theme', id);
  }

  // 初期ロード
  const saved = localStorage.getItem('zndmonya-theme');
  if (saved) setTheme(saved);
})();
