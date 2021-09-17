import { LightningElement, wire,track, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import {
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
// import BOATMC from the message channel

// Declare the const LONGITUDE_FIELD for the boat's Longitude__s
// Declare the const LATITUDE_FIELD for the boat's Latitude
// Declare the const BOAT_FIELDS as a list of [LONGITUDE_FIELD, LATITUDE_FIELD];
const LONGITUDE_FIELD = 'Boat__c.Geolocation__Longitude__s';
const LATITUDE_FIELD = 'Boat__c.Geolocation__Latitude__s';
const BOAT_FIELDS = [LONGITUDE_FIELD, LATITUDE_FIELD];

export default class BoatMap extends LightningElement {
  // private
  subscription = null;
  @track boatId;

  // Getter and Setter to allow for logic to run on recordId change
  // this getter must be public
  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.setAttribute('boatId', value);
    this.boatId = value;
    console.log('boat Id', this.boatId);
  }

  error = undefined;
  mapMarkers = [];

    // Initialize messageContext for Message Service
  @wire(MessageContext)
    messageContext;


  // Getting record's location to construct map markers using recordId
  // Wire the getRecord method using ('$boatId')
  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  wiredRecord({ error, data }) {
    // Error handling
    if (data) {
      this.error = undefined;
      const longitude = data.fields.Geolocation__Longitude__s.value;
      const latitude = data.fields.Geolocation__Latitude__s.value;
      this.updateMap(longitude, latitude);
      console.log('longitude', longitude);
      console.log('latitude', latitude);
    } else if (error) {
      console.log('error', error);
      this.error = error;
      this.boatId = undefined;
      this.mapMarkers = [];
    }
  }

  // Subscribes to the message channel
  subscribeMC() {
    // recordId is populated on Record Pages, and this component
    // should not update when this component is on a record page.
    console.log('subscription', this.subscription);
    console.log('record Id', this.recordId);
    if (this.subscription || this.recordId) {
      console.log('return');
      return;
    }else{
      console.log('else');
      this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) => this.boatId = message.recordId,
        { scope: APPLICATION_SCOPE }
    );
    console.log('sub', JSON.stringify(this.subscription));
    }
    // Subscribe to the message channel to retrieve the recordId and explicitly assign it to boatId.
  }

    unsubscribeToMessageChannel() {
      unsubscribe(this.subscription);
      this.subscription = null;
    }

  // Calls subscribeMC()
  connectedCallback() {
    console.log('subscribe', this.boatId);
    this.subscribeMC();
  }

  disconnectedCallback() {
    this.unsubscribeToMessageChannel();
}
  // Creates the map markers array with the current boat's location for the map.
  updateMap(Longitude, Latitude) {
    this.mapMarkers = [{
      location :{
        Latitude: Latitude,
        Longitude: Longitude
      }
    }];
  }

  // Getter method for displaying the map component, or a helper method.
  get showMap() {
    return this.mapMarkers.length > 0;
  }
}