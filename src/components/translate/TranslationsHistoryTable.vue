<template>
	<div class="history-table">
		<div class="table-header">
			<h3>История переводов</h3>

			<div class="actions">
				<Select
					v-model="clientIdFilter"
					:options="clientOptions"
					optionLabel="name"
					optionValue="id"
					placeholder="Все клиенты"
					@change="updateFilters"
					class="w-auto"
				/>
			</div>
		</div>

		<DataTable
			:value="filteredHistoryItems"
			:paginator="true"
			:rows="10"
			:rowsPerPageOptions="[5, 10, 20, 50]"
			:loading="loading"
			paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
			currentPageReportTemplate="Показаны {first} - {last} из {totalRecords}"
			responsiveLayout="scroll"
			stripedRows
		>
			<Column field="date" header="Дата" style="min-width: 120px" sortable>
				<template #body="slotProps">
					{{ formatDate(slotProps.data.date) }}
				</template>
			</Column>

			<Column
				field="client_name"
				header="Клиент"
				style="min-width: 140px"
				sortable
			>
				<template #body="slotProps">
					<Tag
						:value="slotProps.data.client_name"
						severity="info"
						class="client-tag"
					/>
				</template>
			</Column>

			<Column field="source_lang" header="SRC" style="width: 60px" sortable>
				<template #body="slotProps">
					<Tag
						:value="slotProps.data.source_lang?.toUpperCase()"
						severity="success"
					/>
				</template>
			</Column>

			<Column field="target_lang" header="TRG" style="width: 60px" sortable>
				<template #body="slotProps">
					<Tag
						:value="slotProps.data.target_lang?.toUpperCase()"
						severity="warning"
					/>
				</template>
			</Column>

			<Column
				field="source_text"
				header="Исходный текст"
				style="min-width: 180px"
			>
				<template #body="slotProps">
					<div class="text-truncate">
						{{ truncateText(slotProps.data.source_text, 50) }}
					</div>
				</template>
			</Column>

			<Column field="translated_text" header="Перевод" style="min-width: 180px">
				<template #body="slotProps">
					<div class="text-truncate">
						{{ truncateText(slotProps.data.translated_text, 50) }}
					</div>
				</template>
			</Column>

			<Column field="cost" header="Стоимость" style="min-width: 80px" sortable>
				<template #body="slotProps">
					{{ "$" + formatCost(slotProps.data.cost) }}
				</template>
			</Column>

			<Column field="tokens" header="Токены" style="width: 70px" sortable>
				<template #body="slotProps">
					{{ slotProps.data.tokens }}
				</template>
			</Column>

			<Column header="Действия" style="min-width: 140px">
				<template #body="slotProps">
					<Button
						label="Вернуть в работу"
						icon="pi pi-replay"
						size="small"
						severity="help"
						@click="returnToWork(slotProps.data)"
					/>
				</template>
			</Column>
		</DataTable>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useClientsStore } from "@/stores/clients";
import type { Client } from "@/types/client";
import type { TranslationHistoryItem } from "@/types/translation";
import { formatDate, formatCost, truncateText } from "@/utils/formatters";

interface Props {
	historyItems: TranslationHistoryItem[];
	loading: boolean;
}

const props = defineProps<Props>();
const router = useRouter();
const clientsStore = useClientsStore();

const clientIdFilter = ref<string | null>(null);

const clientOptions = computed(() => {
	return [
		{ id: null, name: "Все клиенты", value: null },
		...clientsStore.items.map((client) => ({
			id: client.id,
			name: client.name,
			value: client.id,
		})),
	];
});

const filteredHistoryItems = computed(() => {
	if (!clientIdFilter.value) {
		return props.historyItems;
	}

	return props.historyItems.filter(
		(item) => item.client_id === clientIdFilter.value,
	);
});

const updateFilters = () => {
	// Filters are handled by computed properties, so we don't need special logic here
};

const returnToWork = (item: TranslationHistoryItem) => {
	if (item && item.id) {
		router.push({ path: '/translate', query: { fillFromHistory: item.id } });
	}
};
</script>

<style scoped>
.table-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
}

.actions {
	display: flex;
	gap: 1rem;
	align-items: center;
}

.text-truncate {
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.history-table :deep(.p-datatable-tbody > tr > td) {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.history-table :deep(.p-datatable-thead > tr > th) {
	white-space: nowrap;
}
</style>
