import { DOCUMENT } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'apollo-resizable-container',
  templateUrl: './resizable-container.component.html',
  styleUrls: ['./resizable-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableContainerComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input()
  siblingElement: ElementRef;

  @Input()
  initialWidth = 600;

  @Input()
  maxWidth = 910;

  @Input()
  minWidth = 500;

  @ViewChild('dragBar') private resizerElement: ElementRef;
  @Output() public hostResize: EventEmitter<number> = new EventEmitter<number>();


  private resizer: HTMLElement;
  private leftSide: HTMLElement;
  private rightSide: HTMLElement;

  private mouseDownListener = this.mouseDownHandler.bind(this);
  private mouseUpListener = this.mouseUpHandler.bind(this);
  private mouseMoveListener = this.mouseMoveHandler.bind(this);

  constructor(
    @Inject(DOCUMENT) private readonly document: any,
    private hostElement: ElementRef,
    private renderer: Renderer2) {}

  ngOnInit() {
    const hostEl = this.hostElement.nativeElement;
    this.renderer.setStyle(hostEl, 'width', `${this.initialWidth}px`);
    this.renderer.setStyle(hostEl, 'min-width', `${this.minWidth}px`);
    this.renderer.setStyle(hostEl, 'max-width', `${this.maxWidth}px`);
    this.hostResize.emit(this.initialWidth);
  }

  ngAfterViewInit(): void {
    this.setResizerEvent();
  }

  public setResizerEvent() {
    this.leftSide = this.hostElement.nativeElement;
    this.rightSide = this.siblingElement.nativeElement;
    this.resizer = this.resizerElement.nativeElement;

    this.resizer.addEventListener('mousedown', this.mouseDownListener);
  }

  mouseDownHandler(e: any) {
    this.document.addEventListener('mousemove', this.mouseMoveListener);
    this.document.addEventListener('mouseup', this.mouseUpListener);
  }

  mouseMoveHandler(e: any) {
    const dx = e.clientX - (this.resizer.parentNode as Element).getBoundingClientRect().left;

    const newLeftWidth = this.getValidWidth(dx);
    this.leftSide.style.width = `${newLeftWidth}px`;

    this.resizer.style.cursor = 'col-resize';
    this.document.body.style.cursor = 'col-resize';

    this.leftSide.style.userSelect = 'none';
    this.leftSide.style.pointerEvents = 'none';

    this.rightSide.style.userSelect = 'none';
    this.rightSide.style.pointerEvents = 'none';
    this.hostResize.emit(newLeftWidth);
  }

  mouseUpHandler() {
    this.resizer.style.removeProperty('cursor');
    this.document.body.style.removeProperty('cursor');

    this.leftSide.style.removeProperty('user-select');
    this.leftSide.style.removeProperty('pointer-events');

    this.rightSide.style.removeProperty('user-select');
    this.rightSide.style.removeProperty('pointer-events');

    this.document.removeEventListener('mousemove', this.mouseMoveListener);
    this.document.removeEventListener('mouseup', this.mouseUpListener);
  }

  private getValidWidth(width: number): number {
    if(width < this.minWidth) {
      return this.minWidth;
    } else if(width > this.maxWidth) {
      return this.maxWidth;
    } else {
      return width;
    }
  }

  ngOnDestroy(): void {
    this.hostResize.emit(0);
  }
}
