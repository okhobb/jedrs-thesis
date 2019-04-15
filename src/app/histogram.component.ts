import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';

import * as d3 from 'd3';
import { PbItem } from './pbItem';

@Component({
  selector: 'histogram',
  template: `

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

    .enter {
      fill: #EDCA3A;
    }
    
    .update {
      fill: #1FBAD6;
    }
    
    .exit {
      fill: #F25754;
    }
    
    .selected {
      fill: #E6B0F1;
    }
  `]
})
export class HistogramComponent implements AfterViewInit, OnChanges {

  @ViewChild('svgElt') svgElt: ElementRef<SVGElement>;
  @Input() pbItems: PbItem[];
  @Output() clickedItem: EventEmitter<PbItem> = new EventEmitter<PbItem>();

  svgWidth: number = 0;
  svgHeight: number = 0;

  private d3Svg: d3.Selection<SVGGElement, {}, null, undefined>;


  ngAfterViewInit(): void {

    if (this.pbItems.length === 0) {
      return;
    }

    const margin = {top: 10, right: 30, bottom: 30, left: 30};
    const width = 550 - margin.left - margin.right
    const height = 480 - margin.top - margin.bottom;

    this.svgWidth = width + margin.left + margin.right;
    this.svgHeight = height + margin.top + margin.bottom;

    this.d3Svg = d3.select(this.svgElt.nativeElement)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);


    const nbins = 20;

    const pbItemDateExtent = d3.extent(this.pbItems, x => x.date);
    const pbItemDateBins = d3.timeYears(
      d3.timeYear.offset(pbItemDateExtent[0],-1),
      d3.timeYear.offset(pbItemDateExtent[1],1));

    console.log('monthbins is', this.pbItems, pbItemDateExtent, pbItemDateBins);

    const x = d3.scaleLinear()
      .rangeRound([0, width])
      .domain(pbItemDateExtent);

    const histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(pbItemDateBins)
      .value(d => d.date)

    //binning data and filtering out empty bins
    const bins = histogram(this.pbItems);

    //g container for each bin
    let binContainer = this.d3Svg.selectAll(".gBin")
      .data(bins);

    binContainer.exit().remove()

    let binContainerEnter = binContainer.enter()
      .append("g")
        .attr("class", "gBin")
        .attr("transform", d => {
          console.log('d is ', d)
          return `translate(${x(d.x0)}, ${height})`;
        })

    //need to populate the bin containers with data the first time
    binContainerEnter.selectAll("circle")
        .data(d => d.map((p, i) => {
          return {
            idx: i,
            pbItem: p,
            radius: (x(d.x1)-x(d.x0))/2
          };
        }))
      .enter()
      .append("circle")
        .attr("class", "enter")
        .attr("cx", 0) //g element already at correct x pos
        .attr("cy", function(d) {
            return - d.idx * 2 * d.radius - d.radius; })
        .attr("r", d => d.radius)
        .on("click", d => this.handleClick(d));

    binContainerEnter.merge(binContainer)
        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

    //enter/update/exit for circles, inside each container
    let dots = binContainer.selectAll("circle")
        .data(d => d.map((p, i) => {
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
        .attr("cy", function(d) {
          return - d.idx * 2 * d.radius - d.radius; })
        .attr("r", d => d.radius)
      .merge(dots)
        .on("click", d => this.handleClick(d));

 
    this.d3Svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%y")));


  }


  ngOnChanges(changes: SimpleChanges): void {
    this.ngAfterViewInit();
  }

  private handleClick(d3DataPt: any): void {
    console.log('i clicked ', d3DataPt);
    this.clickedItem.next(d3DataPt.pbItem);
  }
}
