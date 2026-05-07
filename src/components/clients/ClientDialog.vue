<template>
  <Dialog 
    v-model:visible="displayDialog" 
    :header="isEditing ? 'Редактировать клиента' : 'Добавить нового клиента'" 
    :modal="true" 
    :closable="true"
    :style="{ width: '700px' }"
    @hide="resetForm"
  >
    <div class="formgrid grid">
      <div class="field col-12 md:col-6">
        <label for="name" class="block mb-2">Имя клиента *</label>
        <InputText 
          id="name" 
          v-model="formData.name" 
          type="text" 
          placeholder="Введите имя клиента"
          class="w-full"
          :class="{ 'p-invalid': errors.name }"
        />
        <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <label for="inn" class="block mb-2">ИНН</label>
        <InputText 
          id="inn" 
          v-model="formData.inn" 
          type="text" 
          placeholder="Введите ИНН"
          class="w-full"
        />
      </div>

      <div class="field col-12 md:col-6">
        <label for="email" class="block mb-2">Email *</label>
        <InputText 
          id="email" 
          v-model="formData.email" 
          type="email" 
          placeholder="Введите email"
          class="w-full"
          :class="{ 'p-invalid': errors.email }"
        />
        <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
      </div>

      <div class="field col-12 md:col-6">
        <label for="phone" class="block mb-2">Телефон</label>
        <InputText 
          id="phone" 
          v-model="formData.phone" 
          type="tel" 
          placeholder="Введите телефон"
          class="w-full"
        />
      </div>

      <div class="field col-12">
        <label for="legal_address" class="block mb-2">Юридический адрес</label>
        <Textarea 
          id="legal_address" 
          v-model="formData.legal_address" 
          :autoResize="true"
          rows="3"
          placeholder="Введите юридический адрес"
          class="w-full"
        />
      </div>

      <div class="field col-12">
        <label for="contact_info" class="block mb-2">Контактная информация</label>
        <Textarea 
          id="contact_info" 
          v-model="formData.contact_info" 
          :autoResize="true"
          rows="3"
          placeholder="Введите контактную информацию"
          class="w-full"
        />
      </div>

      <div class="field col-12">
        <label for="notes" class="block mb-2">Примечания</label>
        <Textarea 
          id="notes" 
          v-model="formData.notes" 
          :autoResize="true"
          rows="3"
          placeholder="Введите примечания"
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <Button 
        label="Отмена" 
        icon="pi pi-times" 
        @click="cancel"
        text 
        severity="secondary"
      />
      <Button 
        :label="isEditing ? 'Сохранить' : 'Создать'" 
        icon="pi pi-check" 
        @click="save"
        :loading="saving"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Client } from '@/types/client';
import { required, isValidEmail } from '@/utils/validators';

interface DialogProps {
  visible: boolean;
  client?: Client;
}

interface FormData {
  name: string;
  inn: string;
  legal_address: string;
  email: string;
  phone: string;
  contact_info: string;
  notes: string;
}

interface Errors {
  name?: string;
  email?: string;
}

const props = withDefaults(defineProps<DialogProps>(), {
  client: undefined
});

const emit = defineEmits<{
  save: [client: Partial<Client>];
  close: [];
}>();

const formData = ref<FormData>({
  name: '',
  inn: '',
  legal_address: '',
  email: '',
  phone: '',
  contact_info: '',
  notes: ''
});
const saving = ref(false);
const errors = ref<Errors>({});
const displayDialog = computed({
  get: () => props.visible,
  set: (value: boolean) => !value && cancel()
});

const isEditing = computed(() => !!props.client);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.client) {
      // Editing existing client
      formData.value = { 
        name: props.client.name || '',
        inn: props.client.inn || '',
        legal_address: props.client.legal_address || '',
        email: props.client.email || '',
        phone: props.client.phone || '',
        contact_info: props.client.contact_info || '',
        notes: props.client.notes || ''
      };
    } else if (newVal && !props.client) {
      // Creating new client - reset form
      resetForm();
    }
  }
);

const resetForm = () => {
  formData.value = {
    name: '',
    inn: '',
    legal_address: '',
    email: '',
    phone: '',
    contact_info: '',
    notes: ''
  };
  errors.value = {};
};

const validate = (): boolean => {
  errors.value = {};
  
  const nameError = required(formData.value.name);
  if (nameError !== true) {
    errors.value.name = nameError;
  }
  
  const emailError = isValidEmail(formData.value.email);
  if (emailError !== true) {
    errors.value.email = emailError;
  }
  
  return Object.keys(errors.value).length === 0;
};

const save = async () => {
  if (!validate()) {
    return;
  }

  saving.value = true;
  try {
    const clientData: Partial<Client> = {
      ...formData.value,
      status: isEditing.value ? props.client!.status : 'active'
    };
    
    emit('save', clientData);
  } finally {
    saving.value = false;
  }
};

const cancel = () => {
  resetForm();
  emit('close');
};
</script>