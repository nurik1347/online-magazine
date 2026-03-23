<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: 20
  },
  strokeWidth: {
    type: [Number, String],
    default: 1.8
  },
  title: {
    type: String,
    default: ''
  }
})

const icons = {
  menu: {
    viewBox: '0 0 24 24',
    paths: ['M3 6h18', 'M3 12h18', 'M3 18h18']
  },
  bell: {
    viewBox: '0 0 24 24',
    paths: [
      'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9',
      'M13.73 21a2 2 0 0 1-3.46 0'
    ]
  },
  user: {
    viewBox: '0 0 24 24',
    paths: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'],
    circles: [{ cx: 12, cy: 7, r: 4 }]
  },
  'chevron-down': {
    viewBox: '0 0 24 24',
    paths: ['M6 9l6 6 6-6']
  },
  'arrow-up': {
    viewBox: '0 0 24 24',
    paths: ['M12 19V5', 'M5 12l7-7 7 7']
  },
  refresh: {
    viewBox: '0 0 24 24',
    paths: ['M23 4v6h-6', 'M1 20v-6h6', 'M3.5 9a9 9 0 0 1 14.1-3.6L23 10', 'M1 14l5.4 4.6A9 9 0 0 0 20.5 15']
  },
  logout: {
    viewBox: '0 0 24 24',
    paths: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']
  },
  edit: {
    viewBox: '0 0 24 24',
    paths: [
      'M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 3 21l.5-4.5L17 3z',
      'M15 5l4 4'
    ]
  },
  trash: {
    viewBox: '0 0 24 24',
    paths: [
      'M3 6h18',
      'M8 6V4h8v2',
      'M5 6l1 14h12l1-14',
      'M10 11v6',
      'M14 11v6'
    ]
  },
  dashboard: {
    viewBox: '0 0 24 24',
    rects: [
      { x: 3, y: 3, width: 7, height: 7, rx: 1.4 },
      { x: 14, y: 3, width: 7, height: 7, rx: 1.4 },
      { x: 14, y: 14, width: 7, height: 7, rx: 1.4 },
      { x: 3, y: 14, width: 7, height: 7, rx: 1.4 }
    ]
  },
  admin: {
    viewBox: '0 0 24 24',
    paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']
  },
  users: {
    viewBox: '0 0 24 24',
    paths: [
      'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2',
      'M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
      'M23 21v-2a4 4 0 0 0-3-3.87',
      'M16 3.13a4 4 0 0 1 0 7.75'
    ]
  },
  products: {
    viewBox: '0 0 24 24',
    paths: [
      'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
      'M3.27 6.96L12 12l8.73-5.04',
      'M12 22V12'
    ]
  },
  categories: {
    viewBox: '0 0 24 24',
    paths: [
      'M20.59 13.41L12 4.83a2 2 0 0 0-1.41-.59H4a2 2 0 0 0-2 2v6.59a2 2 0 0 0 .59 1.41l8.59 8.59a2 2 0 0 0 2.82 0l6.59-6.59a2 2 0 0 0 0-2.82z'
    ],
    circles: [{ cx: 7.5, cy: 7.5, r: 1.5 }]
  }
}

const icon = computed(() => {
  const base = icons[props.name]
  if (!base) return null
  return {
    viewBox: base.viewBox,
    paths: base.paths || [],
    circles: base.circles || [],
    rects: base.rects || []
  }
})
</script>

<template>
  <svg
    v-if="icon"
    class="icon"
    :viewBox="icon.viewBox"
    :width="size"
    :height="size"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="title ? 'img' : 'presentation'"
    :aria-hidden="title ? 'false' : 'true'"
  >
    <title v-if="title">{{ title }}</title>
    <path v-for="(d, index) in icon.paths" :key="`p-${index}`" :d="d" />
    <circle
      v-for="(circle, index) in icon.circles"
      :key="`c-${index}`"
      :cx="circle.cx"
      :cy="circle.cy"
      :r="circle.r"
    />
    <rect
      v-for="(rect, index) in icon.rects"
      :key="`r-${index}`"
      :x="rect.x"
      :y="rect.y"
      :width="rect.width"
      :height="rect.height"
      :rx="rect.rx || 0"
      :ry="rect.ry || 0"
    />
  </svg>
</template>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  overflow: visible;
}
</style>
