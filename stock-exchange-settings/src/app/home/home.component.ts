import {Component, OnDestroy, OnInit} from '@angular/core';
import {DataService} from '../data.service';
import {Subscription} from 'rxjs';
import {Broker, Settings, Share} from '../configs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  public brokers: Array<Broker> | null = null;
  public shares: Array<Share> | null = null;
  public settings: Settings | null = null;

  constructor(private dataService: DataService) {}

  private getData(): void {
    this.subscriptions.push(this.dataService.observeBrokers().subscribe(brokers => this.brokers = brokers));
    this.subscriptions.push(this.dataService.observeShares().subscribe(shares => this.shares = shares));
    this.subscriptions.push(this.dataService.observeSettings().subscribe(settings => this.settings = settings));
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}
