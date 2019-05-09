import {Component, Input, SimpleChanges, OnChanges, OnDestroy, Output, EventEmitter} from '@angular/core';
import {Subscription, Observable} from 'rxjs';

import { PbItem } from './pbItem';

interface YearPbItem {
    year: number;
    items: PbItem[];
}

@Component({
    selector: 'table-view',
    template: `
        <div>   
            <table style="width: 100%; text-align: left;">
                <tbody>
                    <tr *ngFor="let year of yearPbItems" class="item-row">
                        <td>{{year.year}}</td>
                        <td>
                            <span 
                                *ngFor="let item of year.items"
                                class="item"
                                (mousemove)="clickedItem.next(item)"
                            >&nbsp;</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `,
    styles: [
        `   tr.item-row td {
                border-top: 1px solid gray;
            }
            .item {
                display: inline-block;
                height: 6px;
                width: 6px;
                border-radius: 3px;
                background-color: black;
                vertical-align: middle;
            }
        `
    ]
})
export class TableViewComponent implements OnChanges, OnDestroy {

    @Input() pbItemsObs: Observable<PbItem[]>;
    @Output() clickedItem: EventEmitter<PbItem> = new EventEmitter<PbItem>();

    private pbItemsSub: Subscription;
    pbItems: PbItem[] = [];

    yearPbItems: YearPbItem[] = [];

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['pbItemsObs']) {
          if (this.pbItemsSub) {
            this.pbItemsSub.unsubscribe();
            this.pbItems = [];
          }
          const newItemsObs: Observable<PbItem[]> = changes['pbItemsObs'].currentValue;
          if (newItemsObs) {
            this.pbItemsSub = newItemsObs.subscribe(items => {
              this.pbItems = [...this.pbItems, ...items];
              this.updateData();
            });
          }
        }
      }

    ngOnDestroy(): void {
        if (this.pbItemsSub) {
            this.pbItemsSub.unsubscribe();
        }
    }

    private updateData(): void {
        this.yearPbItems = [];
        const yearMap = new Map<number, PbItem[]>();
        const years = [];
        this.pbItems.forEach(item => {
            const year = item.date.getUTCFullYear();
            if (! yearMap.has(year)) {
                yearMap.set(year, []);
                years.push(year);
            }
            yearMap.get(year).push(item);
        });
        years.sort();
        years.forEach(year => {
            this.yearPbItems.push({
                year: year,
                items: yearMap.get(year).sort((a, b) => a.date.getTime() - b.date.getTime()) 
            });
        });
    }

}