import { Component, NgZone } from '@angular/core';
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
  public loading = true;
  notFound=false;
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
  private readonly mockData: ProductHistory = {"ID":"P#c1dfd96e-ea8c-52b6-a785-275bca38ac26","productName":"Product5","producer":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","producedAmount":0.42,"availableAmount":0.16999999999999998,"unit":"kg","dateOfProduction":1626433784642,"locationOfProduction":{"x":0,"y":0},"certificates":[],"productMaterial":[{"product":{"ID":"P#da4b9237-bacc-5df1-9c07-60cab7aec4a8","productName":"Product3","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":5.89,"availableAmount":1.1899999999999995,"unit":"l","dateOfProduction":1626433784641,"locationOfProduction":{"x":0,"y":0},"certificates":["Bio"],"productMaterial":[{"product":{"ID":"P#b6589fc6-ab0d-582c-b120-99d1c2d40ab9","productName":"Product1","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":52.4,"availableAmount":52.4,"unit":"kg","dateOfProduction":1626433784640,"locationOfProduction":{"x":0,"y":0},"certificates":["Bio"],"productMaterial":[],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626433784640}]},"usedAmount":12.100311262026036},{"product":{"ID":"P#356a192b-7913-504c-9457-4d18c28d46e6","productName":"Product2","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":2,"availableAmount":2,"unit":"pcs","dateOfProduction":1626433784641,"locationOfProduction":{"x":0,"y":0},"certificates":["WWF"],"productMaterial":[],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626433784641}]},"usedAmount":0.7074136955291456}],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626433784641},{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626433784641}]},"usedAmount":2.0833333333333335},{"product":{"ID":"P#1b645389-2473-5467-9073-72d45eb05abc","productName":"Product4","producer":"org2MSP#3e0101ecf0d8427cf14f3f6dc2f0282d","producedAmount":0.5,"availableAmount":0.09999999999999998,"unit":"l","dateOfProduction":1626433784641,"locationOfProduction":{"x":0,"y":0},"certificates":[],"productMaterial":[],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626433784642},{"owner":"org2MSP#3e0101ecf0d8427cf14f3f6dc2f0282d","received":1626433784641}]},"usedAmount":0.11904761904761905}],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626433784642},{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626433784642}]}

  constructor(private route: ActivatedRoute, private http: HttpClient, private ngZone: NgZone) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.sourceID = params['sourceid'];
      if (this.sourceID !== undefined) {
        this.http.get(environment.backendUrl + '/' + encodeURIComponent(this.sourceID)).subscribe(productHistory => {
            this.productHistory = JSON.parse(productHistory.toString()) as ProductHistory;
            this.ngZone.run(() => {
              this.buildGraphRec(this.productHistory);
              this.loading = false;
            })
          },
          err => {
            console.error(err);
            this.notFound = true;
            this.productHistory = this.mockData
            this.ngZone.run(() => {
              this.buildGraphRec(this.productHistory);
              this.loading = false;
            })
          }
        );
      }
    });
    
  }

  private buildGraphRec(productHistory: ProductHistory, usedAmount?: number) {
    let parentID = undefined;
    usedAmount = usedAmount || productHistory.producedAmount
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
            customColor: this.PRODUCT_COLOR,
            amount: (Math.round((usedAmount + Number.EPSILON) * 100) / 100) + productHistory.unit
          }
        });
      } else {
        this.nodes.push({
          id: this.nextID,
          label: '',
          data: {
            owner: owner.owner,
            received: new Date(owner.received).toUTCString(),
            customColor: this.TRADE_COLOR
          }
        });
      }
      if(parentID) {
        this.links.push({
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
        source: `${this._nextid + 1}`,
        target: `${parentID}`,
        label: '',
        data: {
          linkText: 'shipping'
        }
      })
      this.buildGraphRec(material.product, material.usedAmount);
    }
  }

  public getStyles(node: Node): any {
    return {
      'border': '4px solid '+ node.data.customColor,
    };
  }
}
