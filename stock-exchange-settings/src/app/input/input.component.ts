import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {faPen} from '@fortawesome/free-solid-svg-icons/faPen';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  public faPen = faPen;

  @Input()
  public data: string;
  @Input()
  public width: string;
  @Input()
  public type: 'lowercase' | 'uppercase' | 'string' | 'number' | Array<string> = 'string';
  @Input()
  public editing = true;

  @Output()
  public changed = new EventEmitter<string>();

  @Output()
  public err = new EventEmitter<string>();

  private buffer: string;
  public showList = false;

  @ViewChild('content') $content: ElementRef;
  @ViewChild('message') $message: ElementRef;
  @ViewChild('list') $list: ElementRef;
  @ViewChild('overlay') $overlay: ElementRef;

  constructor() {}

  ngOnInit(): void {
    this.showList = this.type.constructor === Array;
  }

  public closeList(): void {
    this.$list.nativeElement.classList.remove('active');
    this.$overlay.nativeElement.classList.remove('active');
  }

  public change(item?: string): void {
    if (item) {
      this.$content.nativeElement.innerText = item;
      this.data = item;
      this.$list.nativeElement.classList.remove('active');
      this.$overlay.nativeElement.classList.remove('active');
    } else {
      this.$content.nativeElement.setAttribute('contentEditable', 'false');
      if (this.$content.nativeElement.innerText !== '') {
        this.data = this.$content.nativeElement.innerText;
      } else {
        this.data = this.buffer;
        this.$message.nativeElement.innerText = 'Filed cannot be empty';
        setTimeout(() => {
          this.$message.nativeElement.innerText = '';
        }, 3000);
      }
    }

    this.$content.nativeElement.innerText = this.data;
    this.changed.emit(this.data);
  }

  public edit(): void {
    if (typeof this.type === 'string') {
      this.buffer = this.$content.nativeElement.innerText;
      this.$content.nativeElement.setAttribute('contentEditable', 'true');
      this.$content.nativeElement.focus();
    } else {
      this.$list.nativeElement.classList.add('active');
      this.$overlay.nativeElement.classList.add('active');
    }
  }

  public checkInput(event: any): void {
    const char = event.key;
    const currentLine = this.$content.nativeElement.innerText;

    if (currentLine.length === 0 && char.trim().length === 0) {
      event.preventDefault();
      return;
    }

    const numeric = !isNaN(char * 1) && char !== ' ';

    switch (this.type) {
      case 'string':
        if (numeric) {
          event.preventDefault();
          return;
        }
        return;
      case 'lowercase':
        if (currentLine.length === 0 && numeric) {
          event.preventDefault();
          return;
        }

        if (!numeric && char === char.toUpperCase() && char) {
          event.preventDefault();
          return;
        }
        break;
      case 'uppercase':
        if (currentLine.length === 0 && numeric) {
          event.preventDefault();
          return;
        }

        if (!numeric && char === char.toLowerCase()) {
          event.preventDefault();
          return;
        }
        break;
      case 'number':
        if (!numeric) {
          event.preventDefault();
        }
        break;
    }
  }
}
