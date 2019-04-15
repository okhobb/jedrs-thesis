import { Component, Input } from '@angular/core';
import { PbItem } from './pbItem';

@Component({
  selector: 'item-detail',
  template: `
    <div>{{item | json}}</div>
  `
})
export class ItemDetailComponent {
  @Input() item: PbItem;


}
