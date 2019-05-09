// configures all of the angular components that are being used

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HistogramComponent} from './histogram.component';
import {ItemDetailComponent} from './itemDetail.component';
import {TranscriptWordCloudComponent} from './transcriptWordCloud.component';
import {TranscriptComponent} from './transcript.component';
import {SearchComponent} from './search.component';
import {BubblesComponent} from './bubbles.component';
import {TableViewComponent} from './tableView.component';
import {DataQuery} from './dataQuery';


const appRoutes: Routes = [
  { path: '', component: SearchComponent },
  { path: 'transcript', component: TranscriptComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HistogramComponent,
    ItemDetailComponent,
    TranscriptWordCloudComponent,
    SearchComponent,
    TranscriptComponent,
    BubblesComponent,
    TableViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    DataQuery
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
