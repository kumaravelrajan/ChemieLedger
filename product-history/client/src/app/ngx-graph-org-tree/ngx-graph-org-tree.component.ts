import { Component, OnInit, Input } from '@angular/core';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout, Orientation } from './customDagreNodesOnly';
import * as shape from 'd3-shape';

@Component({
  selector: 'ngx-graph-org-tree',
  templateUrl: './ngx-graph-org-tree.component.html',
  styleUrls: ['./ngx-graph-org-tree.component.scss']
})
export class NgxGraphOrgTreeComponent {

  @Input() nodes: Node[] = [];
  @Input() links: Edge[] = [];
  public layoutSettings = {
    orientation: Orientation.BOTTOM_TO_TOM
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();

  constructor() { }

  public getStyles(node: Node): any {
    return {
      'border': '4px solid '+ node.data.customColor,
    };
  }
}
