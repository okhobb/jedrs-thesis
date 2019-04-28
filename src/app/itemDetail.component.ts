// what is shown when a circle result is clicked; will be info panel

import { Component, Input } from '@angular/core';
import { PbItem } from './pbItem';

@Component({
  selector: 'item-detail',
  template: `
    <div class="item-detail-box">
      <div>{{item | json}}</div>
      <div>
        <a [href]="getUrlFromId(item)" target="_blank">Go to catalog entry....</a>
      </div>
      <div *ngIf="item.transcriptUrl">
        <a [href]="item.transcriptUrl" target="_blank">{{item.transcriptUrl}}</a>
      </div>
    </div>
  `,
  styles: [
    `
      .item-detail-box {
        height: 100px;
        overflow: scroll;
      }
    `
  ]
})
export class ItemDetailComponent {
  @Input() item: PbItem;

  getUrlFromId(item: PbItem): string {
    return `http://americanarchive.org/catalog/${item.id}`;
  }

}
