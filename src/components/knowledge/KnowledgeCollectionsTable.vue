<template>
	<div class="collections-table">
		<!-- Filter bar: search + language dropdown -->
		<div class="filter-bar mb-3 flex gap-2">
			<IconField class="flex-1">
				<InputIcon>
					<i class="pi pi-search" />
				</InputIcon>
				<InputText
					v-model="searchTerm"
					placeholder="Поиск по названию коллекции..."
					class="w-full"
				/>
			</IconField>

			<Select
				v-model="selectedLanguage"
				:options="languageOptions"
				option-label="label"
				option-value="value"
				placeholder="Все языки"
				class="language-filter"
				showClear
			/>
		</div>

		<!-- Data table -->
		<DataTable
			:value="filteredCollections"
			:paginator="true"
			:rows="10"
			:rowsPerPageOptions="[5, 10, 20, 50]"
			paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
			currentPageReportTemplate="Показаны {first} - {last} из {totalRecords}"
			responsiveLayout="scroll"
			scrollHeight="flex"
			stripedRows
			@row-click="(e: any) => emit('select-collection', e.data.name)"
			selectionMode="single"
			dataKey="name"
		>
			<Column field="name" header="Название" style="width: 220px">
				<template #body="slotProps">
					<div class="flex align-items-center">
						<i class="pi pi-folder mr-2 text-blue-500"></i>
						<span class="cell-ellipsis">{{ slotProps.data.name }}</span>
					</div>
				</template>
			</Column>

			<Column
				field="pointsCount"
				header="Количество терминов"
				style="width: 220px"
				sortable
			>
				<template #body="slotProps">
					{{ slotProps.data.pointsCount }}
				</template>
			</Column>

			<Column field="type" header="Тип">
				<template #body="slotProps">
					<CollectionTypeTag :type="slotProps.data.type" />
				</template>
			</Column>

			<Column header="Действия" style="width: 12rem">
				<template #body="slotProps">
					<Button
						icon="pi pi-arrow-right"
						label="Открыть"
						severity="info"
						outlined
						size="small"
						@click.stop="$emit('select-collection', slotProps.data.name)"
						v-tooltip.bottom="'Открыть коллекцию'"
					/>
				</template>
			</Column>
		</DataTable>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { TARGET_LANGUAGES } from "@/constants/app";
import CollectionTypeTag from "./CollectionTypeTag.vue";

interface Collection {
	name: string;
	pointsCount: number;
	type: string;
}

interface Props {
	collections: Collection[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
	"select-collection": [collectionName: string];
}>();

const searchTerm = ref("");
const selectedLanguage = ref<string | null>("en");

// Build language options from collection names
const languageOptions = computed(() => {
	const langs: Set<string> = new Set();
	props.collections.forEach((c) => {
		const parts = c.name.split("_");
		if (parts.length >= 2) {
			const langCode = parts[parts.length - 1];
			if (langCode.length <= 10) langs.add(langCode);
		}
	});
	return Array.from(langs)
		.map((code) => ({
			label:
				TARGET_LANGUAGES.find((l) => l.value === code)?.label ||
				code.toUpperCase(),
			value: code,
		}))
		.sort((a, b) => a.label.localeCompare(b.label));
});

const filteredCollections = computed(() => {
	let result = props.collections;

	// Filter by search term
	if (searchTerm.value) {
		const term = searchTerm.value.toLowerCase();
		result = result.filter((coll) => coll.name.toLowerCase().includes(term));
	}

	// Filter by language
	if (selectedLanguage.value) {
		result = result.filter((coll) =>
			coll.name.endsWith(`_${selectedLanguage.value}`),
		);
	}

	return result;
});
</script>

<style scoped>
.collections-table {
	width: 100%;
	display: flex;
	flex-direction: column;
	flex: 1;
	min-height: 0;
}

.collections-table :deep(.p-inputtext.p-component.w-full) {
	width: 100%;
}

.collections-table :deep(.p-datatable-table) {
	table-layout: fixed;
}

.collections-table :deep(.p-datatable-tbody > tr > td) {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.collections-table :deep(.p-datatable-thead > tr > th) {
	white-space: nowrap;
}

.collections-table :deep(.p-datatable-tbody tr) {
	cursor: pointer;
}

.cell-ellipsis {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
}

.filter-bar {
	display: flex;
	align-items: center;
	gap: 8px;
}

.language-filter {
	min-width: 200px;
}
</style>
