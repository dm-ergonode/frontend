/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <ModalForm
        title="Add binding attributes"
        @close="onClose">
        <template #body>
            <ProductAttributesBindingForm
                submit-title="ADD ATTRIBUTES"
                proceed-title="CANCEL"
                :is-submitting="isSubmitting"
                :errors="scopeErrors"
                :bindings="localBindings"
                @input="onFormValueChange"
                @submit="onSubmit"
                @proceed="onCancel" />
        </template>
    </ModalForm>
</template>

<script>
import ModalForm from '@Core/components/Modal/ModalForm';
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    THEME,
} from '@Core/defaults/theme';
import scopeErrorsMixin from '@Core/mixins/feedback/scopeErrorsMixin';
import ProductAttributesBindingForm
    from '@Products/extends/components/Forms/ProductAttributesBindingForm';
import {
    mapActions,
    mapState,
} from 'vuex';

export default {
    name: 'AddBindingAttributesModalForm',
    components: {
        ModalForm,
        ProductAttributesBindingForm,
    },
    mixins: [
        scopeErrorsMixin,
    ],
    data() {
        return {
            localBindings: [],
            isSubmitting: false,
        };
    },
    computed: {
        ...mapState('authentication', {
            language: state => state.user.language,
        }),
        ...mapState('product', [
            'id',
            'bindings',
        ]),
        description() {
            return 'Binding attribute is the common attribute of the products, which link products together into the product with variants.';
        },
        secondaryTheme() {
            return THEME.SECONDARY;
        },
    },
    created() {
        this.localBindings = [
            ...this.bindings,
        ];
    },
    methods: {
        ...mapActions('product', [
            'addProductBindings',
        ]),
        onFormValueChange(value) {
            this.localBindings = value;
        },
        onClose() {
            this.removeScopeErrors(this.scope);

            this.$emit('close');
        },
        onCancel() {
            this.$emit('close');
        },
        onSubmit() {
            if (this.isSubmitting) {
                return;
            }
            this.isSubmitting = true;

            this.removeScopeErrors(this.scope);
            this.addProductBindings({
                scope: this.scope,
                bindings: this.localBindings,
                onSuccess: this.onCreateSuccess,
                onError: this.onCreateError,
            });
        },
        onCreateSuccess() {
            this.$addAlert({
                type: ALERT_TYPE.SUCCESS,
                message: 'Attribute bindings added',
            });

            this.isSubmitting = false;

            this.$emit('created');
            this.onClose();
        },
        onCreateError(errors) {
            this.onError(errors);

            this.isSubmitting = false;
        },
    },
};
</script>
