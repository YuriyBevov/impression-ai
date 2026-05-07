<template>
  <Tag 
    :severity="severity" 
    :value="label" 
    :style="{ backgroundColor: backgroundColor, color: textColor }"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { CollectionType } from '@/types/qdrant';
import { COLLECTION_TYPES } from '@/constants/app';

interface Props {
  type: CollectionType;
}

const props = defineProps<Props>();

const tagConfig = computed(() => {
  return COLLECTION_TYPES.find(t => t.value === props.type) || COLLECTION_TYPES[3]; // unknown as fallback
});

const label = computed(() => tagConfig.value.label);
const severity = computed(() => 'info'); // We'll use custom styling instead
const backgroundColor = computed(() => {
  const colors: Record<string, string> = {
    blue: '#dbeafe',
    green: '#dcfce7', 
    orange: '#ffedd5',
    gray: '#e5e7eb',
    purple: '#f3e8ff'
  };
  return colors[tagConfig.value.color] || '#e5e7eb';
});
const textColor = computed(() => {
  const colors: Record<string, string> = {
    blue: '#1e40af',
    green: '#166534',
    orange: '#c2410c',
    gray: '#374151',
    purple: '#6b21a8'
  };
  return colors[tagConfig.value.color] || '#374151';
});
</script>