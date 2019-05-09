import {Component, ViewChild, ElementRef, HostListener} from '@angular/core';
import {Observable, pipe} from 'rxjs';
import {take} from 'rxjs/operators'

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';


@Component({
  template: `
  <div id="main-container">
    <div id="right-container" style="text-align:center">
      <h1>
        Explore the American Archive Reading Room ... 
      </h1>
      <div style="display: flex; flex-direction: row">
        <img style="margin: 0 auto;" src="/assets/aapb-q-50.jpg">
      </div>
    <div>
      <input
        #searchInput
        type="text" placeholder="Search the archive's reading room ...">
      <label>
        Limit: <input #outputLimitInput type="number" value="1000">
      </label>
      <button (click)="doSearch()">Search</button>
    </div>

    <div>
      <table-view [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></table-view>
    </div>
    <div>
      <histogram [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></histogram>
    </div>

    <div>
      <bubbles [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></bubbles>
    </div>
  </div>
  <div id="tooltip">
    <item-detail [item]="currentItem"></item-detail>
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
    }

    #tooltip {
      width: 300px;
      background-color: #fafafa;
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


  title = 'AAPB Project DRAFT';

  searchTerm: string = '';
  
  pbItemsObs: Observable<PbItem[]>; // where to put the results per this.pbItemsObs below
  currentItem: PbItem|undefined; // item detail component

  constructor(
    private readonly dataQuery: DataQuery) {} // this is where the DataQuery class is injected (it's a 'singleton' instance of the class)

  doSearch(): void {
    const searchTerm = this.searchInput.nativeElement.value; 
    const limit = this.outputLimitInput.nativeElement.valueAsNumber;
    console.log('search term is ', searchTerm);
    console.log('limit is', limit);
    const pageSize = 50;
    const batchLimit = limit / pageSize;
    this.pbItemsObs = this.dataQuery.search(searchTerm, pageSize)
      .pipe(take(batchLimit));
  }

  handleItemClick(item: PbItem): void {
    this.currentItem = item;
  }

}