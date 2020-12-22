import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Settings} from '../configs';
import {Subscription} from 'rxjs';
import {DataService} from '../data.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  @ViewChild('HTMLbeginDate') $beginDate: ElementRef;
  @ViewChild('HTMLbeginTime') $beginTime: ElementRef;
  @ViewChild('HTMLendDate') $endDate: ElementRef;
  @ViewChild('HTMLendTime') $endTime: ElementRef;
  @ViewChild('HTMLupdate') $update: ElementRef;
  @ViewChild('form') $form: ElementRef;

  public data: Settings;
  private subscription: Subscription;

  constructor(private dataService: DataService) { }

  private getData(): void {
    this.subscription = this.dataService.observeSettings().subscribe(settings => this.data = settings);
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get beginDate(): string {
    if (this.data) {
      return this.data.beginDate.replace(/\//g, '-');
    } else {
      return '';
    }
  }

  get beginTime(): string[] {
    if (this.data) {
      return this.data.beginTime.split(':');
    } else {
      return ['0', '0'];
    }
  }

  get endDate(): string {
    if (this.data) {
      return this.data.endDate.replace(/\//g, '-');
    } else {
      return '';
    }
  }

  get endTime(): string[] {
    if (this.data) {
      return this.data.endTime.split(':');
    } else {
      return ['0', '0'];
    }
  }

  get update(): string[] {
    if (this.data) {
      return this.data.update.split(':');
    } else {
      return ['0', '0'];
    }
  }

  public submit(event: any): void {
    event.preventDefault();

    const $message = this.$form.nativeElement.querySelector('small');

    const beginDateData = this.$beginDate.nativeElement.value.split('-');
    const beginTimeData = [
      this.$beginTime.nativeElement.querySelector('.hours').value,
      this.$beginTime.nativeElement.querySelector('.minutes').value
    ];

    const endDateData = this.$endDate.nativeElement.value.split('-');
    const endTimeData = [
      this.$endTime.nativeElement.querySelector('.hours').value,
      this.$endTime.nativeElement.querySelector('.minutes').value
    ];

    const updateData = [
      this.$update.nativeElement.querySelector('.hours').value,
      this.$update.nativeElement.querySelector('.minutes').value,
    ];

    const currentDate = new Date();

    const beginDate = new Date(
      beginDateData[0],
      beginDateData[1] - 1,
      beginDateData[2],
      beginTimeData[0],
      beginTimeData[1]
    );

    const endDate = new Date(
      endDateData[0],
      endDateData[1] - 1,
      endDateData[2],
      endTimeData[0],
      endTimeData[1]
    );

    console.log(currentDate);
    console.log(beginDate);
    console.log(endDate);

    let validMessage = '';
    if (isNaN(beginDate.getTime())) {
      validMessage = 'Begin date can\'t be empty';
    }

    if (isNaN(endDate.getTime())) {
      if (validMessage) { validMessage += '\n'; }
      validMessage += 'End date can\'t be empty';
    }

    if (validMessage) {
      $message.innerText = validMessage;
      return;
    }

    if (beginDate.getTime() < currentDate.getTime()) {
      $message.innerText = 'Begin date can\'t be less than current date';
      return;
    }

    if (endDate.getTime() <= beginDate.getTime()) {
      $message.innerText = 'End date can\'t be less than begin date';
      return;
    }

    if (updateData[0] === '0' && updateData[1] === '0') {
      $message.innerText = 'Update time can\'t be equal to zero';
      return;
    }

    this.data = {
      beginDate: beginDateData.join('/'),
      beginTime: beginTimeData.join(':'),
      endDate: endDateData.join('/'),
      endTime: endTimeData.join(':'),
      update: updateData.join(':')
    };

    $message.innerText = 'Approved';
    fetch('http://localhost:3000/settings', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(this.data)
    }).then(response => console.log(response));
  }

}
