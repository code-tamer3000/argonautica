import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { MAP_FOG_DEFAULTS, MapHint, WorldMap } from './components/WorldMap'
import './index.css'
import './map-preview.css'

const STORAGE_KEY = 'argonautica:map-fog'
const SLIDERS = [
  { key: 'size', label: 'Ширина следа', min: 0.15, max: 1.5, step: 0.05 },
  { key: 'intensity', label: 'Сила раскрытия', min: 0.3, max: 3, step: 0.05 },
  { key: 'trail', label: 'Длительность следа', min: 0.5, max: 8, step: 0.1 },
  { key: 'halo', label: 'Яркость ореола', min: 0, max: 1, step: 0.01 },
  { key: 'force', label: 'Сила потока', min: 0, max: 1, step: 0.05 },
  { key: 'swirl', label: 'Завихрения', min: 0, max: 12, step: 0.5 },
  { key: 'momentum', label: 'Инерция', min: 0.2, max: 3, step: 0.05 },
  { key: 'colorSpeed', label: 'Смена оттенков', min: 0, max: 3, step: 0.05 },
]

function readSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved) return MAP_FOG_DEFAULTS
    const settings = { ...MAP_FOG_DEFAULTS }
    for (const { key, min, max } of SLIDERS) {
      const value = saved[key]
      if (Number.isFinite(value) && value >= min && value <= max) settings[key] = value
    }
    if (Array.isArray(saved.colors) && saved.colors.length === settings.colors.length &&
        saved.colors.every(color => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color))) {
      settings.colors = saved.colors
    }
    if (typeof saved.clickSplash === 'boolean') settings.clickSplash = saved.clickSplash
    return settings
  } catch {
    return MAP_FOG_DEFAULTS
  }
}

function MapPreview() {
  const [settings, setSettings] = useState(readSettings)
  const [copyStatus, setCopyStatus] = useState('')
  const settingsJson = JSON.stringify(settings, null, 2)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, settingsJson)
    } catch {
      // The preview can still be adjusted if storage is disabled.
    }
  }, [settingsJson])

  const updateSetting = (key, value) => {
    setSettings(previous => ({ ...previous, [key]: value }))
    setCopyStatus('')
  }

  const reset = () => {
    setSettings(MAP_FOG_DEFAULTS)
    setCopyStatus('')
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(settingsJson)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('manual')
    }
  }

  return (
    <main className="map-preview">
      <header className="map-preview__header">
        <h1>Настройка карты миров</h1>
        <a href="./#karta">К карте на сайте</a>
      </header>
      <MapHint />
      <div className="map-preview__viewport" role="region" aria-label="Предпросмотр карты" tabIndex={0}>
        <WorldMap fogSettings={settings} />
      </div>

      <section className="map-preview__settings" aria-labelledby="fog-settings-title">
        <h2 id="fog-settings-title">Эффект тумана</h2>
        <div className="map-preview__sliders">
          {SLIDERS.map(({ key, label, min, max, step }) => (
            <label className="map-preview__slider" key={key}>
              <span>{label}</span>
              <span aria-hidden="true">{settings[key].toLocaleString('ru-RU')}</span>
              <input
                type="range"
                name={key}
                min={min}
                max={max}
                step={step}
                value={settings[key]}
                onChange={event => updateSetting(key, event.target.valueAsNumber)}
              />
            </label>
          ))}
        </div>

        <div className="map-preview__options">
          <div className="map-preview__palette" role="group" aria-label="Цвета ореола">
            <span>Цвета ореола</span>
            {settings.colors.map((color, index) => (
              <input
                key={index}
                type="color"
                aria-label={`Цвет ореола ${index + 1}`}
                value={color}
                onChange={event => updateSetting(
                  'colors',
                  settings.colors.map((oldColor, i) => i === index ? event.target.value : oldColor),
                )}
              />
            ))}
          </div>
          <label className="map-preview__checkbox">
            <input
              type="checkbox"
              checked={settings.clickSplash}
              onChange={event => updateSetting('clickSplash', event.target.checked)}
            />
            Всплеск при нажатии
          </label>
        </div>

        <div className="map-preview__actions">
          <button type="button" onClick={copy}>Скопировать настройки</button>
          <button type="button" onClick={reset}>Сбросить</button>
          <span role="status">
            {copyStatus === 'copied' && 'Настройки скопированы. Вставь их в чат.'}
            {copyStatus === 'manual' && 'Скопируй значения из поля ниже и вставь в чат.'}
          </span>
        </div>
        {copyStatus === 'manual' && (
          <textarea
            aria-label="Настройки эффекта"
            rows={7}
            value={settingsJson}
            onFocus={event => event.target.select()}
            readOnly
          />
        )}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MapPreview />
  </StrictMode>,
)
