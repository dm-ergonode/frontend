/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <CommentsList :is-placeholder="!!commentList.length">
        <template #header>
            <Button
                v-if="!showForm"
                title="NEW COMMENT"
                :disabled="!isAllowedToUpdate"
                :size="smallSize"
                @click.native="openForm">
                <template #prepend="{ color }">
                    <IconAdd :fill-color="color" />
                </template>
            </Button>
            <CommentEdit
                v-else
                :scope="scope"
                :errors="errors"
                :is-edit="false"
                @close="closeForm" />
        </template>
        <template #content>
            <CommentStateChanger
                v-for="comment in commentList"
                :key="comment.id"
                :scope="scope"
                :errors="errors"
                :is-addition-form-visible="showForm"
                :comment="comment"
                @close="closeForm" />
        </template>
        <template #placeholder>
            <ListPlaceholder
                :layout-orientation="horizontalOrientation"
                title="No results"
                subtitle="Here you can share information about the product with other people."
                :bg-url="require('@Core/assets/images/placeholders/comments.svg')" />
        </template>
        <template
            v-if="isMoreButtonVisible"
            #footer>
            <Button
                :title="showMoreText"
                @click.native="showMore">
                <template
                    v-if="isFetchingData"
                    #append="{ color }">
                    <IconSpinner :fill-color="color" />
                </template>
            </Button>
        </template>
    </CommentsList>
</template>

<script>
import CommentEdit from '@Comments/components/Comments/CommentEdit';
import CommentStateChanger from '@Comments/components/Comments/CommentStateChanger';
import CommentsList from '@Comments/components/List/CommentsList';
import Button from '@Core/components/Button/Button';
import IconAdd from '@Core/components/Icons/Actions/IconAdd';
import IconSpinner from '@Core/components/Icons/Feedback/IconSpinner';
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    DATA_LIMIT,
} from '@Core/defaults/grid';
import {
    LAYOUT_ORIENTATION,
} from '@Core/defaults/layout';
import {
    SIZE,
} from '@Core/defaults/theme';
import PRIVILEGES from '@Products/config/privileges';
import {
    mapActions,
    mapState,
} from 'vuex';

export default {
    name: 'ProductCommentsForm',
    components: {
        IconSpinner,
        Button,
        IconAdd,
        CommentsList,
        CommentStateChanger,
        CommentEdit,
        ListPlaceholder: () => import('@Core/components/List/ListPlaceholder'),
    },
    props: {
        scope: {
            type: String,
            default: '',
        },
        errors: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            showForm: false,
            isFetchingData: false,
        };
    },
    computed: {
        ...mapState('comment', {
            objectId: state => state.objectId,
            fullListCount: state => state.count,
            commentList: state => state.comments,
            currentPage: state => state.currentPage,
        }),
        smallSize() {
            return SIZE.SMALL;
        },
        horizontalOrientation() {
            return LAYOUT_ORIENTATION.HORIZONTAL;
        },
        showMoreText() {
            const {
                length: listLength,
            } = this.commentList;

            return `LOAD MORE COMMENTS (${this.fullListCount - listLength})`;
        },
        isMoreButtonVisible() {
            const {
                length: listLength,
            } = this.commentList;

            return listLength
                && listLength < this.fullListCount
                && this.fullListCount > DATA_LIMIT;
        },
        isAllowedToUpdate() {
            return this.$hasAccess([
                PRIVILEGES.PRODUCT.update,
            ]);
        },
    },
    methods: {
        ...mapActions('comment', [
            'getMoreComments',
        ]),
        closeForm() {
            this.showForm = false;
        },
        openForm() {
            this.showForm = true;
        },
        async showMore() {
            this.isFetchingData = true;

            const params = {
                limit: DATA_LIMIT,
                offset: this.currentPage * DATA_LIMIT,
                filter: `owner_id=${this.objectId}`,
                field: 'created_at',
            };

            await this.getMoreComments({
                params,
                onError: () => {
                    if (process.client) {
                        this.$addAlert({
                            type: ALERT_TYPE.ERROR,
                            message: 'Comments hasn`t been fetched properly',
                        });
                    }
                },
            });

            this.isFetchingData = false;
        },
    },
};
</script>
