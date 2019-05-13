import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges, EventEmitter, Output } from '@angular/core';

import * as d3 from 'd3';

import { Subscription, Observable } from 'rxjs';

import { PbItem } from './pbItem';

@Component({
  selector: 'bubbles',
  template: `
    <div>
      <div loading [isLoading]="isLoading"></div>    
      <svg #svgElt [attr.width]="width" [attr.height]="height"></svg>
    </div>
  `
})
export class BubblesComponent implements AfterViewInit, OnChanges {

  @ViewChild('svgElt') svgElt: ElementRef<SVGElement>;
  @Input('pbItemsObs') pbItemsObs: Observable<PbItem[]>;
  @Output() clickedItem: EventEmitter<PbItem> = new EventEmitter<PbItem>();

  isLoading: boolean = true;

  readonly width = 960;
  readonly height = 500;
  private readonly padding = 1.5; // separation between same-color circles
  private readonly clusterPadding = 6; // separation between different-color circles
  private readonly maxRadius = 12;

  private sub: Subscription;

  private readonly bubbleRadius = 5;

  private pbItems: PbItem[] = [];
  ngAfterViewInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pbItemsObs']) {
      if (!this.pbItemsObs) {
        return;
      }
      this.isLoading = true;
      if (this.sub) {
        this.sub.unsubscribe();
      }
      this.pbItems = [];
      this.sub = this.pbItemsObs.subscribe(
        items => {
          this.pbItems = [...this.pbItems, ...items]
            .filter(item => item.genres !== undefined);
        },
        err => console.error(err),
        () => {
          this.draw();
          this.isLoading = false;
        });
    }
  }

  private draw(): void {

    //d3.select(this.svgElt.nativeElement).remove();

    const genresMap = this.pbItems.reduce((memo, curr) => {
      memo[curr.genres[0]] = true;
      return memo;
    }, {})
    const genres = Object.keys(genresMap);

    const m = genres.length; // number of distinct clusters

    console.log('genres are', genres);


    const colors = genres.map((genre, idx) => {
      const h = Math.floor(360.0 * (idx / m));
      return d3.color(`hsl(${h}, 100%, 50%)`)
    });

    var color = d3.scaleOrdinal(colors)
      .domain(genres);

    // The largest node for each cluster.
    var clusters = new Array(m);

    const nodes = this.pbItems.map(item => {
      const firstGenre = item.genres[0]
      const i = genres.indexOf(firstGenre);
      const r = this.bubbleRadius;
      //Math.sqrt((i + 1) / m * -Math.log(Math.random())) * this.maxRadius;
      const d = {
        cluster: i,
        radius: r,
        pbItem: item
      };
      if (!clusters[i] || (r > clusters[i].radius)) clusters[i] = d;
      return d;
    })

    var forceCollide = d3.forceCollide()
      .radius(function (d: any) { return d.radius + 1.5; })
      .iterations(1);

    var force = d3.forceSimulation()
      .nodes(nodes)
      .force("center", d3.forceCenter())
      .force("collide", forceCollide)
      .force("cluster", forceCluster)
      .force("gravity", d3.forceManyBody())
      .force("x", d3.forceX().strength(.7))
      .force("y", d3.forceY().strength(.7))
      .on("tick", tick);

    var svg = d3.select(this.svgElt.nativeElement)
      .append('g')
      .attr('transform', 'translate(' + this.width / 2 + ',' + this.height / 2 + ')');

    var circle = svg.selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", function (d) { return d.radius; })
      .style("fill", (d: any) => {
        if (d.pbItem.mediaType === 'Moving Image') {
          return <any>color(d.cluster);
        } else {
          return 'none';
        }
      })
      .style("stroke", (d: any) => <any>color(d.cluster))
      .style("stroke-width", () => 1)
      .on('mouseover', d => this.handleMouseover(d));


    function tick() {
      circle
        .attr("cx", function (d: any) { return d.x; })
        .attr("cy", function (d: any) { return d.y; });
    }

    function forceCluster(alpha) {
      for (var i = 0, n = nodes.length, node, cluster, k = alpha * 1; i < n; ++i) {
        node = nodes[i];
        cluster = clusters[node.cluster];
        node.vx -= (node.x - cluster.x) * k;
        node.vy -= (node.y - cluster.y) * k;
      }
    }
  }

  private handleMouseover(d3DataPt: any): void {
    this.clickedItem.next(d3DataPt.pbItem);
  }

}