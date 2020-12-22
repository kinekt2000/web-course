import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnInit {

  @ViewChild('modal') $modal: ElementRef;
  @ViewChild('overlay') $overlay: ElementRef;

  constructor() { }

  ngOnInit(): void {
  }

  public open(): void {
    this.$modal.nativeElement.classList.add('active');
    this.$overlay.nativeElement.classList.add('active');
  }

  public  close(): void {
    this.$modal.nativeElement.classList.remove('active');
    this.$overlay.nativeElement.classList.remove('active');
  }

}
