<template>
  <Tag 
    :value="label" 
    :severity="severity"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ClientStatus } from '@/types/client';

interface Props {
  status: ClientStatus;
}

const props = defineProps<Props>();

const label = computed(() => {
  switch(props.status) {
    case 'active':
      return 'Активен';
    case 'archived':
      return 'Архив';
    default:
      return props.status;
  }
});

const severity = computed(() => {
  switch(props.status) {
    case 'active':
      return 'success';
    case 'archived':
      return 'secondary';
    default:
      return 'info';
  }
});
</script>