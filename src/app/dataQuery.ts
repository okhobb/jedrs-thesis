import { Injectable } from '@angular/core';


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

  readonly baseUrl = 'http://americanarchive.org/api.json';
  readonly pageSize = 100;
  readonly queryParams = {
    q: 'climate',
    fl: 'id,title,xml',
    rows: this.pageSize,
    start: 0
  };


  search(searchTerm: string): Promise<PbItem[]> {
    const queryParams = {
      ...this.queryParams,
      q: searchTerm
    };
    let url = this.baseUrl + '?' + querystring.stringify(queryParams);
    return fetch(url)
      .then(res => res.json())
      .then(json => {
        const docs: any[] = json.response.docs;
        const docsWithParsedXml: RawPbItem[] = docs.map((doc: any) => {
          return {
            ...doc,
            xml2json: parser.parse(doc.xml)
          }
        });
        return docsWithParsedXml
          .filter(this.rawItemHasDate)
          .map(this.entryToPbItem);
      });
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
