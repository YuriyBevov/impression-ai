import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';

import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import './assets/main.css';
import App from './App.vue'
import router from './router'
import { setupGuards } from './router/guards'

// PrimeVue components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import MultiSelect from 'primevue/multiselect';
import Dialog from 'primevue/dialog';
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';
import Sidebar from 'primevue/sidebar';
import Toolbar from 'primevue/toolbar';
import Card from 'primevue/card';
import PanelMenu from 'primevue/panelmenu';
import Tag from 'primevue/tag';
import Password from 'primevue/password';
import Textarea from 'primevue/textarea';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import SelectButton from 'primevue/selectbutton';
import Select from 'primevue/select';
import FileUpload from 'primevue/fileupload';
import Message from 'primevue/message';
import ProgressSpinner from 'primevue/progressspinner';
import Chip from 'primevue/chip';
import Tooltip from 'primevue/tooltip';

// PrimeVue services
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

setupGuards(router);

const app = createApp(App);
const pinia = createPinia();

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.use(ConfirmationService);
app.use(ToastService);
app.use(pinia);
app.use(router);

// Register PrimeVue components globally
app.component('Button', Button);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('InputText', InputText);
app.component('InputNumber', InputNumber);
app.component('Checkbox', Checkbox);
app.component('MultiSelect', MultiSelect);
app.component('Dialog', Dialog);
app.component('ConfirmDialog', ConfirmDialog);
app.component('Toast', Toast);
app.component('PSidebar', Sidebar);
app.component('Toolbar', Toolbar);
app.component('Card', Card);
app.component('PanelMenu', PanelMenu);
app.component('Tag', Tag);
app.component('Password', Password);
app.component('Textarea', Textarea);
app.component('IconField', IconField);
app.component('InputIcon', InputIcon);
app.component('SelectButton', SelectButton);
app.component('Select', Select);
app.component('Dropdown', Select);
app.component('FileUpload', FileUpload);
app.component('Message', Message);
app.component('ProgressSpinner', ProgressSpinner);
app.component('Chip', Chip);

// Register services
app.use(ConfirmationService);
app.use(ToastService);

// Register directive
app.directive('tooltip', Tooltip);

app.mount('#app');