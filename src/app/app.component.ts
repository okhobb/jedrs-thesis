import { Component, ViewChild, ElementRef } from '@angular/core';

import {DataQuery} from './dataQuery';
import { PbItem } from './pbItem';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;

  title = 'jeds-final-thesis-project-by-hobbito';

  searchTerm: string = '';
  
  pbItems: PbItem[] = []
  currentItem: PbItem|undefined;

  constructor(private readonly dataQuery: DataQuery) {

  }

  doSearch(): void {
    const searchTerm = this.searchInput.nativeElement.value;
    console.log('search term is ', searchTerm);

    this.dataQuery.search(searchTerm)
      .then(results => {
        this.pbItems = results;
        console.log(results);
      });
  }

  handleItemClick(item: PbItem): void {
    this.currentItem = item;
  }

}
