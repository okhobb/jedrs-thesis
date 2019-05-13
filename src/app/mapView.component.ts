import {Component, AfterViewInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges} from '@angular/core';
import {Subscription, Observable} from 'rxjs';

import {PbItem} from './pbItem';
import { LocationData } from './locationData';

const mapBoxToken = 'pk.eyJ1Ijoib2tob2JiIiwiYSI6ImNqdmw5MDhjbzEwM3U0OHBmbWRnNXUyMXoifQ.iZC84FcmxwMSl6H09FTqmg';

declare const L: any;
declare const mapboxgl: any;

@Component({
  selector: '[map-view]',
  template: `
    <div loading [isLoading]="isLoading"></div>
    <div #mapDiv style="flex: 1"></div>
  `,
  styles: [`
    :host {
      text-align: left;
      display: flex;
      flex-flow: column;
    }
  `]
})
export class MapViewComponent implements AfterViewInit, OnDestroy, OnChanges {
  
  @ViewChild('mapDiv') mapDiv: ElementRef<HTMLDivElement>;
  @Input() pbItemsObs: Observable<PbItem[]>;
  @Output() clickedItem: EventEmitter<PbItem> = new EventEmitter<PbItem>();

  isLoading: boolean = false;

  private sub: Subscription;
  pbItems: PbItem[] = [];

  private mapObj: any;

  private markers: any[] = [];

  constructor(
    private readonly elt: ElementRef,
    private readonly locationData: LocationData) {
    mapboxgl.accessToken = mapBoxToken;
  }

  ngAfterViewInit(): void {
    this.mapObj = new mapboxgl.Map({
      container: this.mapDiv.nativeElement,
      center: [-122.420679, 37.772537],
      style: 'mapbox://styles/mapbox/streets-v9',
      zoom: 13
    });
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pbItemsObs']) {
      if (! this.pbItemsObs) {
        return;
      }
      this.isLoading = true;
      if (this.sub) {
        this.sub.unsubscribe();
      }
      this.pbItems = [];
      this.sub = this.pbItemsObs.subscribe(
        items => {
          this.pbItems = [...this.pbItems, ...items];
        },
        err => console.error(err),
        () => {
          this.draw();
          this.isLoading = false;
        });
    }
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  private draw(): void {

    if (this.markers) {
      this.markers.forEach(m => m.remove());
      this.markers = [];
    }

    const markers = [];

    this.pbItems.reduce((prior, item) => {

      return prior.then(marker => {
        if (marker) {
          markers.push(marker);
        }
      }).then(() => {
        return this.getMarker(item);
      });

    }, Promise.resolve(undefined))
    .then(() => {

      if (markers.length !== 0) {
        this.markers = markers;
        const bounds = new mapboxgl.LngLatBounds(markers[0].getLngLat(), markers[0].getLngLat());
        for (let i = 0; i < markers.length; i++) {
          bounds.extend(markers[i].getLngLat());
        }
        this.mapObj.fitBounds(bounds, { padding: 20 });
      }
      this.isLoading = false;

    });
  }

  private getMarker(item: PbItem): Promise<any> {
    return this.locationData.getLocation(item).then(location => {

      if (location) {

        const el = document.createElement('div');
        el.className = 'map-marker';

        el.onclick = () => this.clickedItem.next(item);

        return new mapboxgl.Marker(el)
          .setLngLat([location.lng, location.lat])
          .addTo(this.mapObj);
      }
      return undefined;
    })
  }

}
