(function() {
  // テーマリスト
  const themes = [
    { id: 'neopop', icon: '💊', name: 'Neo-Pop' },
    { id: 'hacker', icon: '📟', name: 'Hacker' },
    { id: 'retro',  icon: '💾', name: 'Retro' },
    { id: 'swiss',  icon: '🇨🇭', name: 'Swiss' },
    { id: 'zen',    icon: '🍵', name: 'Zen' }
  ];

  // HTML構築
  const switcher = document.createElement('div');
  switcher.className = 'theme-switcher';
  
  themes.forEach(theme => {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.textContent = theme.icon;
    btn.title = theme.name;
    btn.onclick = () => setTheme(theme.id);
    switcher.appendChild(btn);
  });

  document.body.appendChild(switcher);

  // テーマ設定関数
  function setTheme(themeName) {
    if (themeName === 'neopop') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeName);
    }
    localStorage.setItem('zndmonya-theme', themeName);
  }

  // 初期ロード
  const savedTheme = localStorage.getItem('zndmonya-theme');
  if (savedTheme) {
    setTheme(savedTheme);
  }
})();

