// imports
import { LightningElement, api } from 'lwc';
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
export default class BoatTile extends LightningElement {
    @api boat;
    @api selectedBoatId;
    
    // Getter for dynamically setting the background image for the picture
    @api
    get backgroundStyle() {
        return 'background-image: url(' + this.boat.Picture__c + ')';
     }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    @api
    get tileClass() { 
        if(this.selectedBoatId)
            return TILE_WRAPPER_UNSELECTED_CLASS;
        else
           return TILE_WRAPPER_SELECTED_CLASS;
    }
    // Fires event with the Id of the boat that has been selected.
    selectBoat() { 
        const selectedEvent = new CustomEvent('boatselect', { 
            detail: {
                boatId: this.boat.Id,
            } 
            });
        // Dispatches the event.
        this.dispatchEvent(selectedEvent);
    }
  }