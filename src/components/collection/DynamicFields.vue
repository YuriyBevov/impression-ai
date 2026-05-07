<template>
  <div class="dynamic-fields">
    <!-- Render fields organized by section -->
    <div 
      v-for="(sectionFields, sectionName) in groupedFields" 
      :key="sectionName"
      class="field-section"
    >
      <h4>{{ sectionName }}</h4>
      
      <div 
        v-for="field in sectionFields" 
        :key="field.key"
        class="field-row"
      >
        <label :for="field.key">{{ field.label }}:</label>
        
        <!-- Text field -->
        <input-text
          v-if="field.type === 'text'"
          :id="field.key"
          :value="getNestedValue(modelValue, field.key)"
          @input="setNestedValue(field.key, ($event as any).target?.value ?? $event)"
          :placeholder="`Enter ${field.label.toLowerCase()}`"
        />
        
        <!-- Textarea field -->
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="field.key"
          :value="getNestedValue(modelValue, field.key)"
          @input="setNestedValue(field.key, ($event as any).target?.value ?? $event)"
          :placeholder="`Enter ${field.label.toLowerCase()}`"
          rows="3"
        />
        
        <!-- Number field -->
        <input-number
          v-else-if="field.type === 'number'"
          :id="field.key"
          :modelValue="getNestedValue(modelValue, field.key)"
          @update:modelValue="setNestedValue(field.key, $event)"
          :placeholder="`Enter ${field.label.toLowerCase()}`"
        />
        
        <!-- Checkbox field -->
        <checkbox
          v-else-if="field.type === 'checkbox'"
          :id="field.key"
          :checked="getNestedValue(modelValue, field.key)"
          @change="setNestedValue(field.key, $event.checked ?? !getNestedValue(modelValue, field.key))"
          :binary="true"
        />
        
        <!-- Array field (for topics, etc.) -->
        <div v-else-if="field.type === 'array'" class="array-field">
          <div class="array-values">
            <div 
              v-for="(item, idx) in getNestedValue(modelValue, field.key) || []"
              :key="idx"
              class="array-item"
            >
              <input-text 
                :value="getNestedValue(modelValue, field.key)?.[idx] || ''" 
                @input="updateArrayItem(field.key, idx, ($event as any).target?.value ?? $event)"
                :placeholder="`Item ${idx + 1}`"
              />
              <button 
                @click="removeArrayItem(field.key, idx)"
                severity="danger"
                text
                rounded
                size="small"
                icon="pi pi-times"
              />
            </div>
          </div>
          <button 
            @click="addArrayItem(field.key)"
            severity="secondary"
            text
            outlined
            size="small"
            icon="pi pi-plus"
            label="Add Item"
          />
        </div>
        
        <!-- JSON/Object field -->
        <div v-else-if="field.type === 'object'" class="object-field">
          <span class="object-display">{{ truncate(JSON.stringify(getNestedValue(modelValue, field.key)), 50) }}</span>
          <button 
            @click="toggleObjectEditor(field.key)"
            severity="secondary"
            text
            outlined
            size="small"
            icon="pi pi-pencil"
          >
            {{ objectEditors[field.key] ? 'Hide' : 'Edit' }}
          </button>
          
          <div v-if="objectEditors[field.key]" class="object-editor">
            <textarea
              :id="`${field.key}-json`"
              :value="objectModels[field.key] || JSON.stringify(getNestedValue(modelValue, field.key) || {}, null, 2)"
              @input="updateObjectModel(field.key, ($event as any).target?.value ?? $event)"
              :placeholder="`Enter JSON for ${field.label.toLowerCase()}`"
              rows="4"
              class="json-textarea"
            />
          </div>
        </div>
        
        <!-- Fallback to text input -->
        <input-text
          v-else
          :id="field.key"
          :value="getNestedValue(modelValue, field.key)"
          @input="setNestedValue(field.key, ($event as any).target?.value ?? $event)"
          :placeholder="`Enter ${field.label.toLowerCase()}`"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Button from 'primevue/button';

export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'checkbox' | 'array' | 'object' | (string & {});
  section: string;
  value?: any;
}

interface Props {
  fields: FieldDefinition[];
  modelValue: Record<string, any>;
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void;
  (e: 'field-added', field: FieldDefinition): void;
  (e: 'field-removed', key: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  fields: () => [],
  modelValue: () => ({})
});

const emit = defineEmits<Emits>();

// Track which object editors are open
const objectEditors = reactive<Record<string, boolean>>({});

// Track separate model for JSON string representation of objects
const objectModels = reactive<Record<string, string>>({});

// Group fields by section
const groupedFields = computed(() => {
  const groups: Record<string, FieldDefinition[]> = {};
  
  // Initialize with common sections in desired order
  groups['Standard Fields'] = [];
  groups['Translations'] = [];
  groups['Tags'] = [];
  groups['Additional Fields'] = [];
  groups['Other Fields'] = [];
  
  // Add fields to groups
  props.fields.forEach(field => {
    if (!groups[field.section]) {
      groups[field.section] = [];
    }
    groups[field.section].push(field);
    
    // Initialize object editor values if needed
    if (field.type === 'object') {
      if (!objectEditors[field.key]) {
        objectEditors[field.key] = false;
      }
      // Update string value for JSON editor
      objectModels[field.key] = field.value ? JSON.stringify(field.value, null, 2) : '{}';
    }
  });
  
  // Remove empty sections except those explicitly initialized above
  return Object.fromEntries(
    Object.entries(groups).filter(([_, fields]) => fields.length > 0)
  );
});

const getNestedValue = (obj: any, key: string) => {
  if (key.includes('.')) {
    const keys = key.split('.');
    let current = obj;
    for (const k of keys) {
      if (current == null) return undefined;
      current = current[k];
    }
    return current;
  }
  return obj?.[key];
};

const setNestedValue = (key: string, value: any) => {
  const newVal = { ...props.modelValue };
  // set nested value in newVal
  if (key.includes('.')) {
    const keys = key.split('.');
    let current = newVal;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  } else {
    newVal[key] = value;
  }
  emit('update:modelValue', newVal);
};

// Update object model
const updateObjectModel = (fieldKey: string, value: string) => {
  objectModels[fieldKey] = value;
  
  try {
    const parsedValue = JSON.parse(value);
    
    // Update the main model
    const updatedPayload = { ...props.modelValue };
    
    if (fieldKey.includes('.')) {
      const keys = fieldKey.split('.');
      const parentKey = keys[0];
      const childKey = keys.slice(1).join('.');
      
      if (!updatedPayload[parentKey]) {
        updatedPayload[parentKey] = {};
      }
      
      const parentObj = updatedPayload[parentKey];
      const childKeys = childKey.split('.');
      const lastKey = childKeys.pop()!;
      
      let current = parentObj;
      for (const k of childKeys) {
        if (!current[k] || typeof current[k] !== 'object') {
          current[k] = {};
        }
        current = current[k];
      }
      current[lastKey] = parsedValue;
    } else {
      updatedPayload[fieldKey] = parsedValue;
    }
    
    emit('update:modelValue', updatedPayload);
  } catch (e) {
    // If JSON parsing fails, ignore until valid JSON is provided
    console.debug('Invalid JSON input');
  }
};

// Update specific item in array
const updateArrayItem = (fieldKey: string, index: number, value: any) => {
  const currentValue = Array.isArray(props.modelValue[fieldKey]) ? [...props.modelValue[fieldKey]] : [];
  currentValue[index] = value;
  emit('update:modelValue', {
    ...props.modelValue,
    [fieldKey]: currentValue
  });
};

// Remove item from array field
const removeArrayItem = (fieldKey: string, index: number) => {
  const currentValue = Array.isArray(props.modelValue[fieldKey]) ? [...props.modelValue[fieldKey]] : [];
  currentValue.splice(index, 1);
  emit('update:modelValue', {
    ...props.modelValue,
    [fieldKey]: currentValue
  });
};

// Toggle object editor visibility
const toggleObjectEditor = (fieldKey: string) => {
  objectEditors[fieldKey] = !objectEditors[fieldKey];
};

// Watch for changes in object editor models and update the main model
watch(objectModels, (newVal) => {
  Object.keys(newVal).forEach(key => {
    if (objectEditors[key]) { // Only process if editor is open
      try {
        const parsedValue = JSON.parse(newVal[key]);
        
        // Update the main payload object
        const updatedPayload = { ...props.modelValue };
        
        // Handle nested keys like translations.en
        if (key.includes('.')) {
          const keys = key.split('.');
          const parentKey = keys[0];
          const childKey = keys.slice(1).join('.');
          
          if (!updatedPayload[parentKey]) {
            updatedPayload[parentKey] = {};
          }
          
          const parentObj = updatedPayload[parentKey];
          const childKeys = childKey.split('.');
          const lastKey = childKeys.pop()!;
          
          let current = parentObj;
          for (const k of childKeys) {
            if (!current[k] || typeof current[k] !== 'object') {
              current[k] = {};
            }
            current = current[k];
          }
          current[lastKey] = parsedValue;
        } else {
          updatedPayload[key] = parsedValue;
        }
        
        emit('update:modelValue', updatedPayload);
      } catch (e) {
        // If JSON parsing fails, handle the error gracefully
        // Maybe show an error message to the user
      }
    }
  });
}, { deep: true });

// Utility function to truncate long text
const truncate = (str: string, maxLen: number) => {
  if (str.length <= maxLen) return str;
  return str.substring(0, maxLen) + '...';
};
</script>

<style scoped>
.dynamic-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.field-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 15px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.field-section h4 {
  margin: 0 0 10px 0;
  color: #334155;
  font-size: 1.1rem;
  border-bottom: 1px solid #cbd5e1;
  padding-bottom: 5px;
}

.field-row {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-row label {
  font-weight: 500;
  color: #475569;
}

.array-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.array-values {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.array-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.object-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.object-display {
  font-family: monospace;
  background: #f8fafc;
  padding: 5px;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  word-break: break-word;
}

.object-editor {
  margin-top: 10px;
}

.json-textarea {
  width: 100%;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  padding: 8px;
  border: 1px solid #cbd5e1;
  border-radius: 3px;
  resize: vertical;
}
</style>