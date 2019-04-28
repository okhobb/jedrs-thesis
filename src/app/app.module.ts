// configures all of the angular components that are being used

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HistogramComponent} from './histogram.component';
import {ItemDetailComponent} from './itemDetail.component';

import {DataQuery} from './dataQuery';

@NgModule({
  declarations: [
    AppComponent,
    HistogramComponent,
    ItemDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    DataQuery
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
