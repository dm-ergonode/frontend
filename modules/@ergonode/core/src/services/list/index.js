/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */

export default {
    getGroups({
        $axios,
        path,
        languageCode,
    }) {
        const params = {
            limit: 9999,
            offset: 0,
            view: 'list',
            order: 'ASC',
            columns: 'id,code,name,elements_count',
        };

        return $axios.$get(path, {
            params,
            withLanguage: false,
        }).then(({
            collection,
        }) => {
            const groups = [];
            const items = {};
            const groupItemsCount = {};
            const {
                length,
            } = collection;

            for (let i = 0; i < length; i += 1) {
                const {
                    id, code, name,
                } = collection[i];
                if (collection[i].elements_count > 0) {
                    const value = name || `#${code}`;
                    const hint = name ? `#${code} ${languageCode}` : '';

                    groups.push({
                        id,
                        key: code,
                        value,
                        hint,
                    });

                    groupItemsCount[id] = collection[i].elements_count;
                    items[id] = [];
                }
            }

            return {
                groups,
                items,
                groupItemsCount,
            };
        });
    },
    getItems({
        $axios,
        path,
        params,
    }) {
        return $axios.$get(path, {
            params,
            withLanguage: false,
        });
    },
};
