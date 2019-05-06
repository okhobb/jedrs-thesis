import {Component, ViewChild, ElementRef, HostListener} from '@angular/core';
import {Observable, pipe} from 'rxjs';
import {take} from 'rxjs/operators'

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';


@Component({
  template: `
  <div>
    <div style="text-align:center">
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

    <div id="tooltip" *ngIf="currentItem"
      [style.left.px]="tooltipPosition.x"
      [style.bottom.px]="tooltipPosition.y"
    >
      <item-detail [item]="currentItem"></item-detail>
    </div>

    <div>
      <histogram [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></histogram>
    </div>

    <div>
      <bubbles [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></bubbles>
    </div>

  </div>
  
  `,
  styles: [`
    #tooltip {
      position: absolute;
      width: 500px;
      background-color: #fafafa;
      border: 1px solid gray;
      border-radius: 4px;
      padding: 5px 5px 5px 5px;
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

  tooltipPosition: { x: number, y: number } = { x: 0, y: 0 };
  private mousePosition: { x: number, y: number } = { x: 0, y: 0 };

  constructor(
    private readonly element: ElementRef,
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
    // console.log('document.scrollingElement.scrollHeight',document.scrollingElement.scrollHeight)
    // console.log('this.mousePosition.y', this.mousePosition.y)
    // console.log('document.scrollingElement.scrollTop', document.scrollingElement.scrollTop)
    // console.log('document.scrollingElement.clientHeight', document.scrollingElement.clientHeight)
    // console.log('document.scrollingElement.clientTop', document.scrollingElement.clientTop)
    this.tooltipPosition = {
      x: this.mousePosition.x + document.scrollingElement.scrollLeft,
      y: document.scrollingElement.clientHeight - (this.mousePosition.y + document.scrollingElement.scrollTop)
    }
  }

  @HostListener('document:mousemove', ['$event'])
  handleMouseMove(e: MouseEvent): void {
    this.mousePosition = {
      x: e.clientX,
      y: e.clientY
    }
  }

  // xx test.
}