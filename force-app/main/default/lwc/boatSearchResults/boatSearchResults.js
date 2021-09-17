import { LightningElement , wire , api} from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { getRecordNotifyChange } from 'lightning/uiRecordApi';
import { publish, MessageContext } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT     = 'Ship it!';
const SUCCESS_VARIANT     = 'success';
const ERROR_TITLE   = 'Error';
const ERROR_VARIANT = 'error';

export default class BoatSearchResults extends LightningElement {
    @api recordId;
    selectedBoatId;
    colums = [];
    boatTypeId = '';
    error = undefined;
    isLoading = false;
    boats;

    draftValues = [];

    @wire(MessageContext)
    messageContext;

    columns = [{
        label: 'Name',
        fieldName: 'Name',
        type: 'text',
        editable: true, 
        sortable: true
    },
    {
        label: 'Length',
        fieldName: 'Length__c',
        type: 'text',
        editable: true,
        sortable: true
    },
    {
        label: 'Price',
        fieldName: 'Price__c',
        type: 'text',
        editable: true,
        sortable: true
    },
    {
        label: 'Description',
        fieldName: 'Description__c',
        type: 'text',
        editable: true,
        sortable: true
    }
];


  //  @wire(getBoats, {boatTypeId: '$boatTypeId'}) boats;

    @wire(getBoats, {boatTypeId: '$boatTypeId'})
    wiredBoats({ error, data }) {
    if (data) {
        console.log('test');
        this.boats = data;
    } else if (error) {
      this.error = error;
      this.boats = undefined;
    }
    this.isLoading = false;
    this.notifyLoading(this.isLoading);
  } 

    // public function that updates the existing boatTypeId property
  // uses notifyLoading
  @api
  searchBoats(boatTypeId) {
    this.isLoading = true;
    this.notifyLoading(this.isLoading);
      this.boatTypeId = boatTypeId;
   }

  // this public function must refresh the boats asynchronously
  // uses notifyLoading
  @api 
  async refresh() {
      this.isLoading = true;
      this.notifyLoading(this.isLoading);
      await refreshApex(this.boats);
      this.isLoading = false;
      this.notifyLoading(this.isLoading);
   }

  // this function must update selectedBoatId and call sendMessageService
  updateSelectedTile(event) {
    console.log('event', event.detail.boatId);
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
    //console.log('publish', payload);
   }
  // Publishes the selected boat Id on the BoatMC.
  sendMessageService(boatId) { 
    const payload = { recordId: boatId };

    publish(this.messageContext, BOATMC, payload);
    // explicitly pass boatId to the parameter recordId
  }

  // The handleSave method must save the changes in the Boat Editor
  // passing the updated fields from draftValues to the 
  // Apex method updateBoatList(Object data).
  // Show a toast message with the title
  // clear lightning-datatable draft values
  async handleSave(event) {
    const updatedFields  = event.detail.draftValues;
   
    await updateBoatList({data: updatedFields })
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: SUCCESS_TITLE,
                    message: MESSAGE_SHIP_IT,
                    variant: SUCCESS_VARIANT
                })
            );
            getRecordNotifyChange([{boatTypeId: this.boatTypeId}]);
            // Display fresh data in the form
            this.draftValues = [];
            this.refresh();
        })
        .catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: ERROR_TITLE,
                    message: error.body.message,
                    variant: ERROR_VARIANT
                })
            );
        })
        .finally(() => { 
            this.draftValues = [];
        }
        );
    }
  // Check the current value of isLoading before dispatching the doneloading or loading custom event
  notifyLoading(isLoading) {
      if(isLoading){
          this.dispatchEvent(new CustomEvent('loading'));
      }else{
          this.dispatchEvent(new CustomEvent('doneloading'));
      }
   }
}