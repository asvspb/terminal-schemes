import React, { useState, useEffect } from 'react';
import { Palette, Copy, Download, Save, Edit2, Trash2, X } from 'lucide-react';

const TerminalColorManager = () => {
  const defaultSchemes = [
    {
      id: 1,
      name: 'Темно-синяя',
      accent: '#5294e2',
      background: '#002851',
      foreground: '#ffffff',
      details: 'darker',
      terminal_colors: {
        normal: {
          black: '#000000',
          red: '#cc3333',
          green: '#cdab8f',
          yellow: '#cdab8f',
          blue: '#1a5fb4',
          magenta: '#a347ba',
          cyan: '#62a0ea',
          white: '#cccccc'
        },
        bright: {
          black: '#555555',
          red: '#ff9ca3',
          green: '#d0f0a8',
          yellow: '#ffc669',
          blue: '#99c1f1',
          magenta: '#c17bc9',
          cyan: '#99ffff',
          white: '#ffffff'
        }
      }
    }
  ];

  const [schemes, setSchemes] = useState(defaultSchemes);
  const [activeScheme, setActiveScheme] = useState(defaultSchemes[0]);
  const [editMode, setEditMode] = useState(false);
  const [previewApp, setPreviewApp] = useState('rainbow');
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSchemeName, setNewSchemeName] = useState('');

  useEffect(() => {
    loadSchemes();
  }, []);

  const loadSchemes = async () => {
    try {
      const result = await window.storage.get('terminal-schemes');
      if (result) {
        const loaded = JSON.parse(result.value);
        setSchemes(loaded);
        setActiveScheme(loaded[0]);
      }
    } catch (error) {
      console.log('Loading from defaults');
    }
  };

  const saveSchemes = async () => {
    setIsSaving(true);
    try {
      await window.storage.set('terminal-schemes', JSON.stringify(schemes));
      alert('Конфигурации сохранены!');
    } catch (error) {
      alert('Ошибка сохранения');
    }
    setIsSaving(false);
  };

  const updateColor = (type, brightness, colorName, value) => {
    const updated = JSON.parse(JSON.stringify(activeScheme));
    if (type === 'terminal') {
      updated.terminal_colors[brightness][colorName] = value;
    } else {
      updated[colorName] = value;
    }
    setActiveScheme(updated);
    setSchemes(schemes.map(s => s.id === updated.id ? updated : s));
  };

  const addNewScheme = () => {
    if (!newSchemeName.trim()) {
      alert('Введите название схемы');
      return;
    }
    
    const newScheme = {
      id: Date.now(),
      name: newSchemeName,
      accent: '#5294e2',
      background: '#1e1e1e',
      foreground: '#ffffff',
      details: 'darker',
      terminal_colors: {
        normal: {
          black: '#000000',
          red: '#ff5555',
          green: '#50fa7b',
          yellow: '#f1fa8c',
          blue: '#bd93f9',
          magenta: '#ff79c6',
          cyan: '#8be9fd',
          white: '#bbbbbb'
        },
        bright: {
          black: '#555555',
          red: '#ff6e6e',
          green: '#69ff94',
          yellow: '#ffffa5',
          blue: '#d6acff',
          magenta: '#ff92df',
          cyan: '#a4ffff',
          white: '#ffffff'
        }
      }
    };
    
    setSchemes([...schemes, newScheme]);
    setActiveScheme(newScheme);
    setNewSchemeName('');
    setShowAddDialog(false);
    setEditMode(true);
  };

  const deleteScheme = (id) => {
    if (schemes.length === 1) {
      alert('Нельзя удалить последнюю схему');
      return;
    }
    if (!window.confirm('Удалить эту схему?')) return;
    
    const filtered = schemes.filter(s => s.id !== id);
    setSchemes(filtered);
    if (activeScheme.id === id) {
      setActiveScheme(filtered[0]);
    }
  };

  const generateYAML = (scheme) => {
    return `# ${scheme.name}
accent: '${scheme.accent}'
background: '${scheme.background}'
foreground: '${scheme.foreground}'
details: '${scheme.details}'
terminal_colors:
  normal:
    black:   '${scheme.terminal_colors.normal.black}'
    red:     '${scheme.terminal_colors.normal.red}'
    green:   '${scheme.terminal_colors.normal.green}'
    yellow:  '${scheme.terminal_colors.normal.yellow}'
    blue:    '${scheme.terminal_colors.normal.blue}'
    magenta: '${scheme.terminal_colors.normal.magenta}'
    cyan:    '${scheme.terminal_colors.normal.cyan}'
    white:   '${scheme.terminal_colors.normal.white}'
  bright:
    black:   '${scheme.terminal_colors.bright.black}'
    red:     '${scheme.terminal_colors.bright.red}'
    green:   '${scheme.terminal_colors.bright.green}'
    yellow:  '${scheme.terminal_colors.bright.yellow}'
    blue:    '${scheme.terminal_colors.bright.blue}'
    magenta: '${scheme.terminal_colors.bright.magenta}'
    cyan:    '${scheme.terminal_colors.bright.cyan}'
    white:   '${scheme.terminal_colors.bright.white}'`;
  };

  const copyToClipboard = (scheme) => {
    navigator.clipboard.writeText(generateYAML(scheme));
    alert('Конфигурация скопирована!');
  };

  const downloadYAML = (scheme) => {
    const yaml = generateYAML(scheme);
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = scheme.name.toLowerCase().replace(/\s+/g, '-') + '.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  const ColorEditor = ({ label, value, onChange, disabled }) => (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-10 h-10 rounded cursor-pointer"
      />
      <div className="flex-1">
        <div className="text-xs text-gray-400">{label}</div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full bg-gray-900 px-2 py-1 rounded text-sm font-mono"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Palette className="w-10 h-10 text-blue-400" />
            <h1 className="text-4xl font-bold">Менеджер цветовых схем терминала</h1>
          </div>
          <button
            onClick={saveSchemes}
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Сохранение...' : 'Сохранить все'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {schemes.map((scheme) => (
            <div
              key={scheme.id}
              className={`bg-gray-800 rounded-xl p-6 cursor-pointer transition-all relative ${
                activeScheme.id === scheme.id ? 'ring-2 ring-blue-400' : ''
              }`}
              onClick={() => setActiveScheme(scheme)}
            >
              {schemes.length > 1 && (
                <button
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (window.confirm('Удалить схему "' + scheme.name + '"?')) {
                      const filtered = schemes.filter(s => s.id !== scheme.id);
                      setSchemes(filtered);
                      if (activeScheme.id === scheme.id) {
                        setActiveScheme(filtered[0]);
                      }
                    }
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-600 hover:bg-red-700 rounded-lg"
                  title="Удалить схему"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              
              <h3 className="text-xl font-semibold mb-4 pr-10">{scheme.name}</h3>
              
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Фон</div>
                  <div 
                    className="h-10 rounded border border-gray-700"
                    style={{ backgroundColor: scheme.background }}
                  ></div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Текст</div>
                  <div 
                    className="h-10 rounded border border-gray-700"
                    style={{ backgroundColor: scheme.foreground }}
                  ></div>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-400 mb-1">Акцент</div>
                  <div 
                    className="h-10 rounded border border-gray-700"
                    style={{ backgroundColor: scheme.accent }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); copyToClipboard(scheme); }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Копировать
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); downloadYAML(scheme); }}
                  className="flex-1 bg-green-600 hover:bg-green-700 px-3 py-2 rounded text-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Скачать
                </button>
              </div>
            </div>
          ))}
          
          <div
            onClick={() => setShowAddDialog(true)}
            className="bg-gray-800 rounded-xl p-6 cursor-pointer hover:bg-gray-750 border-2 border-dashed border-gray-600 flex flex-col items-center justify-center gap-4 min-h-[250px]"
          >
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-3xl text-gray-400">+</span>
            </div>
            <span className="text-lg text-gray-400">Добавить новую схему</span>
          </div>
        </div>

        {showAddDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAddDialog(false)}>
            <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Новая схема</h3>
                <button onClick={() => setShowAddDialog(false)} className="p-2 hover:bg-gray-700 rounded">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">Название схемы</label>
                <input
                  type="text"
                  value={newSchemeName}
                  onChange={(e) => setNewSchemeName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNewScheme()}
                  placeholder="Моя схема"
                  className="w-full bg-gray-900 px-4 py-3 rounded-lg text-white"
                  autoFocus
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 px-4 py-3 rounded-lg"
                >
                  Отмена
                </button>
                <button
                  onClick={addNewScheme}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg"
                >
                  Создать
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{activeScheme.name}</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded flex items-center gap-2"
            >
              <Edit2 className="w-5 h-5" />
              {editMode ? 'Просмотр' : 'Редактировать'}
            </button>
          </div>

          <div className="mb-6">
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={() => setPreviewApp('rainbow')}
                className={`px-4 py-2 rounded ${previewApp === 'rainbow' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Полная палитра
              </button>
              <button
                onClick={() => setPreviewApp('vim')}
                className={`px-4 py-2 rounded ${previewApp === 'vim' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Vim Editor
              </button>
              <button
                onClick={() => setPreviewApp('git')}
                className={`px-4 py-2 rounded ${previewApp === 'git' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Git Status
              </button>
              <button
                onClick={() => setPreviewApp('logs')}
                className={`px-4 py-2 rounded ${previewApp === 'logs' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                Логи
              </button>
            </div>
            
            {previewApp === 'rainbow' && (
              <div className="rounded-lg overflow-hidden shadow-2xl font-mono text-sm p-4" style={{ backgroundColor: activeScheme.background, color: activeScheme.foreground }}>
                <div className="mb-3" style={{ color: activeScheme.terminal_colors.bright.cyan }}>
                  ══════════════════════════════════════════
                </div>
                <div className="mb-3">
                  <span style={{ color: activeScheme.terminal_colors.bright.white }}>ПОЛНАЯ ПАЛИТРА ЦВЕТОВ</span>
                </div>
                <div className="mb-3" style={{ color: activeScheme.terminal_colors.bright.cyan }}>
                  ══════════════════════════════════════════
                </div>
                
                <div className="space-y-2 mb-4">
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.normal.red }}>● RED  </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.green }}>● GREEN  </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.yellow }}>● YELLOW</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.normal.blue }}>● BLUE  </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.magenta }}>● MAGENTA  </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.cyan }}>● CYAN</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.red }}>■ BRIGHT RED  </span>
                    <span style={{ color: activeScheme.terminal_colors.bright.green }}>■ BRIGHT GREEN</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.yellow }}>■ BRIGHT YELLOW  </span>
                    <span style={{ color: activeScheme.terminal_colors.bright.blue }}>■ BRIGHT BLUE</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.magenta }}>■ BRIGHT MAGENTA  </span>
                    <span style={{ color: activeScheme.terminal_colors.bright.cyan }}>■ BRIGHT CYAN</span>
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.green }}>✓ Тест пройден</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.red }}>✗ Ошибка</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.yellow }}>⚠ Предупреждение</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.cyan }}>ℹ Информация</span>
                  </div>
                </div>
              </div>
            )}

            {previewApp === 'vim' && (
              <div className="rounded-lg overflow-hidden shadow-2xl font-mono text-xs" style={{ backgroundColor: activeScheme.background }}>
                <div className="px-3 py-1" style={{ backgroundColor: activeScheme.terminal_colors.normal.blue, color: activeScheme.terminal_colors.bright.white }}>
                  main.py
                </div>
                <div className="p-3 space-y-1" style={{ color: activeScheme.foreground }}>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.black }}>1 </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.blue }}>import</span>
                    <span> sys</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.black }}>2 </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.blue }}>class</span>
                    <span> </span>
                    <span style={{ color: activeScheme.terminal_colors.bright.green }}>ColorManager</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.black }}>3 </span>
                    <span style={{ color: activeScheme.terminal_colors.normal.magenta }}># Комментарий</span>
                  </div>
                  <div>
                    <span style={{ color: activeScheme.terminal_colors.bright.black }}>4 </span>
                    <span style={{ color: activeScheme.terminal_colors.bright.cyan }}>print</span>
                    <span>(</span>
                    <span style={{ color: activeScheme.terminal_colors.normal.yellow }}>"Hello"</span>
                    <span>)</span>
                  </div>
                </div>
              </div>
            )}

            {previewApp === 'git' && (
              <div className="rounded-lg overflow-hidden shadow-2xl font-mono text-sm p-4" style={{ backgroundColor: activeScheme.background, color: activeScheme.foreground }}>
                <div>
                  <span style={{ color: activeScheme.terminal_colors.normal.green }}>user@host</span>
                  <span>:</span>
                  <span style={{ color: activeScheme.terminal_colors.normal.blue }}>~/project</span>
                  <span>$ git status</span>
                </div>
                <div className="mt-2">
                  <span style={{ color: activeScheme.terminal_colors.normal.cyan }}>On branch </span>
                  <span style={{ color: activeScheme.terminal_colors.bright.green }}>main</span>
                </div>
                <div className="mt-2" style={{ color: activeScheme.terminal_colors.normal.red }}>
                  Changes not staged for commit:
                </div>
                <div className="ml-8 mt-1 space-y-1">
                  <div style={{ color: activeScheme.terminal_colors.normal.red }}>modified: src/main.py</div>
                  <div style={{ color: activeScheme.terminal_colors.normal.red }}>deleted: old.py</div>
                </div>
              </div>
            )}

            {previewApp === 'logs' && (
              <div className="rounded-lg overflow-hidden shadow-2xl font-mono text-xs p-3 space-y-1" style={{ backgroundColor: activeScheme.background, color: activeScheme.foreground }}>
                <div>
                  <span style={{ color: activeScheme.terminal_colors.bright.black }}>[14:32:01]</span>
                  <span> </span>
                  <span className="px-2 rounded" style={{ backgroundColor: activeScheme.terminal_colors.normal.blue, color: activeScheme.terminal_colors.bright.white }}>INFO</span>
                  <span> Server started</span>
                </div>
                <div>
                  <span style={{ color: activeScheme.terminal_colors.bright.black }}>[14:32:02]</span>
                  <span> </span>
                  <span className="px-2 rounded" style={{ backgroundColor: activeScheme.terminal_colors.normal.green, color: activeScheme.background }}>OK</span>
                  <span> Connected</span>
                </div>
                <div>
                  <span style={{ color: activeScheme.terminal_colors.bright.black }}>[14:32:03]</span>
                  <span> </span>
                  <span className="px-2 rounded" style={{ backgroundColor: activeScheme.terminal_colors.normal.yellow, color: activeScheme.background }}>WARN</span>
                  <span style={{ color: activeScheme.terminal_colors.bright.yellow }}> Memory at 85%</span>
                </div>
                <div>
                  <span style={{ color: activeScheme.terminal_colors.bright.black }}>[14:32:04]</span>
                  <span> </span>
                  <span className="px-2 rounded" style={{ backgroundColor: activeScheme.terminal_colors.normal.red, color: activeScheme.terminal_colors.bright.white }}>ERROR</span>
                  <span style={{ color: activeScheme.terminal_colors.bright.red }}> Connection failed</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Основные цвета</h3>
              <div className="space-y-3">
                <ColorEditor
                  label="Фон"
                  value={activeScheme.background}
                  onChange={(v) => updateColor('main', null, 'background', v)}
                  disabled={!editMode}
                />
                <ColorEditor
                  label="Текст"
                  value={activeScheme.foreground}
                  onChange={(v) => updateColor('main', null, 'foreground', v)}
                  disabled={!editMode}
                />
                <ColorEditor
                  label="Акцент"
                  value={activeScheme.accent}
                  onChange={(v) => updateColor('main', null, 'accent', v)}
                  disabled={!editMode}
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Палитра Normal</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(activeScheme.terminal_colors.normal).map(([name, color]) => (
                  <ColorEditor
                    key={name}
                    label={name}
                    value={color}
                    onChange={(v) => updateColor('terminal', 'normal', name, v)}
                    disabled={!editMode}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Палитра Bright</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {Object.entries(activeScheme.terminal_colors.bright).map(([name, color]) => (
                <ColorEditor
                  key={name}
                  label={name}
                  value={color}
                  onChange={(v) => updateColor('terminal', 'bright', name, v)}
                  disabled={!editMode}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">YAML Конфигурация</h3>
            <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{generateYAML(activeScheme)}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalColorManager;