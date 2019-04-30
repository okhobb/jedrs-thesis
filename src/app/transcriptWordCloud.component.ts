// what is shown when a circle result is clicked; will be info panel

import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';

import {Observable, defer, pipe, of, empty, Subscription} from 'rxjs'; // rxjs is allowing for the repeated data query in getItems
import {map, concat, mergeMap} from 'rxjs/operators'; 
import {ajax} from 'rxjs/ajax';
import * as d3 from 'd3';


import * as d3Cloud from 'd3-cloud';


import { PbItem } from './pbItem';

interface TranscriptPart {
  end_time: string,
  id: number,
  speaker_id: number,
  start_time: string,
  text: string
}

interface TranscriptSpeaker {
  // TODO.
}

interface Transcript {
  id: number
  language: string,
  parts: TranscriptPart[],
  speakers: TranscriptSpeaker[]
}


@Component({
  selector: 'transcript-word-cloud',
  template: `
    <div>
      <svg #wordCloudSvg [attr.width]="layoutSize[0]" [attr.height]="layoutSize[1]"></svg>
    </div>
  `,
  styles: [
    `

    `
  ]
})
export class TranscriptWordCloudComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('wordCloudSvg') wordCloudSvg: ElementRef<SVGElement>;
  @Input() item: PbItem;

  private transcriptSub: Subscription;
  private d3SvgElt: any;

  readonly layoutSize = [1000, 1000];
  layout: any;

  ngAfterViewInit(): void {
    this.d3SvgElt = d3.select(this.wordCloudSvg.nativeElement)
      .append("g")
      .attr("transform", "translate(" + this.layoutSize[0] / 2 + "," + this.layoutSize[1] / 2 + ")")
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('the world cloud change', changes);

    if (this.transcriptSub) {
      this.transcriptSub.unsubscribe();
    }
    
    if (! this.item.transcriptUrl) {
      return;
    }

    this.transcriptSub = ajax(this.item.transcriptUrl).subscribe(x => {
      console.log('got transcript', x);
      const wordCounts = this.getWordCounts(x.response);
      console.log('counts', wordCounts);
      this.setLayout(wordCounts);
      this.layout.start();
    });

  }

  ngOnDestroy(): void {
    if (this.transcriptSub) {
      this.transcriptSub.unsubscribe();
    }
  }

  private setLayout(wordCounts: {[w: string]: number}): void {
    console.log('about to layout');
    this.layout = d3Cloud()
      .size(this.layoutSize)
      .words(Object.keys(wordCounts).map(word => {
        return {
          text: word,
          size: Math.floor(Math.sqrt(wordCounts[word] * 100))
        }
      }))
      .padding(5)
      .spiral('archimedean')
      //.rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("courier")
      .fontSize(function(d) { return d.size; })
      .on("end", this.draw.bind(this));
      

  }

  private minWordLength = 5;

  private getWordCounts(transcriptResponse: Transcript): {[w: string]: number} {
    const counts: {[w: string]: number} = {};
    return transcriptResponse.parts.reduce((counts, part) => {
      part.text.split(/\s/).forEach(word => {
        if (word.length < this.minWordLength) {
          return;
        }
        if (counts[word]) {
          counts[word]++;
        } else {
          counts[word] = 1;
        }
      });
      return counts;
    }, counts);
  }

  private draw(words: any) {
    console.log('about to draw', words)
    this.d3SvgElt
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }

}
