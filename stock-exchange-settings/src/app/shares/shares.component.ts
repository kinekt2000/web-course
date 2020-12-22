import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {Share} from '../configs';
import {DataService} from '../data.service';

import {faTimesCircle} from '@fortawesome/free-regular-svg-icons/faTimesCircle';
import {faPlusSquare} from '@fortawesome/free-regular-svg-icons/faPlusSquare';
import {ModalComponent} from '../modal/modal.component';

@Component({
  selector: 'app-shares',
  templateUrl: './shares.component.html',
  styleUrls: ['./shares.component.scss']
})
export class SharesComponent implements OnInit, OnDestroy {
  public faTimesCircle = faTimesCircle;
  public faPlusSquare = faPlusSquare;

  private subscription: Subscription;
  public shares: Array<Share>;

  @ViewChild('form') $form: ElementRef;
  @ViewChild('modal') $modal: ModalComponent;

  public distributionOptions = ['linear', 'normal'];

  constructor(private dataService: DataService) {}

  private getData(): void {
    this.subscription = this.dataService.observeShares().subscribe(shares => this.shares = shares);
  }

  ngOnInit(): void {
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public remove(company: string): void {
    document.getElementById(company).remove();
    const index = this.shares.findIndex(share => share.company === company);
    this.shares.splice(index, 1);
    this.send();
  }

  public changeDistribution(distribution: string, company: string): void {
    const share = this.shares.find(s => s.company === company);
    share.distribution = distribution as typeof share.distribution;
    this.send();
  }

  public changeCount(count: string, company: string): void {
    const share = this.shares.find(s => s.company === company);
    share.count = parseInt(count, 10);
    this.send();
  }

  public  changePrice(price: string, company: string): void {
    const share = this.shares.find(s => s.company === company);
    share.price = parseInt(price, 10);
    this.send();
  }

  public send(): void {
    fetch('http://localhost:3000/shares', {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(this.shares)
    }).then(response => console.log(response));
  }

  public validateForm(event: any): void {
    event.preventDefault();
    if (this.checkInputs()) {
      this.$modal.close();

      const company = this.$form.nativeElement.querySelector('.company input').value.trim();
      const distribution = this.$form.nativeElement.querySelector('.distribution .selected').innerText.trim().toLowerCase();
      const count = this.$form.nativeElement.querySelector('.count input').value.trim();
      const price = this.$form.nativeElement.querySelector('.price input').value.trim();

      this.shares.push({
        company,
        distribution,
        count,
        price
      });

      this.send();
    }
  }

  private checkInputs(): boolean {
    const $companyVal = this.$form.nativeElement.querySelector('.company input').value.trim();
    const $distributionVal = this.$form.nativeElement.querySelector('.distribution .selected').innerText.trim();
    const $countVal = this.$form.nativeElement.querySelector('.count input').value.trim();
    const $priceVal = this.$form.nativeElement.querySelector('.price input').value.trim();

    const $companyMsg = this.$form.nativeElement.querySelector('.company small');
    const $distributionMsg = this.$form.nativeElement.querySelector('.distribution small');
    const $countMsg = this.$form.nativeElement.querySelector('.count small');
    const $priceMsg = this.$form.nativeElement.querySelector('.price small');

    let companyFailed = false;
    let distributionFailed = false;
    let countFailed = false;
    let priceFailed = false;

    if (/\d/.test($companyVal)) {
      $companyMsg.innerText = 'company can\'t contain numbers';
      companyFailed = true;
    }

    if ($distributionVal === 'select distribution') {
      $companyMsg.innerText = 'choose distribution';
      distributionFailed = true;
    }

    if (isNaN($countVal)) {
      $countMsg.innerText = 'count can contain only numbers';
      countFailed = true;
    }

    if (isNaN($priceVal)) {
      $priceMsg.innerText = 'price can contain only numbers';
      priceFailed = true;
    }

    if (!companyFailed) {
      $companyMsg.innerText = '';
    }

    if (!distributionFailed) {
      $distributionMsg.innerText = '';
    }

    if (!countFailed) {
      $countMsg.innerText = '';
    }

    if (!priceFailed) {
      $countMsg.innerText = '';
    }

    return !(companyFailed || distributionFailed || countFailed || priceFailed);
  }

  public handleList(): void {
    document.querySelector('.options-container').classList.toggle('active');
  }

  public select(selectField: HTMLDivElement, option: string): void {
    selectField.innerText = option;
    document.querySelector('.options-container').classList.remove('active');
  }
}
