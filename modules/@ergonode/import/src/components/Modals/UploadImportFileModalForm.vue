/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <ModalForm
        title="Upload import file"
        @close="onClose">
        <template #body>
            <Form>
                <template #body>
                    <FormSection>
                        <FormParagraph :text="paragraphText" />
                        <UploadFile
                            :value="Boolean(csvFile)"
                            accept-files="csv/*"
                            label="Upload file"
                            :scope="scope"
                            :error-messages="scopeErrors.upload"
                            required
                            @remove="onRemoveFile"
                            @upload="onFileUpload">
                            <template #file>
                                <IconFile :fill-color="greenColor" />
                                <LinkButton :title="csvFile.name" />
                            </template>
                        </UploadFile>
                    </FormSection>
                </template>
                <template #submit>
                    <Button
                        title="IMPORT NOW"
                        :disabled="isSubmitting"
                        @click.native="onSubmit">
                        <template
                            v-if="isSubmitting"
                            #prepend="{ color }">
                            <IconSpinner :fill-color="color" />
                        </template>
                    </Button>
                </template>
            </Form>
        </template>
    </ModalForm>
</template>

<script>
import {
    GREEN,
} from '@Core/assets/scss/_js-variables/colors.scss';
import Button from '@Core/components/Button/Button';
import Form from '@Core/components/Form/Form';
import FormParagraph from '@Core/components/Form/FormParagraph';
import FormSection from '@Core/components/Form/Section/FormSection';
import IconSpinner from '@Core/components/Icons/Feedback/IconSpinner';
import IconFile from '@Core/components/Icons/Others/IconFile';
import LinkButton from '@Core/components/LinkButton/LinkButton';
import ModalForm from '@Core/components/Modal/ModalForm';
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    THEME,
} from '@Core/defaults/theme';
import scopeErrorsMixin from '@Core/mixins/feedback/scopeErrorsMixin';
import UploadFile from '@Media/components/Inputs/UploadFile/UploadFile';
import {
    mapActions,
} from 'vuex';

export default {
    name: 'UploadImportFileModalForm',
    components: {
        IconSpinner,
        UploadFile,
        LinkButton,
        IconFile,
        Form,
        FormSection,
        FormParagraph,
        ModalForm,
        Button,
    },
    mixins: [
        scopeErrorsMixin,
    ],
    data() {
        return {
            isSubmitting: false,
            csvFile: null,
        };
    },
    computed: {
        greenColor() {
            return GREEN;
        },
        secondaryTheme() {
            return THEME.SECONDARY;
        },
        paragraphText() {
            return 'It may take some time to upload, please be patient. Maybe this is a great time for coffee?';
        },
    },
    methods: {
        ...mapActions('import', [
            'uploadImportFile',
        ]),
        onRemoveFile() {
            this.csvFile = null;
        },
        onFileUpload(file) {
            this.csvFile = file;
        },
        onClose() {
            this.removeScopeErrors(this.scope);

            this.$emit('close');
        },
        onSubmit() {
            if (this.isSubmitting) {
                return;
            }
            this.isSubmitting = true;

            this.uploadImportFile({
                scope: this.scope,
                file: this.csvFile,
                onSuccess: this.onCreateSuccess,
                onError: this.onCreateError,
            });
        },
        onCreateSuccess() {
            this.$addAlert({
                type: ALERT_TYPE.SUCCESS,
                message: 'File uploaded',
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
