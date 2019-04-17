import { Injectable } from '@angular/core';

import {Observable, defer, pipe, of, empty} from 'rxjs';
import {map, concat, mergeMap} from 'rxjs/operators';
import {ajax} from 'rxjs/ajax';

import * as parser from 'fast-xml-parser';
import * as querystring from 'querystring';
import * as moment from 'moment';

import {PbItem} from './pbItem';

interface RawPbItem {
  id: string,
  title: string,
  xml2json: {
    pbcoreDescriptionDocument: {
      pbcoreInstantiation: {
        instantiationDate: string|undefined
      }
    }
  }
}

@Injectable()
export class DataQuery {

  private readonly baseUrl = 'http://americanarchive.org/api.json';
  private readonly queryParams = {
    q: 'climate',
    fl: 'id,title,xml',
    rows: 100,
    start: 0
  };

  search(searchTerm: string, pageSize: number = 100): Observable<PbItem[]> {
    
    const getItems: ((start?: number) => Observable<PbItem[]>) = (start: number = undefined) => {
      return defer(() => this.getBatch(searchTerm, pageSize, start)).pipe(
        mergeMap(({items, nextStart}, idx) => {
          const filteredItems = items
            .filter(this.rawItemHasDate)
            .map(this.entryToPbItem);
          console.log('start', start, 'nextStart', nextStart, 'raw count', items.length, 'filter count', filteredItems.length);
          const items$ = of(filteredItems);
          const next$ = nextStart >= 0 ? getItems(nextStart) : empty();
          return items$.pipe(concat(next$));
        })
      );
    };

    return getItems();
  }

  private getBatch(searchTerm: string, pageSize: number, start: number = 0): Observable<{items: RawPbItem[], nextStart: number}> {
    const queryParams = {
      ...this.queryParams,
      q: searchTerm,
      start: start,
      rows: pageSize
    };
    console.log('query params', queryParams);
    let url = this.baseUrl + '?' + querystring.stringify(queryParams);
    return ajax.getJSON(url).pipe(
      map((json: any) => {
        console.log('json len', json.response.docs.length, pageSize)
        return {       
          items: this.rawDataToRawPbItem(json.response.docs),
          nextStart: json.response.docs.length === pageSize ? (start + pageSize) : -1
        }
      })
    );
  }

  private rawDataToRawPbItem(docs: any[]): RawPbItem[] {
    const docsWithParsedXml: RawPbItem[] = docs.map((doc: any) => {
      return {
        ...doc,
        xml2json: parser.parse(doc.xml)
      }
    });
    return docsWithParsedXml;
  }

  private rawItemHasDate(raw: RawPbItem): boolean {
    return raw.xml2json
      && raw.xml2json.pbcoreDescriptionDocument
      && raw.xml2json.pbcoreDescriptionDocument.pbcoreInstantiation
      && raw.xml2json.pbcoreDescriptionDocument.pbcoreInstantiation.instantiationDate !== undefined;
  }

  private entryToPbItem(raw: RawPbItem): PbItem {

    const dateStr = raw.xml2json.pbcoreDescriptionDocument.pbcoreInstantiation.instantiationDate;

    const date = moment(dateStr, 'YYYY-MM-DD').toDate();

    return {
      id: raw.id,
      title: raw.title,
      date: date
    }
  }
}
