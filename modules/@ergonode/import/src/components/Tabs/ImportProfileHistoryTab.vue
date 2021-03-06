/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <CenterViewTemplate>
        <template #content>
            <Grid
                :columns="columns"
                :data-count="filtered"
                :rows="rows"
                :filters="filterValues"
                :extended-columns="extendedColumns"
                :extended-data-cells="extendedDataCells"
                :extended-data-filter-cells="extendedDataFilterCells"
                :extended-data-edit-cells="extendedDataEditCells"
                :extended-edit-filter-cells="extendedDataEditFilterCells"
                :is-prefetching-data="isPrefetchingData"
                :is-basic-filter="true"
                :is-border="true"
                @preview-row="onPreviewRow"
                @fetch-data="onFetchData"
                @remove-all-filters="onRemoveAllFilters"
                @filter="onFilterChange" />
            <ImportDetailsModalGrid
                v-if="isImportDetailsModalVisible"
                :import-id="selectedRow.importId"
                :source-id="selectedRow.sourceId"
                @close="onCloseModalGrid" />
        </template>
    </CenterViewTemplate>
</template>

<script>
import CenterViewTemplate from '@Core/components/Layout/Templates/CenterViewTemplate';
import extendedGridComponentsMixin from '@Core/mixins/grid/extendedGridComponentsMixin';
import fetchGridDataMixin from '@Core/mixins/grid/fetchGridDataMixin';

export default {
    name: 'CollectionProductsTab',
    components: {
        CenterViewTemplate,
        ImportDetailsModalGrid: () => import('@Import/components/Modals/ImportDetailsModalGrid'),
    },
    mixins: [
        fetchGridDataMixin({
            path: 'sources/_id/imports',
        }),
        extendedGridComponentsMixin,
    ],
    async fetch() {
        await this.onFetchData();
        this.isPrefetchingData = false;
    },
    data() {
        return {
            isPrefetchingData: true,
            isImportDetailsModalVisible: false,
            selectedRow: {
                importId: '',
                sourceId: '',
            },
        };
    },
    methods: {
        onPreviewRow(args) {
            const lastIndex = args.length - 1;
            const importId = args[lastIndex];
            const sourceId = args[lastIndex - 2];

            this.selectedRow = {
                importId,
                sourceId,
            };
            this.isImportDetailsModalVisible = true;
        },
        onCloseModalGrid() {
            this.isImportDetailsModalVisible = false;
        },
    },
};
</script>
