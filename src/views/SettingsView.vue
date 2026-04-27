<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSettings } from '@/composables/useSettings'
import type { AppSettings } from '@/composables/useSettings'

const { settings, update, reset } = useSettings()

const bgImageWarning = ref('')

function onColorInput(key: keyof AppSettings, value: string) {
  update({ [key]: value } as Partial<AppSettings>)
}

function onBgImageChange(e: Event) {
  bgImageWarning.value = ''
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    bgImageWarning.value = 'Image is large (>2MB). May exceed storage limits on some browsers.'
  }

  const reader = new FileReader()
  reader.onload = () => update({ backgroundImage: reader.result as string })
  reader.readAsDataURL(file)
}

function clearBgImage() {
  update({ backgroundImage: '' })
  bgImageWarning.value = ''
}

const countdownOptions = [3, 5, 10] as const
const fontOptions = [
  { value: 'system', label: 'System (default)' },
  { value: 'mono', label: 'Monospace' },
  { value: 'serif', label: 'Serif' },
] as const

const photoFormatValue = computed({
  get: () => settings.photoFormat,
  set: (v: AppSettings['photoFormat']) => update({ photoFormat: v }),
})

const qualityPercent = computed({
  get: () => Math.round(settings.photoQuality * 100),
  set: (v: number) => update({ photoQuality: v / 100 }),
})
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">Settings</h1>

    <section class="section">
      <h2 class="section-title">Theme Colors</h2>
      <div class="color-grid">
        <label class="color-item">
          <span>Primary</span>
          <input type="color" :value="settings.primaryColor" @input="onColorInput('primaryColor', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="color-item">
          <span>Accent</span>
          <input type="color" :value="settings.accentColor" @input="onColorInput('accentColor', ($event.target as HTMLInputElement).value)" />
        </label>
        <label class="color-item">
          <span>Background</span>
          <input type="color" :value="settings.backgroundColor" @input="onColorInput('backgroundColor', ($event.target as HTMLInputElement).value)" />
        </label>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Background Image</h2>
      <div v-if="settings.backgroundImage" class="bg-preview-row">
        <img :src="settings.backgroundImage" alt="Background preview" class="bg-preview" />
        <button class="btn-danger-sm" @click="clearBgImage">Remove</button>
      </div>
      <label class="file-label" v-else>
        <input type="file" accept="image/*" @change="onBgImageChange" class="file-input" />
        Choose Image
      </label>
      <p v-if="bgImageWarning" class="warning">⚠️ {{ bgImageWarning }}</p>
      <p class="hint">Displayed as the app background. Stored in local storage (~5MB limit).</p>
    </section>

    <section class="section">
      <h2 class="section-title">Countdown</h2>
      <div class="option-row">
        <label for="countdown-duration">Duration</label>
        <select id="countdown-duration" :value="settings.countdownDuration" @change="update({ countdownDuration: Number(($event.target as HTMLSelectElement).value) })">
          <option v-for="n in countdownOptions" :key="n" :value="n">{{ n }} seconds</option>
        </select>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Camera</h2>
      <div class="option-row">
        <label for="mirror-preview">Mirror preview (selfie mode)</label>
        <input
          id="mirror-preview"
          type="checkbox"
          :checked="settings.mirrorPreview"
          @change="update({ mirrorPreview: ($event.target as HTMLInputElement).checked })"
          class="toggle"
        />
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Photo Format</h2>
      <div class="option-row">
        <label for="photo-format">Format</label>
        <select id="photo-format" v-model="photoFormatValue">
          <option value="jpeg">JPEG</option>
          <option value="png">PNG (lossless, larger)</option>
        </select>
      </div>
      <div v-if="settings.photoFormat === 'jpeg'" class="option-row">
        <label for="photo-quality">Quality: {{ qualityPercent }}%</label>
        <input id="photo-quality" type="range" min="50" max="100" :value="qualityPercent" @input="qualityPercent = Number(($event.target as HTMLInputElement).value)" class="range-input" />
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Font</h2>
      <div class="option-row">
        <label for="font-family">Font family</label>
        <select id="font-family" :value="settings.fontFamily" @change="update({ fontFamily: ($event.target as HTMLSelectElement).value as AppSettings['fontFamily'] })">
          <option v-for="opt in fontOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </section>

    <section class="section section-reset">
      <button class="btn-danger" @click="reset">Reset to Defaults</button>
    </section>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 560px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  margin: 0 0 1rem;
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text);
}

.section {
  background-color: var(--color-surface);
  border: 1px solid color-mix(in srgb, var(--color-primary) 20%, transparent);
  border-radius: var(--radius);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.8rem;
}

.color-grid {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
  cursor: pointer;
}

.color-item input[type="color"] {
  width: 3rem;
  height: 3rem;
  padding: 0;
  border: 2px solid var(--color-surface-2);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none;
}

.option-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.95rem;
  color: var(--color-text);
}

.option-row label {
  flex: 1;
}

select {
  background-color: var(--color-surface-2);
  color: var(--color-text);
  border: 1px solid color-mix(in srgb, var(--color-primary) 30%, transparent);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.6rem;
  min-width: 160px;
}

.toggle {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.range-input {
  flex: 1;
  max-width: 180px;
  accent-color: var(--color-primary);
}

.file-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-surface-2);
  color: var(--color-text);
  border: 1px dashed var(--color-text-muted);
  border-radius: var(--radius-sm);
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: border-color var(--transition);
}

.file-label:hover {
  border-color: var(--color-primary);
}

.file-input {
  display: none;
}

.bg-preview-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.bg-preview {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: var(--radius-sm);
}

.hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.warning {
  margin: 0;
  font-size: 0.85rem;
  color: #f4a261;
}

.btn-danger {
  background-color: #c0392b;
  color: #fff;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.btn-danger-sm {
  background-color: #c0392b;
  color: #fff;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  border-radius: var(--radius-sm);
}

.section-reset {
  background: none;
  border: none;
  padding: 0.25rem 0;
}
</style>
