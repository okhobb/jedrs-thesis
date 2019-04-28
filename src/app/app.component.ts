// component is what shows up on the screen; this file controls app.component.hrml

import { Component, ViewChild, ElementRef } from '@angular/core';
import {Observable, pipe} from 'rxjs';
import {take} from 'rxjs/operators'

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';

// puts the app inside the html
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})


// 
export class AppComponent {

  @ViewChild('outputLimitInput') outputLimitInput: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  title = 'AAPB Project DRAFT';

  searchTerm: string = '';
  
  pbItemsObs: Observable<PbItem[]>; // where to put the results per this.pbItemsObs below
  currentItem: PbItem|undefined; // item detail component

  constructor(private readonly dataQuery: DataQuery) {} // this is where the DataQuery class is injected (it's a 'singleton' instance of the class)

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
