// what is shown when a circle result is clicked; will be info panel

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { PbItem } from './pbItem';

@Component({
  selector: 'item-detail',
  template: `
    <div class="item-detail-box">
      <div class="title">{{item.title}}</div>
      <div class="date">{{item.date | date}}</div>
      <div *ngFor="let descriptionRow of item.description"
        class="description"
      >
        {{descriptionRow}}
      </div>
      <div class="catalogLink">
        <a [href]="getUrlFromId(item)" target="_blank">Go to catalog entry....</a>
      </div>
      <div *ngIf="item.transcriptUrl">
        <a class="wordCloudLlink" target="_blank "[routerLink]="['transcript']" [queryParams]="{id: item.id, transcriptUrl: item.transcriptUrl}" queryParamsHandling="merge">
          Transcript Word Cloud
        </a>
      </div>
    </div>
  `,
  styles: [
    `
    .title {
      font-size: 14px;
      font-weight: bold;
    }

    .date {
      font-size: 8px;
    }

    .description {
      font-size: 12px;
      text-align: left;
    }

    .catalogLink {
      font-size: 10px;
    }

    .wordCloudLlink {
      font-size: 10px;
    }

    `
  ]
})
export class ItemDetailComponent implements OnChanges {

  @Input() item: PbItem;

  getUrlFromId(item: PbItem): string {
    return `http://americanarchive.org/catalog/${item.id}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('item is now', this.item);
  }
}
