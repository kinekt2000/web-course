import {Component} from '@angular/core';

import {DataService} from './data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent{
  title = 'StockExchange';

  brokersLoaded = false;
  sharesLoaded = false;
  settingsLoaded = false;

  constructor(private dataService: DataService) {
    fetch('http://localhost:3000/brokers')
      .then(response => response.json())
      .then(data => { dataService.brokers = data; this.brokersLoaded = true; })
      .catch(err => console.log(err));

    fetch('http://localhost:3000/shares')
      .then(response => response.json())
      .then(data => { dataService.shares = data; this.sharesLoaded = true; })
      .catch(err => console.log(err));

    fetch('http://localhost:3000/settings')
      .then(response => response.json())
      .then(data => { dataService.settings = data; this.settingsLoaded = true; })
      .catch(err => console.log(err));
  }
}
