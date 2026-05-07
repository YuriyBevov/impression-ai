<template>
	<div class="points-table">
		<!-- Search field -->
		<div class="search-container mb-3">
			<IconField>
				<InputIcon>
					<i class="pi pi-search" />
				</InputIcon>
				<InputText
					v-model="searchTerm"
					placeholder="Поиск по всем полям..."
					class="w-full"
				/>
			</IconField>
		</div>

		<!-- Data table -->
		<DataTable
			:value="filteredPoints"
			:paginator="true"
			:rows="10"
			:rowsPerPageOptions="[5, 10, 20, 50]"
			paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
			currentPageReportTemplate="Показаны {first} - {last} из {totalRecords}"
			responsiveLayout="scroll"
			stripedRows
		>
			<Column
				field="payload.source_term"
				header="Исходный термин"
				style="width: 220px"
				sortable
			>
				<template #body="slotProps">
					<span class="cell-truncate">{{
						slotProps.data.payload.source_term || "-"
					}}</span>
				</template>
			</Column>

			<Column
				field="payload.target_term"
				header="Переведенный термин"
				style="width: 220px"
				sortable
			>
				<template #body="slotProps">
					<span class="cell-truncate">{{
						slotProps.data.payload.target_term || "-"
					}}</span>
				</template>
			</Column>

			<Column field="payload.context" header="Категория" style="width: 200px">
				<template #body="slotProps">
					<span class="truncate">{{
						slotProps.data.payload.context || "-"
					}}</span>
				</template>
			</Column>

			<Column field="payload.tags" header="Теги" style="width: 160px">
				<template #body="slotProps">
					<div
						v-if="
							slotProps.data.payload.tags &&
							slotProps.data.payload.tags.length > 0
						"
						class="tag-chips"
					>
						<Chip
							v-for="(tag, index) in slotProps.data.payload.tags.slice(0, 3)"
							:key="index"
							:label="tag"
							class="mr-1 mb-1"
						/>
						<Chip
							v-if="slotProps.data.payload.tags.length > 3"
							:label="'+' + (slotProps.data.payload.tags.length - 3)"
							severity="secondary"
							class="mr-1 mb-1"
						/>
					</div>
					<span v-else>-</span>
				</template>
			</Column>

			<Column
				v-if="isClientCollection"
				field="payload.client"
				header="Клиент"
				style="width: 200px"
			>
				<template #body="slotProps">
					<span class="truncate">{{
						slotProps.data.payload.client || "-"
					}}</span>
				</template>
			</Column>

			<Column header="Действия" style="width: 120px">
				<template #body="slotProps">
					<div class="actions-cell">
						<Button
							icon="pi pi-pencil"
							severity="info"
							outlined
							rounded
							@click="$emit('edit-point', slotProps.data)"
							v-tooltip.bottom="'Редактировать'"
						/>
						<Button
							icon="pi pi-trash"
							severity="danger"
							outlined
							rounded
							@click="$emit('delete-point', slotProps.data)"
							v-tooltip.bottom="'Удалить'"
						/>
					</div>
				</template>
			</Column>
		</DataTable>
	</div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { KnowledgePoint } from "@/types/qdrant";

interface Props {
	points: KnowledgePoint[];
	collectionType?: string;
}

const props = withDefaults(defineProps<Props>(), {
	collectionType: "glossary",
});

const isClientCollection = computed(() => props.collectionType === "client");
const emit = defineEmits<{
	"edit-point": [point: KnowledgePoint];
	"delete-point": [point: KnowledgePoint];
}>();

const searchTerm = ref("");

const filteredPoints = computed(() => {
	if (!searchTerm.value) {
		return props.points;
	}

	const term = searchTerm.value.toLowerCase();
	return props.points.filter(
		(point) =>
			point.payload.source_term?.toLowerCase().includes(term) ||
			point.payload.target_term?.toLowerCase().includes(term) ||
			point.payload.context?.toLowerCase().includes(term) ||
			point.payload.tags?.some((tag) => tag.toLowerCase().includes(term)),
	);
});
</script>

<style scoped>
.points-table {
	width: 100%;
}

.points-table :deep(.p-inputtext.p-component.w-full) {
	width: 100%;
}

.points-table :deep(.p-datatable-table) {
	table-layout: fixed;
}

.points-table :deep(.p-datatable-tbody > tr > td) {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.points-table :deep(.p-datatable-thead > tr > th) {
	white-space: nowrap;
}

.tag-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 4px;
}

.actions-cell {
	display: flex;
	gap: 0.5rem;
}

.truncate {
	max-width: 150px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.cell-truncate {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
</style>
