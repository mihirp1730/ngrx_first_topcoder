import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { LassoToolsService } from '../lasso-tools.service';
import { LassoTool } from './lasso-tools.helper';

@Component({
  selector: 'apollo-lasso-tools',
  templateUrl: './lasso-tools.component.html',
  styleUrls: ['./lasso-tools.component.scss']
})
export class LassoToolsComponent implements OnInit, OnDestroy {
  @Output() zoomToWorldView: EventEmitter<void> = new EventEmitter<void>();
  @Output() lassoSelection: EventEmitter<LassoTool> = new EventEmitter<LassoTool>();
  @Output() basemap: EventEmitter<void> = new EventEmitter<void>();

  @Input() isDataFlow = false;

  private subscription: Subscription = new Subscription();
  public lassoTool = LassoTool;

  constructor(public lassoToolsService: LassoToolsService) {}

  public ngOnInit(): void {
    // Handle change in lasso
    this.subscription.add(
      this.lassoToolsService.currentLasso$.subscribe((lassoType: LassoTool) => {
        this.lassoSelection.emit(lassoType);
      })
    );

    // Handle escape event
    this.subscription.add(
      fromEvent<KeyboardEvent>(document, 'keydown')
        .pipe(
          filter((event) => event.key === 'Escape'),
          switchMap(() => this.lassoToolsService.getCurrentLasso()),
          filter((currentLasso) => currentLasso !== LassoTool.NONE)
        )
        .subscribe(() => {
          this.lassoToolsService.clearCurrentLasso();
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public onZoomToWorldView(): void {
    this.zoomToWorldView.emit();
  }

  public onFreehandSelection(currentLasso: LassoTool): void {
    if (currentLasso === LassoTool.FREEHAND) {
      this.lassoToolsService.clearCurrentLasso();
      return;
    }

    this.lassoToolsService.updateCurrentLasso(LassoTool.FREEHAND);
  }

  public onPolygonSelection(currentLasso: LassoTool): void {
    if (currentLasso === LassoTool.POLYGON) {
      this.lassoToolsService.clearCurrentLasso();
      return;
    }

    this.lassoToolsService.updateCurrentLasso(LassoTool.POLYGON);
  }

  public onRectangleSelection(currentLasso: LassoTool): void {
    if (currentLasso === LassoTool.RECTANGLE) {
      this.lassoToolsService.clearCurrentLasso();
      return;
    }

    this.lassoToolsService.updateCurrentLasso(LassoTool.RECTANGLE);
  }

  public onBasemapClick(): void {
    this.basemap.emit();
  }
}
