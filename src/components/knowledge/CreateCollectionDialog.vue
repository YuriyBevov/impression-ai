<template>
  <Dialog
    v-model:visible="visibleModel"
    :modal="true"
    :closable="true"
    header="Создать новую коллекцию"
    :style="{ width: '450px', minHeight: '380px' }"
    @hide="onHide"
  >
    <div class="create-form">
      <div class="field">
        <label for="target-lang" class="block mb-2">Язык перевода</label>
        <small class="field-hint">Источник всегда русский (RU). Выберите язык перевода.</small>
        <Select
          id="target-lang"
          v-model="selectedLang"
          :options="languageOptions"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          placeholder="Выберите язык перевода"
          class="w-full mt-2"
          :disabled="creating || loadingLangs"
        />
      </div>

      <div v-if="selectedLang" class="mt-3 preview">
        <p class="font-bold">Будут созданы коллекции:</p>
        <ul>
          <li><Tag :value="`glossary_${selectedLang}`" severity="info" class="mr-2" /> Глоссарий (термины)</li>
          <li><Tag :value="`examples_${selectedLang}`" severity="success" class="mr-2" /> Стилистика (примеры)</li>
          <li><Tag :value="`clients_${selectedLang}`" severity="warn" class="mr-2" /> Клиентские уточнения перевода</li>
        </ul>
      </div>
      
      <Message v-if="error" severity="error" class="mt-2">{{ error }}</Message>
    </div>
    
    <template #footer>
      <Button
        label="Отмена"
        icon="pi pi-times"
        severity="secondary"
        outlined
        @click="onHide"
        :disabled="creating"
      />
      <Button
        label="Создать"
        icon="pi pi-check"
        @click="onCreate"
        :loading="creating"
        :disabled="!selectedLang"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TARGET_LANGUAGES } from '@/constants/app';
import { qdrantService } from '@/services/api/qdrant.service';

interface Props {
  visible: boolean;
  existingCollections: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'close': [];
  'created': [];
}>();

const selectedLang = ref<string>('');
const creating = ref(false);
const error = ref('');

const visibleModel = computed({
  get: () => props.visible,
  set: (val) => { if (!val) emit('close'); }
});

const allLanguages = ref<{ label: string; value: string; disabled: boolean }[]>([]);
const loadingLangs = ref(false);

// Disable languages that already have any of the 3 collections
const languageOptions = computed(() => {
  return TARGET_LANGUAGES.map(lang => ({
    label: `${lang.label} (RU → ${lang.value.toUpperCase()})`,
    value: lang.value,
    disabled: [
      `glossary_${lang.value}`,
      `examples_${lang.value}`,
      `clients_${lang.value}`
    ].some(name => props.existingCollections.includes(name))
  }));
});

const onCreate = async () => {
  if (!selectedLang.value) return;
  
  creating.value = true;
  error.value = '';
  
  const lang = selectedLang.value;
  const collections = [
    `glossary_${lang}`,
    `examples_${lang}`,
    `clients_${lang}`
  ];
  
  try {
    for (const name of collections) {
      await qdrantService.createCollection(name);
    }
    selectedLang.value = '';
    emit('created');
  } catch (e: any) {
    error.value = e?.message || 'Ошибка при создании коллекций';
  } finally {
    creating.value = false;
  }
};

const onHide = () => {
  if (!creating.value) {
    selectedLang.value = '';
    error.value = '';
    emit('close');
  }
};
</script>

<style scoped>
.create-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-hint {
  color: var(--text-color-secondary);
  font-size: 0.85em;
}

.preview ul {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.preview li {
  margin-bottom: 6px;
}
</style>
