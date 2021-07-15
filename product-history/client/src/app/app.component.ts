import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ProductHistory } from './models/models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'client';
  sourceID!: string;
  productHistory!: ProductHistory;
  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.productHistory = {"ID":"P#c1dfd96e-ea8c-52b6-a785-275bca38ac26","productName":"Product5","producer":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","producedAmount":0.42,"availableAmount":0.42,"unit":"kg","dateOfProduction":1626346493166,"locationOfProduction":{"x":0,"y":0},"certificates":[],"productMaterial":[{"product":{"ID":"P#da4b9237-bacc-5df1-9c07-60cab7aec4a8","productName":"Product3","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":5.89,"availableAmount":1.1899999999999995,"unit":"l","dateOfProduction":1626346493163,"locationOfProduction":{"x":0,"y":0},"certificates":["Bio"],"productMaterial":[{"product":{"ID":"P#b6589fc6-ab0d-582c-b120-99d1c2d40ab9","productName":"Product1","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":52.4,"availableAmount":52.4,"unit":"kg","dateOfProduction":1626346493163,"locationOfProduction":{"x":0,"y":0},"certificates":["Bio"],"productMaterial":[],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626346493163}]},"usedAmount":20.32852292020374},{"product":{"ID":"P#356a192b-7913-504c-9457-4d18c28d46e6","productName":"Product2","producer":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","producedAmount":2,"availableAmount":2,"unit":"pcs","dateOfProduction":1626346493163,"locationOfProduction":{"x":0,"y":0},"certificates":["WWF"],"productMaterial":[],"listOfOwnership":[{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626346493163}]},"usedAmount":1.1884550084889645}],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626346493165},{"owner":"org1MSP#d6a9a933c8aafc51e55ac0662b6e4d4a","received":1626346493163}]},"usedAmount":3.5},{"product":{"ID":"P#1b645389-2473-5467-9073-72d45eb05abc","productName":"Product4","producer":"org2MSP#3e0101ecf0d8427cf14f3f6dc2f0282d","producedAmount":0.5,"availableAmount":0.09999999999999998,"unit":"l","dateOfProduction":1626346493165,"locationOfProduction":{"x":0,"y":0},"certificates":[],"productMaterial":[],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626346493166},{"owner":"org2MSP#3e0101ecf0d8427cf14f3f6dc2f0282d","received":1626346493165}]},"usedAmount":0.2}],"listOfOwnership":[{"owner":"org3MSP#e3cdf70a99c1d6890c54ad56bd4a5de1","received":1626346493166}]}
  }
  ngOnInit(): void {
    console.log(this.route)
    this.route.queryParams.subscribe(params => {
      this.sourceID = params['sourceID'];
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
  }
}
