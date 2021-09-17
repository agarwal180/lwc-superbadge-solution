import { LightningElement, api, track } from 'lwc';

export default class ChildComp extends LightningElement {
    @api loadMyString;
    @api loadMyObject;
    /*@track theString;
    @track theObject;

    set loadMyString(value) {
        console.log('String value is ' + value);
        this.theString = value;
    }
    @api get loadMyString() {
        return this.theString;
    }
    set loadMyObject(value) {
        console.log('Object value is ' + value, value.arr);
        this.theObject = value;
    }
    @api get loadMyObject() {
        return this.theObject;
    }*/

    clickme(){
        this.loadMyString = 'test';
        this.loadMyObject = {
            ...this.loadMyObject,
            arr : [5,6,7]
        }
    }
}