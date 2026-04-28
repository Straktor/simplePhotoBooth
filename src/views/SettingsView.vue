<script setup lang="ts">
import { ref } from 'vue'
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
    bgImageWarning.value = 'Large image — may exceed browser storage limits.'
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
</script>

<template>
  <div class="settings-page">
    <h1 class="page-title">Settings</h1>

    <!-- Theme -->
    <p class="group-label">Theme</p>
    <div class="group">
      <div class="row">
        <span class="row-label">Primary color</span>
        <input type="color" :value="settings.primaryColor" @input="onColorInput('primaryColor', ($event.target as HTMLInputElement).value)" class="color-swatch" />
      </div>
      <div class="divider" />
      <div class="row">
        <span class="row-label">Accent color</span>
        <input type="color" :value="settings.accentColor" @input="onColorInput('accentColor', ($event.target as HTMLInputElement).value)" class="color-swatch" />
      </div>
      <div class="divider" />
      <div class="row">
        <span class="row-label">Background color</span>
        <input type="color" :value="settings.backgroundColor" @input="onColorInput('backgroundColor', ($event.target as HTMLInputElement).value)" class="color-swatch" />
      </div>
      <div class="divider" />
      <div class="row">
        <span class="row-label">Background image</span>
        <div class="row-end">
          <button v-if="settings.backgroundImage" class="link-btn danger" @click="clearBgImage">Remove</button>
          <label v-else class="link-btn">
            Choose
            <input type="file" accept="image/*" @change="onBgImageChange" class="file-input" />
          </label>
        </div>
      </div>
      <p v-if="bgImageWarning" class="warn-text">{{ bgImageWarning }}</p>
    </div>

    <!-- Camera -->
    <p class="group-label">Camera</p>
    <div class="group">
      <div class="row">
        <span class="row-label">Countdown</span>
        <select :value="settings.countdownDuration" @change="update({ countdownDuration: Number(($event.target as HTMLSelectElement).value) })" class="select">
          <option v-for="n in countdownOptions" :key="n" :value="n">{{ n }}s</option>
        </select>
      </div>
      <div class="divider" />
      <div class="row">
        <span class="row-label">Mirror selfie</span>
        <label class="toggle-wrap">
          <input
            type="checkbox"
            :checked="settings.mirrorPreview"
            @change="update({ mirrorPreview: ($event.target as HTMLInputElement).checked })"
            class="toggle-input"
          />
          <span class="toggle-track">
            <span class="toggle-thumb" />
          </span>
        </label>
      </div>
    </div>

    <!-- Font -->
    <p class="group-label">Display</p>
    <div class="group">
      <div class="row">
        <span class="row-label">Font</span>
        <select :value="settings.fontFamily" @change="update({ fontFamily: ($event.target as HTMLSelectElement).value as AppSettings['fontFamily'] })" class="select">
          <option value="system">System</option>
          <option value="mono">Monospace</option>
          <option value="serif">Serif</option>
        </select>
      </div>
    </div>

    <!-- Reset -->
    <button class="btn-reset" @click="reset">Reset to defaults</button>
  </div>
</template>

<style scoped>
.settings-page {
  max-width: 540px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
}

.page-title {
  margin: 0 0 1.5rem;
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.group-label {
  margin: 0 0 0.4rem 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.group {
  background: var(--color-surface-solid);
  border-radius: var(--radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-border);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  min-height: 3rem;
}

.row-label {
  font-size: 0.95rem;
  color: var(--color-text);
  flex: 1;
}

.row-end {
  display: flex;
  align-items: center;
}

.divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 1rem;
}

/* Color swatch */
.color-swatch {
  width: 2.2rem;
  height: 2.2rem;
  padding: 0;
  border: 2px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: none;
}

/* Select */
.select {
  background: transparent;
  color: var(--color-text-muted);
  border: none;
  font-size: 0.95rem;
  text-align: right;
  cursor: pointer;
  appearance: none;
  padding-right: 0.25rem;
}

/* Link-style button */
.link-btn {
  color: var(--color-primary);
  font-size: 0.95rem;
  cursor: pointer;
  font-weight: 500;
}

.link-btn.danger {
  color: #ff6b6b;
}

.file-input {
  display: none;
}

.warn-text {
  margin: 0;
  padding: 0 1rem 0.75rem;
  font-size: 0.78rem;
  color: #f4a261;
}

/* Toggle switch */
.toggle-wrap {
  position: relative;
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-track {
  display: block;
  width: 2.8rem;
  height: 1.6rem;
  border-radius: 999px;
  background: rgba(255,255,255,0.12);
  transition: background var(--transition);
  position: relative;
}

.toggle-input:checked + .toggle-track {
  background: var(--color-primary);
}

.toggle-thumb {
  position: absolute;
  top: 0.2rem;
  left: 0.2rem;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.3);
  transition: transform var(--transition);
}

.toggle-input:checked + .toggle-track .toggle-thumb {
  transform: translateX(1.2rem);
}

/* Reset button */
.btn-reset {
  width: 100%;
  padding: 0.9rem;
  border-radius: var(--radius);
  background: var(--color-surface-solid);
  border: 1px solid var(--color-border);
  color: #ff6b6b;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 0.5rem;
}
</style>
