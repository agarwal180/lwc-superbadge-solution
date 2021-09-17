import { LightningElement,track, api } from 'lwc';

export default class Parent extends LightningElement {
    @api myString = '';
    @api myobject = {
        arr: undefined,
        bool: true
    };

    connectedCallback() {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.myString = 'Hello, this is a string';
            this.myobject = { ...this.myobject, arr:[1,2,3]
            };
        }, 500);
    }
}