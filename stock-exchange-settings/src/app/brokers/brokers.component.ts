import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {Broker} from '../configs';
import {DataService} from '../data.service';

import {faTimesCircle} from '@fortawesome/free-regular-svg-icons/faTimesCircle';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons/faPlusSquare';
import {ModalComponent} from '../modal/modal.component';

@Component({
  selector: 'app-brokers',
  templateUrl: './brokers.component.html',
  styleUrls: ['./brokers.component.scss']
})
export class BrokersComponent implements OnInit, OnDestroy {
  public faTimesCircle = faTimesCircle;
  public faPlusSquare = faPlusSquare;

  @ViewChild('form') $form: ElementRef;
  @ViewChild('modal') $modal: ModalComponent;

  private subscription: Subscription;
  public brokers: Array<Broker>;

  constructor(private dataService: DataService) {}

  private getData(): void {
    this.subscription = this.dataService.observeBrokers().subscribe(brokers => this.brokers = brokers);
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public changeUsername(newUsername: string, username: string): void {
    const broker = this.brokers.filter(b => b.username === username)[0];
    broker.username = newUsername;

    document.getElementById(username).setAttribute('id', newUsername);
    this.send();
  }

  public changeName(newName: string, username: string): void  {
    const broker = this.brokers.filter(b => b.username === username)[0];
    broker.name = newName;
    this.send();
  }

  public changeFund(newFund: string, username: string): void  {
    const broker = this.brokers.filter(b => b.username === username)[0];
    broker.fund = parseInt(newFund, 10);
    console.log(username, newFund);
    this.send();
  }

  public remove(username: string): void {
    document.getElementById(username).remove();
    const index = this.brokers.findIndex(broker => broker.username === username);
    this.brokers.splice(index, 1);
    this.send();
  }

  public send(): void {
    fetch('http://localhost:3000/brokers', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(this.brokers)
    }).then(response => console.log(response));
  }

  public validateForm(event: any): void {
    event.preventDefault();
    if (this.checkInputs()) {
      this.$modal.close();

      const username = this.$form.nativeElement.querySelector('.username input').value.trim();
      const name = this.$form.nativeElement.querySelector('.name input').value.trim();
      const fund = this.$form.nativeElement.querySelector('.fund input').value.trim();

      this.brokers.push({
        username,
        name,
        fund
      });

      this.send();
    }
  }

  private checkInputs(): boolean  {
    const $usernameVal = this.$form.nativeElement.querySelector('.username input').value.trim();
    const $nameVal = this.$form.nativeElement.querySelector('.name input').value.trim();
    const $fundVal = this.$form.nativeElement.querySelector('.fund input').value.trim();

    const $usernameMsg = this.$form.nativeElement.querySelector('.username small');
    const $nameMsg = this.$form.nativeElement.querySelector('.name small');
    const $fundMsg = this.$form.nativeElement.querySelector('.fund small');

    let usernameFailed = false;
    let nameFailed = false;
    let fundFiled = false;

    if (/\s/g.test($usernameVal)) {
      $usernameMsg.innerText = 'username can\'t contain white spaces';
      usernameFailed = true;
    }

    if (!usernameFailed && !isNaN(parseInt($usernameVal[0], 10))) {
      $usernameMsg.innerText = 'username can\'t contain number at first position';
      usernameFailed = true;
    }

    if (!usernameFailed && $usernameVal !== $usernameVal.toLowerCase()) {
      $usernameMsg.innerText = 'username can\'t contain uppercase characters';
      usernameFailed = true;
    }

    if (!usernameFailed && this.brokers.find(broker => broker.username === $usernameVal)) {
      $usernameMsg.innerText = 'this username is already taken';
      usernameFailed = true;
    }

    if (/\d/.test($nameVal)) {
      $nameMsg.innerText = 'name can\'t contain numbers';
      nameFailed = true;
    }

    if (isNaN($fundVal)) {
      $fundMsg.innerText = 'fund can contain only numbers';
      fundFiled = true;
    }

    if (!usernameFailed) {
      $usernameMsg.innerText = '';
    }

    if (!nameFailed) {
      $nameMsg.innerText = '';
    }

    if (!fundFiled) {
      $fundMsg.innerText = '';
    }

    return !(usernameFailed || nameFailed || fundFiled);
  }
}
