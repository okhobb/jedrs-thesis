import { Injectable } from '@angular/core';


const parser = require('fast-xml-parser');

const querystring = require('querystring');




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


  search(searchTerm: string): Promise<any> {
    const queryParams = {
      ...this.queryParams,
      q: searchTerm
    };
    let url = this.baseUrl + '?' + querystring.stringify(queryParams);
    return fetch(url)
      .then(res => res.json())
      .then(json => {
        const docs = json.response.docs;
        const docsWithParsedXml = docs.map((doc: any) => {
          return {
            ...doc,
            xml2json: parser.parse(doc.xml)
          }
        });
        return docsWithParsedXml;
      });
  }
}
