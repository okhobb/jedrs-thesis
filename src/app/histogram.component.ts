import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';

import * as d3 from 'd3';

import {Subscription, Observable} from 'rxjs';

import { PbItem } from './pbItem';

@Component({
  selector: 'histogram',
  template: `

    <div>{{pbItems.length}} results</div>
    <div class="histogram">
      <svg #svgElt
        [attr.width]="svgWidth"
        [attr.height]="svgHeight"
      ></svg>
    </div>

  `,
  styles: [`
    .histogram {
      width: 100%;
    }
  `]
})
export class HistogramComponent implements AfterViewInit, OnChanges, OnDestroy {

  @ViewChild('svgElt') svgElt: ElementRef<SVGElement>;
  @Input() pbItemsObs: Observable<PbItem[]>;
  @Output() clickedItem: EventEmitter<PbItem> = new EventEmitter<PbItem>();

  svgWidth: number = 0;
  svgHeight: number = 0;
  private margin: {top: number, right: number, bottom: number, left: number};
  private width: number;
  private height: number;
  

  private d3Svg: d3.Selection<SVGGElement, {}, null, undefined>;
  private d3SvgXAxis: any;

  pbItems: PbItem[] = [];
  private pbItemsSub: Subscription;

  constructor() {
    this.margin = {top: 10, right: 30, bottom: 30, left: 30};
    this.width = 550 - this.margin.left - this.margin.right
    this.height = 480 - this.margin.top - this.margin.bottom;

    this.svgWidth = this.width + this.margin.left + this.margin.right;
    this.svgHeight = this.height + this.margin.top + this.margin.bottom;
  }

  ngOnDestroy(): void {
    if (this.pbItemsSub) {
      this.pbItemsSub.unsubscribe();
    }
  }

  ngAfterViewInit(): void {



    this.d3Svg = d3.select(this.svgElt.nativeElement)
      .append("g")
      .attr("transform", `translate(${this.margin.left}, ${this.margin.top})`);

  }



  private handleDataUpdate(): void {

    // TODO - figure tf out how to re-use elements in proper d3 fashion.
    this.d3Svg.selectAll(".gBin").remove();

    const pbItemDateExtent = d3.extent(this.pbItems, x => x.date);
    const pbItemDateBins = d3.timeYears(
      d3.timeYear.offset(pbItemDateExtent[0],-1),
      d3.timeYear.offset(pbItemDateExtent[1],1));

    const x = d3.scaleLinear()
      .rangeRound([0, this.width])
      .domain(pbItemDateExtent);

    const histogram = d3.histogram()
      .domain(_ => [x.domain()[0], x.domain()[1]])
      .thresholds(_ => pbItemDateBins.map(x => x.getTime()))
      .value((d: any) => d.date)

    //binning data and filtering out empty bins
    const bins = histogram(<any[]>this.pbItems);

    //g container for each bin
    let binContainer = this.d3Svg.selectAll(".gBin")
      .data(bins);

    binContainer.exit().remove()

    let binContainerEnter = binContainer.enter()
      .append("g")
        .attr("class", "gBin")
        .attr("year", (d: any) => new Date(d.x0).getFullYear())
        .attr("transform", (d: any) => {
          //console.log('adding gbin', new Date(d.x0), x(d.x0));
          return `translate(${x(d.x0)}, ${this.height})`;
        })

  

    //need to populate the bin containers with data the first time
    binContainerEnter.selectAll("circle")
        .data((d: any) => d.map((p, i) => {
          return {
            idx: i,
            pbItem: p,
            radius: (x(d.x1)-x(d.x0))/2
          };
        }))
      .enter()
      .append("circle")
        .attr("class", "enter")
        .attr("year", (d: any) => d.pbItem.date.getFullYear())
        .attr("cx", 0) //g element already at correct x pos
        .attr("cy", (d: any) => {
            return - d.idx * 2 * d.radius - d.radius; })
        .attr("r", (d: any) => d.radius)
        .attr('fill', (d: any) => {
          const year = d.pbItem.date.getYear();
          return (year % 2 === 0) ? 'red' : 'green';
        })
        .on("click", d => this.handleClick(d));

    binContainerEnter.merge(<any>binContainer)
        .attr("transform", (d: any) => {
          //console.log('reseting translate for bin', new Date(d.x0).getFullYear(), x(d.x0))
          return `translate(${x(d.x0)}, ${this.height})`;
        })
        .attr('isreset', (d: any) => {
          return new Date(d.x0).getFullYear();
        })

    //enter/update/exit for circles, inside each container
    let dots = binContainer.selectAll("circle")
        .data((d: any) => d.map((p, i) => {
          return {
            idx: i,
            pbItem: p,
            radius: (x(d.x1)-x(d.x0))/2
          };
        }))


    //ENTER new elements present in new data.
    dots.enter()
      .append("circle")
        .attr("class", "enter")
        .attr("cx", 0) //g element already at correct x pos
        .attr("cy", (d: any) => {
          return - d.idx * 2 * d.radius - d.radius; })
        .attr("r", (d: any) => d.radius)
      .merge(<any>dots)
        .on("click", d => this.handleClick(d));

    if (! this.d3SvgXAxis) {
      this.d3SvgXAxis = this.d3Svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")");
    }
    this.d3SvgXAxis.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

  }

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
          this.handleDataUpdate();
        });
      }
    }
  }

  private handleClick(d3DataPt: any): void {
    this.clickedItem.next(d3DataPt.pbItem);
  }

}
