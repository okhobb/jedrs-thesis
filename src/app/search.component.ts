import {Component, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {Observable, pipe, Subscription} from 'rxjs';
import {take} from 'rxjs/operators'

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';

enum SearchMode {
  transcript = 'transcript',
  genre = 'genre',
  timeline = 'timeline',
  map = 'map'
}

@Component({
  template: `
  <div id="main-container">
    <div id="right-container">
    <img style="margin: 0 auto; max-width: 100%;" src="assets/aapblogo.jpg">

      <div style="display: block; row; width: 100%;">
      <p>  
      <h3>
        Explore the Online Reading Room ... 
      </h3>
      </div>

      <div>
        <input
          #searchInput
          type="text" placeholder="Search ...">
        <label>
          Limit: <input #outputLimitInput type="number" value="1000">
        </label>
        <button (click)="doSearch(searchModes.timeline)">Timeline</button>
        <button (click)="doSearch(searchModes.genre)">Genre cluster</button>
        <button (click)="doSearch(searchModes.transcript)">Transcript</button>
        <button (click)="doSearch(searchModes.map)">Map</button>

      </div>

      <div *ngIf="searchMode === searchModes.timeline">
        <table-view [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></table-view>
      </div>

      <div *ngIf="searchMode === searchModes.genre">
        <bubbles [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></bubbles>
      </div>

      <div *ngIf="searchMode === searchModes.transcript">
        <transcript-list [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></transcript-list>
      </div>

      <div map-view *ngIf="searchMode === searchModes.map" 
        style="flex: 1;"
        [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></div>

    </div>
    
    <div id="tooltip">
      <item-detail [item]="currentItem"></item-detail>
    </div>

  </div>
  
  `,
  styles: [`
    #main-container {
      display: flex;
      flex-flow: row;
      height: 100%;
    }

    #right-container {
      flex: 1;
      overflow: scroll;
      height: 100%;
      text-align: center;
      display: flex;
      flex-flow: column;
    }

    #tooltip {
      width: 300px;
      background-color: #FFFDD0;
      border: 1px solid gray;
      border-radius: 4px;
      padding: 5px 5px 5px 5px;
      height: 100%;
      overflow-y: scroll;
    }
  `]
})
export class SearchComponent {
  
  @ViewChild('outputLimitInput') outputLimitInput: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  readonly searchModes = SearchMode;

  searchMode: string;

  title = 'AAPB Project DRAFT';

  searchTerm: string = '';
  
  pbItemsObs: Observable<PbItem[]>; // where to put the results per this.pbItemsObs below
  currentItem: PbItem|undefined; // item detail component

  private pbSub: Subscription;

  constructor(
    private readonly dataQuery: DataQuery) {} // this is where the DataQuery class is injected (it's a 'singleton' instance of the class)

  doSearch(mode: SearchMode): void {

    if (this.pbSub) {
      this.pbSub.unsubscribe();
    }

    this.searchMode = mode;

    const searchTerm = this.searchInput.nativeElement.value; 
    const limit = this.outputLimitInput.nativeElement.valueAsNumber;
    const pageSize = 50;
    const batchLimit = limit / pageSize;
    this.pbItemsObs = this.dataQuery.search(searchTerm, pageSize)
      .pipe(take(batchLimit));

  }

  handleItemClick(item: PbItem): void {
    this.currentItem = item;
  }

}