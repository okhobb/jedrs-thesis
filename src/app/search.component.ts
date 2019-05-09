import {Component, ViewChild, ElementRef, HostListener} from '@angular/core';
import {Observable, pipe, Subscription} from 'rxjs';
import {take} from 'rxjs/operators'

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';

enum SearchMode {
  transcript = 'transcript',
  genre = 'genre',
  timeline = 'timeline'
}

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
      <button (click)="doSearch(searchModes.timeline)">Timeline</button>
      <button (click)="doSearch(searchModes.genre)">Genre cluster</button>
      <button (click)="doSearch(searchModes.transcript)">Transcript</button>

    </div>

    <div *ngIf="searchMode === searchModes.timeline">
      <table-view [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></table-view>
    </div>

    <div *ngIf="searchMode === searchModes.genre">
      <bubbles [pbItemsObs]="pbItemsObs" (clickedItem)="handleItemClick($event)"></bubbles>
    </div>

    <div *ngIf="searchMode === searchModes.transcript">
      <button *ngIf="transcriptIndex < allItems.length" (click)="gotoNextTranscript()">Next</button>
      <transcript-word-cloud [transcriptUrl]="transcriptUrl"></transcript-word-cloud>
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

  readonly searchModes = SearchMode;

  searchMode: string;
  transcriptIndex: number = 0;
  transcriptUrl: string = undefined;

  title = 'AAPB Project DRAFT';

  searchTerm: string = '';
  
  pbItemsObs: Observable<PbItem[]>; // where to put the results per this.pbItemsObs below
  currentItem: PbItem|undefined; // item detail component
  allItems: PbItem[] = [];

  private pbSub: Subscription;

  constructor(
    private readonly dataQuery: DataQuery) {} // this is where the DataQuery class is injected (it's a 'singleton' instance of the class)

  doSearch(mode: SearchMode): void {

    if (this.pbSub) {
      this.pbSub.unsubscribe();
    }

    this.searchMode = mode;
    this.transcriptIndex = 0;
    this.allItems = [];

    const searchTerm = this.searchInput.nativeElement.value; 
    const limit = this.outputLimitInput.nativeElement.valueAsNumber;
    console.log('search term is ', searchTerm);
    console.log('limit is', limit);
    const pageSize = 50;
    const batchLimit = limit / pageSize;
    this.pbItemsObs = this.dataQuery.search(searchTerm, pageSize)
      .pipe(take(batchLimit));

    this.pbSub = this.pbItemsObs.subscribe(items => {
      this.allItems = [...this.allItems, ...items];
      if (! this.transcriptUrl) {
        this.setNextTranscriptUrl();
      }
    });
  }

  private setNextTranscriptUrl(): void {
    console.log('about to find next transcript', this.transcriptIndex)
    for (let i = this.transcriptIndex; i < this.allItems.length; i++) {
      if (this.allItems[i].transcriptUrl) {
        this.currentItem = this.allItems[i];
        this.transcriptUrl = this.allItems[i].transcriptUrl;
        this.transcriptIndex = i;
        console.log('setting current tiem', this.transcriptIndex, this.currentItem, this.transcriptUrl);
        break;
      } else {
        console.log('skipping ', i);
      }
    }
  }

  gotoNextTranscript(): void {
    this.transcriptIndex++;
    this.setNextTranscriptUrl();
  }

  handleItemClick(item: PbItem): void {
    this.currentItem = item;
  }

}