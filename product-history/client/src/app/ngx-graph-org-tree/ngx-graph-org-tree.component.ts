import { Component } from '@angular/core';
import { Edge, Node, Layout } from '@swimlane/ngx-graph';
import { DagreNodesOnlyLayout, Orientation } from './customDagreNodesOnly';
import * as shape from 'd3-shape';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ProductHistory } from '../models/models';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ngx-graph-org-tree',
  templateUrl: './ngx-graph-org-tree.component.html',
  styleUrls: ['./ngx-graph-org-tree.component.scss']
})
export class NgxGraphOrgTreeComponent {
  readonly TRADE_COLOR = '#eb9e34';
  readonly PRODUCT_COLOR = '#1ca631';
  nodes: Node[] = [];
  links: Edge[] = [];
  sourceID!: string;
  productHistory!: ProductHistory;
  public layoutSettings = {
    orientation: Orientation.BOTTOM_TO_TOM
  };
  public curve: any = shape.curveLinear;
  public layout: Layout = new DagreNodesOnlyLayout();
  private _nextid = 0;
  get nextID(): string {
    this._nextid += 1;
    return ''+this._nextid;
  }

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.productHistory = {"ID":"P#0ade7c2c-f97f-55d0-8997-5f4d720d1fa6","productName":"Product5","producer":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","producedAmount":0.42,"availableAmount":0.42,"unit":"kg","dateOfProduction":1626389823605,"locationOfProduction":{"x":0,"y":0},"certificates":[],"productMaterial":[{"product":{"ID":"P#ac3478d6-9a3c-51fa-a2e6-0f5c3696165a","productName":"Product3","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":5.89,"availableAmount":1.1899999999999995,"unit":"l","dateOfProduction":1626389823605,"locationOfProduction":{"x":0,"y":0},"certificates":["Bio"],"productMaterial":[{"product":{"ID":"P#b6589fc6-ab0d-582c-b120-99d1c2d40ab9","productName":"Product1","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":52.4,"availableAmount":0,"unit":"kg","dateOfProduction":1626389823604,"locationOfProduction":{"x":0,"y":0},"certificates":["Bio"],"productMaterial":[],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626389823605},{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626389823604},{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626389823604},{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626389823604}]},"usedAmount":20.32852292020374},{"product":{"ID":"P#1b645389-2473-5467-9073-72d45eb05abc","productName":"Product2","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":2,"availableAmount":2,"unit":"pcs","dateOfProduction":1626389823605,"locationOfProduction":{"x":0,"y":0},"certificates":["WWF"],"productMaterial":[],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626389823605}]},"usedAmount":1.1884550084889645}],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626389823605},{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626389823605}]},"usedAmount":3.5},{"product":{"ID":"P#902ba3cd-a188-5801-994b-6e1b452790cc","productName":"Product4","producer":"org2MSP#3e0101ecf0d8427cf14f3f6dc2f0282d","producedAmount":0.5,"availableAmount":0.09999999999999998,"unit":"l","dateOfProduction":1626389823605,"locationOfProduction":{"x":0,"y":0},"certificates":[],"productMaterial":[],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626389823605},{"owner":"org2MSP#3e0101ecf0d8427cf14f3f6dc2f0282d","received":1626389823605}]},"usedAmount":0.2}],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626389823605}]}
  }

  ngOnInit(): void {
    console.warn(this.route)
    this.route.params.subscribe(params => {
      console.warn(params)
      this.sourceID = params['sourceid'];
      if (this.sourceID !== undefined) {
        this.http.get(environment.backendUrl + '/productHistory/' + this.sourceID).subscribe(productHistory => {
            this.productHistory = productHistory as ProductHistory;
          },
          err => {
            console.error(err)
          }
        );
      }
    });
    this.buildGraphRec(this.productHistory, undefined);
  }

  private buildGraphRec(productHistory: ProductHistory, parentID?: number) {
    const id = productHistory.ID;
    
    for(let i=0; i<productHistory.listOfOwnership.length; i++) {
      let owner = productHistory.listOfOwnership[i];
      if (i===productHistory.listOfOwnership.length-1) {
        this.nodes.push({
          id: this.nextID,
          label: productHistory.productName,
          data: {
            productName: productHistory.productName,
            producer: productHistory.producer,
            unit: productHistory.unit,
            dateOfProduction: new Date(productHistory.dateOfProduction).toUTCString(),
            customColor: this.PRODUCT_COLOR
          }
        });
      } else {
        this.nodes.push({
          id: this.nextID,
          label: 'Trade',
          data: {
            owner: owner.owner,
            received: new Date(owner.received).toUTCString(),
            customColor: this.TRADE_COLOR
          }
        });
      }
      if(parentID) {
        this.links.push({
          // id: parentID + '-' + productHistory.ID + owner.owner,
          source: `${this._nextid}`,
          target: `${parentID}`,
          label: '',
          data: {
            linkText: 'shipping'
          }
        })
      }
      parentID = this._nextid;
    }
    for (let material of productHistory.productMaterial) {
      this.links.push({
        // id: parentID + '-' + productHistory.ID + owner.owner,
        source: `${this._nextid + 1}`,
        target: `${parentID}`,
        label: '',
        data: {
          linkText: (Math.round((material.usedAmount + Number.EPSILON) * 100) / 100) + productHistory.unit
        }
      })
      this.buildGraphRec(material.product);
    }
  }

  public getStyles(node: Node): any {
    return {
      'border': '4px solid '+ node.data.customColor,
    };
  }
}
