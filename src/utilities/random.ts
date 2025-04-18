
export const isClient = typeof window !== 'undefined';


class Random {

    // NOTICE: the code in this file originally developed by Microsoft
    // original source: https://github.com/AzureAD/azure-activedirectory-library-for-js/blob/master/lib/adal.js#L1029
    //----------------------------------------------------------------------
    // AdalJS v1.0.8
    // @preserve Copyright (c) Microsoft Open Technologies, Inc.
    // All Rights Reserved
    // Apache License 2.0
    //
    // Licensed under the Apache License, Version 2.0 (the "License");
    // you may not use this file except in compliance with the License.
    // You may obtain a copy of the License at
    //
    // http://www.apache.org/licenses/LICENSE-2.0
    //
    // Unless required by applicable law or agreed to in writing, software
    // distributed under the License is distributed on an "AS IS" BASIS,
    // WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    // See the License for the specific language governing permissions and
    // limitations under the License.
    //----------------------------------------------------------------------
    static randomAuthStateId() {
        const guidHolder = 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx';
        const hex = '0123456789abcdef';
        let r = 0;
        let guidResponse = "";
        for (let i = 0; i < guidHolder.length; i++) {
            if (guidHolder[i] !== '-' && guidHolder[i] !== '4') {
                // each x and y needs to be random
                r = Math.random() * 16 | 0;
            }

            if (guidHolder[i] === 'x') {
                guidResponse += hex[r];
            } else if (guidHolder[i] === 'y') {
                // clock-seq-and-reserved first hex is filtered and remaining hex values are random
                r &= 0x3; // bit and with 0011 to set pos 2 to zero ?0??
                r |= 0x8; // set pos 3 to 1 as 1???
                guidResponse += hex[r];
            } else {
                guidResponse += guidHolder[i];
            }
        }
        return guidResponse;
    }

    static randomComponentId() {
        return 'c-' + Math.random().toString(36).substr(2, 9);
    }

    static randomOrderRequestId() {
        // return username + Date.now() + Math.random().toString().substr(2, 5);
        return Date.now() + Random.randomIdChars(6);
    }

    static randomRequestIdToServer() {
        return Math.random().toString(36).substr(2, 12);
    }

    static randomLogoutId() {
        let logoutIDLength = 18; // Độ dài ID
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (var i = 0; i < logoutIDLength; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        result += Date.now(); // Thêm 13 ký tự timestamp
        return result;
    }

    static getRandomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomIdChars(len: number) {
        var buf = []
            , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
            , charlen = chars.length;

        for (var i = 0; i < len; ++i) {
            buf.push(chars[Random.getRandomInt(0, charlen - 1)]);
        }

        return buf.join('');
    };
}

export default Random;
