import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
// imports
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  @track mapMarkers = [];
  isLoading = true;
  isRendered = false;;
  latitude;
  longitude;
  // Add the wired method from the Apex Class
  // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
  // Handle the result and calls createMapMarkers
  @wire(getBoatsByLocation,{latitude :'$latitude' ,longitude: '$longitude' ,boatTypeId:'$boatTypeId'})
  wiredBoatsJSON({error, data}) {
      if(data){
        console.log('data',data);
        this.createMapMarkers(data);
      }else if(error){
        const evt = new ShowToastEvent({
            title: ERROR_TITLE,
            message: error.body.message,
            variant: ERROR_VARIANT,
        });
        this.dispatchEvent(evt);
        this.error = error;
        this.isLoading = false;
        console.log('error', error);
      }
   }
  
  // Controls the isRendered property
  // Calls getLocationFromBrowser()
  renderedCallback() { 
      console.log('rendered', this.isRendered);
      if(this.isRendered == false){
          this.getLocationFromBrowser();
      }
      this.isRendered = true;
  }
  
  // Gets the location from the Browser
  // position => {latitude and longitude}
  getLocationFromBrowser() {
        navigator.geolocation.getCurrentPosition(
            (position)=>{
                this.latitude = position.coords.latitude;
                this.longitude = position.coords.longitude;
            },
            (e) =>{

            },{
                enableHighAccuracy :true
            }
        );
        console.log('this', this.latitude);
        console.log('long', this.longitude);
   }

  
  // Creates the map markers
  createMapMarkers(boatData) {
      console.log('boatdata', boatData);
      const newMarkers = JSON.parse(boatData).map(boat=>{
           return {
               location :{
                Latitude: boat.Geolocation__Latitude__s,
                Longitude: boat.Geolocation__Longitude__s
               },
               title : boat.Name
           }   
      });
      newMarkers.unshift({
          location :{
              Latitude : this.latitude,
              Longitude : this.longitude
          },
          title : LABEL_YOU_ARE_HERE,
          icon : ICON_STANDARD_USER
      });
      this.mapMarkers = newMarkers;
      this.isLoading = false;
     // const newMarkers = boatData.map(boat => {...});
     // newMarkers.unshift({...});
   }

   get showMap() {
    return this.mapMarkers.length > 0;
  }
}