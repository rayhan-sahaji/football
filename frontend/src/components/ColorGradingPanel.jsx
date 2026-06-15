import { useState } from 'react'

const DEFAULT = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  temperature: 0,
  exposure: 0,
  gamma: 100,
  sepia: 0,
  blur: 0,
  grayscale: 0,
}

const PRESETS = [
  { name: 'Normal', values: { ...DEFAULT } },
  { name: 'Vivid', values: { ...DEFAULT, saturation: 140, contrast: 115, brightness: 105 } },
  { name: 'Warm', values: { ...DEFAULT, temperature: 30, saturation: 110, brightness: 105 } },
  { name: 'Cool', values: { ...DEFAULT, temperature: -30, saturation: 105 } },
  { name: 'Cinema', values: { ...DEFAULT, contrast: 120, saturation: 85, brightness: 95 } },
  { name: 'Dramatic', values: { ...DEFAULT, contrast: 140, saturation: 70, brightness: 90 } },
  { name: 'B&W', values: { ...DEFAULT, grayscale: 100, contrast: 115 } },
  { name: 'Sepia', values: { ...DEFAULT, sepia: 80, brightness: 105 } },
  { name: 'Night', values: { ...DEFAULT, brightness: 80, contrast: 130, saturation: 60 } },
  { name: 'Football', values: { ...DEFAULT, saturation: 130, contrast: 110, brightness: 105 } },
]

function buildFilter(v) {
  const warmth = v.temperature > 0
    ? `sepia(${v.temperature * 0.4}%) hue-rotate(-${v.temperature * 0.3}deg)`
    : v.temperature < 0
    ? `hue-rotate(${Math.abs(v.temperature) * 0.5}deg) saturate(${100 + Math.abs(v.temperature) * 0.3}%)`
    : ''

  return [
    `brightness(${(100 + v.exposure) / 100 * (v.brightness / 100)})`,
    `contrast(${v.contrast / 100 * (v.gamma !== 100 ? (v.gamma / 100 * 0.3 + 0.85) : 1)})`,
    `saturate(${v.saturation / 100})`,
    v.hue ? `hue-rotate(${v.hue}deg)` : '',
    v.sepia ? `sepia(${v.sepia}%)` : '',
    v.grayscale ? `grayscale(${v.grayscale}%)` : '',
    v.blur ? `blur(${v.blur}px)` : '',
    warmth,
  ].filter(Boolean).join(' ')
}

export function buildColorFilter(values) {
  return buildFilter(values)
}

const SLIDERS = [
  { key: 'brightness', label: 'Brightness', icon: '☀', min: 30, max: 200, default: 100, unit: '%', color: 'bg-yellow-500' },
  { key: 'contrast', label: 'Contrast', icon: '◐', min: 30, max: 200, default: 100, unit: '%', color: 'bg-blue-500' },
  { key: 'saturation', label: 'Saturation', icon: '●', min: 0, max: 300, default: 100, unit: '%', color: 'bg-red-500' },
  { key: 'hue', label: 'Hue Rotate', icon: '🎨', min: 0, max: 360, default: 0, unit: '°', color: 'bg-purple-500' },
  { key: 'temperature', label: 'Temperature', icon: '🌡', min: -50, max: 50, default: 0, unit: '', color: 'bg-orange-500' },
  { key: 'exposure', label: 'Exposure', icon: '💡', min: -50, max: 50, default: 0, unit: '', color: 'bg-cyan-500' },
  { key: 'gamma', label: 'Gamma', icon: '⚡', min: 50, max: 200, default: 100, unit: '%', color: 'bg-green-500' },
  { key: 'sepia', label: 'Sepia', icon: '📜', min: 0, max: 100, default: 0, unit: '%', color: 'bg-amber-600' },
  { key: 'grayscale', label: 'Grayscale', icon: '⬛', min: 0, max: 100, default: 0, unit: '%', color: 'bg-gray-500' },
  { key: 'blur', label: 'Blur', icon: '💧', min: 0, max: 5, default: 0, unit: 'px', color: 'bg-teal-500' },
]

export default function ColorGradingPanel({ values, onChange }) {
  const [activePreset, setActivePreset] = useState('Normal')
  const [collapsed, setCollapsed] = useState(false)

  const update = (key, val) => {
    setActivePreset(null)
    onChange({ ...values, [key]: Number(val) })
  }

  const applyPreset = (preset) => {
    setActivePreset(preset.name)
    onChange({ ...preset.values })
  }

  const resetAll = () => {
    setActivePreset('Normal')
    onChange({ ...DEFAULT })
  }

  const isDefault = SLIDERS.every(s => values[s.key] === s.default)

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <h3 className="text-white font-semibold">Color Grading</h3>
          {!isDefault && <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">ACTIVE</span>}
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-5 pb-5 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  activePreset === preset.name
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700'
                }`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {SLIDERS.map((s) => (
              <div key={s.key} className="flex items-center gap-3">
                <span className="text-gray-400 text-xs w-5 text-center" title={s.label}>{s.icon}</span>
                <span className="text-gray-400 text-xs w-20 shrink-0">{s.label}</span>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min={s.min} max={s.max}
                    value={values[s.key]}
                    onChange={(e) => update(s.key, e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-700
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                      [&::-webkit-slider-thumb]:shadow-lg"
                    style={{
                      background: `linear-gradient(to right, ${s.color} 0%, ${s.color} ${((values[s.key] - s.min) / (s.max - s.min)) * 100}%, #374151 ${((values[s.key] - s.min) / (s.max - s.min)) * 100}%, #374151 100%)`,
                    }}
                  />
                </div>
                <span className="text-gray-300 text-xs font-mono w-12 text-right">
                  {s.key === 'blur' ? values[s.key].toFixed(1) : values[s.key]}{s.unit}
                </span>
                {values[s.key] !== s.default && (
                  <button
                    onClick={() => update(s.key, s.default)}
                    className="text-gray-500 hover:text-white text-xs cursor-pointer"
                    title="Reset"
                  >×</button>
                )}
              </div>
            ))}
          </div>

          {!isDefault && (
            <button
              onClick={resetAll}
              className="w-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs font-medium py-2 rounded-lg border border-gray-700 transition-colors cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
      )}
    </div>
  )
}
