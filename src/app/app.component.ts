import { Component, ViewChild, ElementRef } from '@angular/core';
import {Observable, pipe} from 'rxjs';
import {take} from 'rxjs/operators'

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('outputLimitInput') outputLimitInput: ElementRef<HTMLInputElement>;
  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  title = 'jeds-final-thesis-project-by-hobbito';

  searchTerm: string = '';
  
  pbItemsObs: Observable<PbItem[]>;
  currentItem: PbItem|undefined;

  constructor(private readonly dataQuery: DataQuery) {}

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
