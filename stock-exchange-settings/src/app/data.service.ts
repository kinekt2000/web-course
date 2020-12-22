import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {Broker, Settings, Share} from './configs';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private _brokersSource = new BehaviorSubject<Array<Broker>>(undefined);
  private _currentBrokers = this._brokersSource.asObservable();

  private _sharesSource = new BehaviorSubject<Array<Share>>(undefined);
  private _currentShares = this._sharesSource.asObservable();

  private _settingsSource =  new BehaviorSubject<Settings>(undefined);
  private _currentSettings = this._settingsSource.asObservable();

  /* BROKERS */
  set brokers(brokers: Array<Broker>) {
    this._brokersSource.next(brokers);
  }

  get brokers(): Array<Broker> {
    return this._brokersSource.value;
  }

  public observeBrokers(): Observable<Broker[]> {
    return this._currentBrokers;
  }

  /* SHARES */
  set shares(shares: Array<Share>) {
    this._sharesSource.next(shares);
  }

  get shares(): Array<Share> {
    return this._sharesSource.value;
  }

  public observeShares(): Observable<Share[]> {
    return this._currentShares;
  }

  /* SETTINGS */
  set settings(settings: Settings) {
    this._settingsSource.next(settings);
  }

  get settings(): Settings {
    return this._settingsSource.value;
  }

  public observeSettings(): Observable<Settings> {
    return this._currentSettings;
  }

}
