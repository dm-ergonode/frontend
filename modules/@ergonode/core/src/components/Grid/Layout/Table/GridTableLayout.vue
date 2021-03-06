/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <div
        :class="classes"
        ref="gridTableLayout"
        @focusin="onFocusInside"
        @focusout="onFocusOut">
        <GridTableLayoutPinnedSection
            v-if="isSelectColumn"
            :is-pinned="pinnedSections[pinnedState.LEFT]">
            <GridSelectRowColumn
                :style="templateRows"
                :column-index="0"
                :data-count="dataCount"
                :rows-offset="rowsOffset"
                :is-basic-filter="isBasicFilter"
                @row-select="onRowSelect"
                @rows-select="onRowsSelect" />
        </GridTableLayoutPinnedSection>
        <GridTableLayoutColumnsSection
            :style="templateColumns"
            ref="columnsSection">
            <GridSentinelColumn
                v-if="isSelectColumn"
                :pinned-state="pinnedState.LEFT"
                @sticky="onStickyChange" />
            <template v-for="(column, columnIndex) in orderedColumns">
                <Component
                    v-if="extendedColumns[column.id]"
                    :is="extendedColumns[column.id]"
                    :style="templateRows"
                    :key="column.id"
                    :index="columnIndex"
                    :column="column"
                    :rows="rows"
                    :row-ids="rowIds"
                    :drafts="drafts"
                    :rows-offset="rowsOffset"
                    :is-basic-filter="isBasicFilter"
                    @remove="onRemoveColumn"
                    @swap="onSwapColumns"
                    @resize="onResizeColumn"
                    @sort="onSortColumn"
                    @edit-filter-cell="onEditFilterCell"
                    @filter-value="onFilterValueChange"
                    @cell-value="onCellValueChange"
                    @edit-cell="onEditCell"
                />
                <GridDraggableColumn
                    v-else
                    :style="templateRows"
                    :index="columnIndex + columnsOffset"
                    :column="column"
                    :key="column.id"
                    @remove="onRemoveColumn"
                    @swap="onSwapColumns">
                    <GridColumn
                        :index="columnIndex + columnsOffset"
                        @resize="onResizeColumn">
                        <GridHeaderCell
                            :row-index="rowsOffset"
                            :column-index="columnIndex + columnsOffset"
                            :column-id="column.id"
                            :label="column.label"
                            :deletable="column.deletable"
                            :sorted-column="sortedColumn"
                            @sort="onSortColumn"
                            @remove="onRemoveColumn" />
                        <template v-if="isBasicFilter">
                            <GridFilterDataCell
                                v-if="column.filter"
                                :row-index="rowsOffset + basicFiltersOffset"
                                :value="filters[column.id]"
                                :component="dataFilterCellComponents[column.filter.type]"
                                :column-index="columnIndex + columnsOffset"
                                :language-code="column.language"
                                :column-id="column.id"
                                :filter="column.filter"
                                @edit-filter-cell="onEditFilterCell"
                                @filter-value="onFilterValueChange" />
                            <GridTableCell
                                v-else
                                :locked="true"
                                :row="rowsOffset + basicFiltersOffset"
                                :column="columnIndex + columnsOffset" />
                        </template>
                        <GridDataCell
                            v-for="(row, rowIndex) in rows"
                            :key="`${rowIds[rowIndex]}|${column.id}`"
                            :component="dataCellComponents[column.type]"
                            :data="row[column.id]"
                            :drafts="drafts"
                            :column="column"
                            :error-messages="errors[`${rowIds[rowIndex]}/${column.id}`]"
                            :row-id="rowIds[rowIndex]"
                            :column-index="columnIndex + columnsOffset"
                            :row-index="rowsOffset + rowIndex + basicFiltersOffset + 1"
                            :is-locked="!(column.editable && isEditable)"
                            :is-copyable="column.editable && isEditable"
                            :is-selected="isSelectedAllRows
                                || selectedRows[rowsOffset + rowIndex + basicFiltersOffset + 1]"
                            @cell-value="onCellValueChange"
                            @edit-cell="onEditCell" />
                    </GridColumn>
                </GridDraggableColumn>
            </template>
            <GridSentinelColumn
                v-if="actionColumns.length"
                :style="{ gridColumn: `${orderedColumns.length}`}"
                :pinned-state="pinnedState.RIGHT"
                @sticky="onStickyChange" />
        </GridTableLayoutColumnsSection>
        <GridTableLayoutPinnedSection :is-pinned="pinnedSections[pinnedState.RIGHT]">
            <GridActionColumn
                v-for="(column, columnIndex) in actionColumns"
                :style="templateRows"
                :key="column.id">
                <GridTableCell
                    :row="rowsOffset"
                    :column="orderedColumns.length + columnIndex + columnsOffset"
                    :locked="true" />
                <GridTableCell
                    v-if="isBasicFilter"
                    :row="rowsOffset + basicFiltersOffset"
                    :column="orderedColumns.length + columnIndex + columnsOffset"
                    :locked="true" />
                <template v-for="(row, rowIndex) in rows">
                    <GridActionCell
                        :key="`${rowIds[rowIndex]}|${column.id}`"
                        :component="actionCellComponents[column.id]"
                        :column-index="orderedColumns.length + columnIndex + columnsOffset"
                        :column="column"
                        :action="row._links.value[column.id]"
                        :row-index="rowsOffset + rowIndex + basicFiltersOffset + 1"
                        :is-selected="isSelectedAllRows
                            || selectedRows[rowsOffset + rowIndex + basicFiltersOffset + 1]"
                        @action="onRowAction"
                    />
                </template>
            </GridActionColumn>
        </GridTableLayoutPinnedSection>
        <Component
            v-if="editCell"
            :is="editCellComponent"
            ref="editCell"
            v-bind="editCell.props"
            @cell-value="onCellValueChange"
            @dismiss="onDismissEditCell" />
        <Component
            v-if="editFilterCell"
            :is="editFilterCellComponent"
            ref="editCell"
            v-bind="editFilterCell.props"
            @filter-value="onFilterValueChange"
            @dismiss="onDismissEditFilterCell" />
        <GridCellResizer
            v-if="cellResizer"
            v-bind="cellResizer"
            @resize="onCellResize"
            @copy="onCopyCellValuesByResizing" />
    </div>
</template>

<script>
import DropZone from '@Core/components/DropZone/DropZone';
import GridActionCell from '@Core/components/Grid/Layout/Table/Cells/Action/GridActionCell';
import GridFilterDataCell from '@Core/components/Grid/Layout/Table/Cells/Data/Filter/GridFilterDataCell';
import GridDataCell from '@Core/components/Grid/Layout/Table/Cells/Data/GridDataCell';
import GridTableCell from '@Core/components/Grid/Layout/Table/Cells/GridTableCell';
import GridHeaderCell from '@Core/components/Grid/Layout/Table/Cells/Header/GridHeaderCell';
import GridActionColumn from '@Core/components/Grid/Layout/Table/Columns/GridActionColumn';
import GridColumn from '@Core/components/Grid/Layout/Table/Columns/GridColumn';
import GridDraggableColumn from '@Core/components/Grid/Layout/Table/Columns/GridDraggableColumn';
import GridTableLayoutColumnsSection from '@Core/components/Grid/Layout/Table/Sections/GridTableLayoutColumnsSection';
import GridTableLayoutPinnedSection from '@Core/components/Grid/Layout/Table/Sections/GridTableLayoutPinnedSection';
import {
    COLUMN_WIDTH,
    GRID_ACTION,
    PINNED_COLUMN_STATE,
    ROW_HEIGHT,
} from '@Core/defaults/grid';
import gridResizerCellMixin from '@Core/mixins/grid/cell/gridResizerCellMixin';
import {
    swapItemPosition,
} from '@Core/models/arrayWrapper';
import {
    getPositionForBrowser,
    isMouseInsideElement,
} from '@Core/models/drag_and_drop/helpers';
import {
    capitalizeAndConcatenationArray,
} from '@Core/models/stringWrapper';

export default {
    name: 'GridTableLayout',
    components: {
        DropZone,
        GridDraggableColumn,
        GridTableLayoutColumnsSection,
        GridColumn,
        GridActionColumn,
        GridTableCell,
        GridFilterDataCell,
        GridActionCell,
        GridDataCell,
        GridHeaderCell,
        GridTableLayoutPinnedSection,
        GridSentinelColumn: () => import('@Core/components/Grid/Layout/Table/Columns/GridSentinelColumn'),
        GridSelectRowColumn: () => import('@Core/components/Grid/Layout/Table/Columns/GridSelectRowColumn'),
    },
    mixins: [
        gridResizerCellMixin,
    ],
    props: {
        /**
         * List of columns presented at Grid
         */
        columns: {
            type: Array,
            default: () => [],
        },
        /**
         * List of rows presented at Grid
         */
        rows: {
            type: Array,
            default: () => [],
        },
        /**
         * List of rows ids
         */
        rowIds: {
            type: Array,
            default: () => [],
        },
        /**
         * The drafts are unsaved changes, cached changed data at given time
         */
        drafts: {
            type: Object,
            default: () => ({}),
        },
        /**
         * The validation errors
         */
        errors: {
            type: Object,
            default: () => ({}),
        },
        /**
         * Selected filter values
         */
        filters: {
            type: Object,
            default: () => ({}),
        },
        /**
         * Current visible page at Grid
         */
        currentPage: {
            type: Number,
            default: 1,
        },
        /**
         * Max visible rows for *currentPage* at Grid
         */
        maxRows: {
            type: Number,
            default: 1,
        },
        /**
         * Determines the size of row height
         */
        rowHeight: {
            type: Number,
            default: ROW_HEIGHT.SMALL,
        },
        /**
         * Determinate if the component is being able to edit
         */
        isEditable: {
            type: Boolean,
            default: false,
        },
        /**
         * Determines if selecting row column is visible
         */
        isSelectColumn: {
            type: Boolean,
            default: false,
        },
        /**
         * Determines if filters are visible
         */
        isBasicFilter: {
            type: Boolean,
            default: false,
        },
        /**
         * The model of extended data column type filter cells components
         */
        extendedDataFilterCells: {
            type: Object,
            default: () => ({}),
        },
        /**
         * The model of extended edit column type filter cells components
         */
        extendedDataEditFilterCells: {
            type: Object,
            default: () => ({}),
        },
        /**
         * The model of extended data column type cells components
         */
        extendedDataCells: {
            type: Object,
            default: () => ({}),
        },
        /**
         * The model of extended edit column type cells components
         */
        extendedDataEditCells: {
            type: Object,
            default: () => ({}),
        },
        /**
         * The model of extended type columns components
         */
        extendedColumns: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            hasInitialWidths: true,
            isSelectedAllRows: false,
            selectedRows: {},
            orderedColumns: [],
            actionColumns: [],
            columnWidths: [],
            dataCellComponents: {},
            actionCellComponents: {},
            dataFilterCellComponents: {},
            filterTypes: {},
            columnTypes: {},
            sortedColumn: {},
            pinnedSections: {},
            editCell: null,
            editFilterCell: null,
        };
    },
    computed: {
        classes() {
            return [
                'grid-table-layout',
                {
                    'grid-table-layout--placeholder': this.dataCount === 0,
                },
            ];
        },
        visibleColumns() {
            return this.columns.filter(column => column.visible);
        },
        gridActions() {
            return Object.values(GRID_ACTION);
        },
        editCellComponent() {
            const type = this.columnTypes[this.editCell.type];

            if (this.extendedDataEditCells[this.editCell.type]) {
                return this.extendedDataEditCells[this.editCell.type];
            }

            return () => import(`@Core/components/Grid/Layout/Table/Cells/Edit/Grid${type}EditCell`)
                .catch(() => import('@Core/components/Grid/Layout/Table/Cells/Edit/GridTextEditCell'));
        },
        editFilterCellComponent() {
            const type = this.filterTypes[this.editFilterCell.type];

            if (this.extendedDataEditFilterCells[this.editFilterCell.type]) {
                return this.extendedDataEditFilterCells[this.editFilterCell.type];
            }

            return () => import(`@Core/components/Grid/Layout/Table/Cells/Edit/Filter/Grid${type}EditFilterCell`)
                .catch(() => import('@Core/components/Grid/Layout/Table/Cells/Edit/Filter/GridTextEditFilterCell'));
        },
        dataCount() {
            return this.rows.length;
        },
        rowsOffset() {
            return (this.currentPage - 1) * this.maxRows;
        },
        columnsOffset() {
            return this.isSelectColumn ? 1 : 0;
        },
        basicFiltersOffset() {
            return this.isBasicFilter ? 1 : 0;
        },
        templateColumns() {
            return {
                gridTemplateColumns: this.columnWidths.join(' '),
            };
        },
        headerRowsTemplate() {
            return this.isBasicFilter ? `${ROW_HEIGHT.SMALL}px ${ROW_HEIGHT.SMALL}px` : `${ROW_HEIGHT.SMALL}px`;
        },
        templateRows() {
            if (this.dataCount) {
                return {
                    gridTemplateRows: `${this.headerRowsTemplate} repeat(${this.dataCount}, ${this.rowHeight}px)`,
                };
            }

            return {
                gridTemplateRows: this.headerRowsTemplate,
            };
        },
        pinnedState() {
            return PINNED_COLUMN_STATE;
        },
    },
    watch: {
        columns: {
            immediate: true,
            handler() {
                if (this.orderedColumns.length !== this.visibleColumns.length
                    || (this.rows.length && !Object.keys(this.actionCellComponents).length)) {
                    this.initializeColumns();
                }
            },
        },
    },
    methods: {
        onMouseDown(event) {
            if (this.$refs.editCell) {
                const {
                    xPos, yPos,
                } = getPositionForBrowser(event);
                if (!isMouseInsideElement(this.$refs.editCell.$el, xPos, yPos)) {
                    if (this.editCell) {
                        this.onDismissEditCell();
                    } else {
                        this.onDismissEditFilterCell();
                    }
                }
            }
        },
        onDismissEditCell() {
            const {
                row,
                column,
            } = this.editCell.props;

            this.$refs.gridTableLayout.querySelector(`.coordinates-${column}-${row}`).focus();
            this.onEditCell();
        },
        onDismissEditFilterCell() {
            const {
                row,
                column,
            } = this.editFilterCell.props;

            this.$refs.gridTableLayout.querySelector(`.coordinates-${column}-${row}`).focus();
            this.onEditFilterCell();
        },
        onEditCell(editCell = null) {
            this.editCell = editCell;

            if (editCell) {
                this.$refs.gridTableLayout.addEventListener('mousedown', this.onMouseDown);
            } else {
                this.$refs.gridTableLayout.removeEventListener('mousedown', this.onMouseDown);
            }
        },
        onEditFilterCell(editFilterCell = null) {
            this.editFilterCell = editFilterCell;

            if (editFilterCell) {
                this.$refs.gridTableLayout.addEventListener('mousedown', this.onMouseDown);
            } else {
                this.$refs.gridTableLayout.removeEventListener('mousedown', this.onMouseDown);
            }
        },
        onSortColumn(sortedColumn) {
            this.sortedColumn = sortedColumn;
            this.$emit('sort', sortedColumn);
        },
        onFilterValueChange({
            value,
            columnId,
        }) {
            this.$emit('filter', {
                ...this.filters,
                [columnId]: value,
            });
        },
        onRemoveColumn(index) {
            const column = this.orderedColumns[index];

            this.orderedColumns.splice(index, 1);
            this.columnWidths.splice(index, 1);

            this.$emit('remove-column', {
                index: index - this.columnsOffset,
                column,
            });
        },
        onResizeColumn({
            index,
            width,
        }) {
            if (this.hasInitialWidths) {
                this.initialColumnWidths();
            }

            this.columnWidths[index] = width;
            this.columnWidths = [
                ...this.columnWidths,
            ];
        },
        onSwapColumns({
            from,
            to,
        }) {
            this.swapColumnWidths({
                from,
                to,
            });
            this.swapColumnsOrder({
                from,
                to,
            });
            this.$emit('swap-columns', {
                from: from - this.columnsOffset,
                to: to - this.columnsOffset,
            });
        },
        onStickyChange({
            isSticky, state,
        }) {
            this.pinnedSections = {
                ...this.pinnedSections,
                [state]: isSticky,
            };
        },
        onRowSelect(selectedRows) {
            this.selectedRows = selectedRows;

            this.$emit('row-select', this.selectedRows);
        },
        onRowsSelect(isSelectedAllRows) {
            this.isSelectedAllRows = isSelectedAllRows;

            this.$emit('rows-select', this.isSelectedAllRows);
        },
        onCellValueChange(value) {
            this.$emit('cell-value', value);
        },
        onRowAction(payload) {
            this.$emit('row-action', payload);
        },
        async initializeColumns() {
            const actionColumns = this.getActionColumns();
            const orderedColumns = [];
            const columnWidths = [];
            const {
                length,
            } = this.visibleColumns;

            const request = [];

            for (let i = 0; i < length; i += 1) {
                const column = this.visibleColumns[i];

                if (typeof this.columnTypes[column.type] === 'undefined') {
                    this.columnTypes[column.type] = this.getColumnTypeName(column);

                    if (this.extendedDataCells[column.type]) {
                        this.setExtendedDataCell(column);
                    } else {
                        request.push(this.setDataCell(column.type));
                    }
                }

                if (column.filter && typeof this.filterTypes[column.filter.type] === 'undefined') {
                    this.filterTypes[column.filter.type] = this.getColumnFilterTypeName(column);

                    if (this.extendedDataFilterCells[column.filter.type]) {
                        this.setExtendedFilterDataCell(column);
                    } else {
                        request.push(this.setDataFilterCell(column.filter.type));
                    }
                }

                orderedColumns.push(column);
                columnWidths.push(column.width || COLUMN_WIDTH.DEFAULT);
            }

            for (let i = 0; i < actionColumns.length; i += 1) {
                const {
                    id,
                } = actionColumns[i];

                if (typeof this.actionCellComponents[id] === 'undefined') {
                    request.push(this.setActionCell(id));
                }
            }

            await Promise.all(request);

            this.actionColumns = actionColumns;
            this.orderedColumns = orderedColumns;
            this.columnWidths = columnWidths;

            if (request.length) {
                this.$emit('rendered');
            }
        },
        initialColumnWidths() {
            const {
                columnsSection,
            } = this.$refs;
            const {
                length,
            } = columnsSection.$el.children;

            for (let i = 0; i < length; i += 1) {
                const {
                    width,
                } = columnsSection.$el.children[i].getBoundingClientRect();

                this.columnWidths[i] = `${width}px`;
            }

            this.hasInitialWidths = false;
        },
        swapColumnWidths({
            from,
            to,
        }) {
            this.columnWidths = [
                ...swapItemPosition(
                    this.columnWidths,
                    from,
                    to,
                ),
            ];
        },
        swapColumnsOrder({
            from,
            to,
        }) {
            this.orderedColumns = [
                ...swapItemPosition(
                    this.orderedColumns,
                    from,
                    to,
                ),
            ];
        },
        getActionColumns() {
            const {
                length: dataLength,
            } = this.rows;
            const {
                length: actionsLength,
            } = this.gridActions;
            const actionColumns = [];
            const tmp = {};

            for (let i = 0; i < dataLength; i += 1) {
                const row = this.rows[i];

                for (let j = 0; j < actionsLength; j += 1) {
                    const action = this.gridActions[j];

                    if (!tmp[action]
                        && row._links
                        && row._links.value[action]) {
                        tmp[action] = true;

                        if ((action === GRID_ACTION.GET && !tmp[GRID_ACTION.EDIT])
                            || action !== GRID_ACTION.GET) {
                            actionColumns.push({
                                id: action,
                            });
                        }
                    }
                }
            }

            return actionColumns;
        },
        getColumnFilterTypeName(column) {
            return this.columnTypes[column.filter.type] || capitalizeAndConcatenationArray(column.filter.type.split('_'));
        },
        getColumnTypeName(column) {
            return capitalizeAndConcatenationArray(column.type.split('_'));
        },
        setExtendedFilterDataCell(column) {
            this.dataFilterCellComponents[
                column.filter.type
            ] = this.extendedDataFilterCells[column.filter.type];
        },
        setExtendedDataCell(column) {
            this.dataCellComponents[
                column.type
            ] = this.extendedDataCells[column.type];
        },
        setDataCell(type) {
            return import(`@Core/components/Grid/Layout/Table/Cells/Data/Grid${this.columnTypes[type]}DataCell`)
                .then((response) => {
                    this.dataCellComponents[type] = response.default;
                })
                .catch(() => import('@Core/components/Grid/Layout/Table/Cells/Data/GridTextDataCell')
                    .then((response) => {
                        this.dataCellComponents[type] = response.default;
                    }));
        },
        setDataFilterCell(type) {
            return import(`@Core/components/Grid/Layout/Table/Cells/Data/Filter/Grid${this.filterTypes[type]}FilterDataCell`)
                .then((response) => {
                    this.dataFilterCellComponents[type] = response.default;
                }).catch(() => import('@Core/components/Grid/Layout/Table/Cells/Data/Filter/GridDefaultFilterDataCell')
                    .then((response) => {
                        this.dataFilterCellComponents[type] = response.default;
                    }));
        },
        setActionCell(id) {
            const type = capitalizeAndConcatenationArray(id.split('_'));

            return import(`@Core/components/Grid/Layout/Table/Cells/Action/Grid${type}ActionCell`)
                .then((response) => {
                    this.actionCellComponents[id] = response.default;
                })
                .catch(() => import('@Core/components/Grid/Layout/Table/Cells/GridTableCell')
                    .then((response) => {
                        this.actionCellComponents[id] = response.default;
                    }));
        },
        getGridTableLayoutReference() {
            return this.$refs.gridTableLayout;
        },
    },
    provide() {
        return {
            getGridTableLayoutReference: this.getGridTableLayoutReference,
        };
    },
};
</script>

<style lang="scss" scoped>
    .grid-table-layout {
        position: relative;
        display: flex;
        overflow: auto;

        &--placeholder {
            flex-shrink: 0;
        }
    }
</style>
