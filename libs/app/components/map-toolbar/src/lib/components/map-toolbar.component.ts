import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { LassoTool, LassoToolsService } from '@apollo/app/lasso-tools';
import { GisCustomTemplateService, GisTopToolbarService, IToolbarVisibilityConfig } from '@slb-innersource/gis-canvas';
import { ITopToolbarAction } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-top-toolbar/gis-top-toolbar-action.interface';
import { BehaviorSubject, filter, firstValueFrom, fromEvent, Subject, switchMap, takeUntil } from 'rxjs';

import { MapPositions } from '../enums/map-toolbar.enum';

@Component({
  selector: 'apollo-map-toolbar',
  templateUrl: './map-toolbar.component.html',
  styleUrls: ['./map-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapToolbarComponent implements OnInit, OnDestroy {
  @Input()
  position = '';

  @Output()
  basemap = new EventEmitter<void>();

  @Output()
  zoomToWorldView = new EventEmitter<void>();

  @Output()
  lassoSelection: EventEmitter<LassoTool> = new EventEmitter<LassoTool>();

  private destroy$ = new Subject<void>();

  toolbarVisibilityConfig: IToolbarVisibilityConfig = {
    hideTooltip: true,
    hideDashboard: true,
    hideSavequery: true,
    hideHome: true,
    hideQuerypanel: true
  };

  render$ = new BehaviorSubject(false);

  @ViewChild('customToolbar', { read: TemplateRef, static: true }) customToolbar: TemplateRef<any> | undefined;

  constructor(
    private hostElement: ElementRef,
    private renderer: Renderer2,
    private gisCustomTemplateService: GisCustomTemplateService,
    private gisTopToolbarService: GisTopToolbarService,
    public lassoToolsService: LassoToolsService
  ) {}

  ngOnInit() {
    this.setStyles();
    this.setCustomMenu();
    this.setLassoHandlers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private setLassoHandlers(): void {
    this.lassoToolsService.currentLasso$.pipe(takeUntil(this.destroy$)).subscribe((lassoType: LassoTool) => {
      this.lassoSelection.emit(lassoType);
    });

    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        takeUntil(this.destroy$),
        filter((event) => event.key === 'Escape'),
        switchMap(() => this.lassoToolsService.getCurrentLasso()),
        filter((currentLasso) => currentLasso !== LassoTool.NONE)
      )
      .subscribe(() => {
        this.lassoToolsService.clearCurrentLasso();
      });
  }

  private setCustomMenu() {
    if (this.customToolbar) {
      this.gisCustomTemplateService.customToolbarButtons = {
        menus: this.customToolbar
      };
    }
  }

  private setStyles() {
    const hostEl = this.hostElement.nativeElement;
    if ((MapPositions as any)[this.position.toUpperCase()] === MapPositions.BOTTOM) {
      this.renderer.setStyle(hostEl, 'bottom', 0);
    } else {
      this.renderer.setStyle(hostEl, 'top', 0);
    }
  }

  private async onFreehandSelection(): Promise<void> {
    if (await this.clearCurrentLasso(LassoTool.FREEHAND)) {
      return;
    }

    this.lassoToolsService.updateCurrentLasso(LassoTool.FREEHAND);
  }

  private async onPolygonSelection(): Promise<void> {
    if (await this.clearCurrentLasso(LassoTool.POLYGON)) {
      return;
    }

    this.lassoToolsService.updateCurrentLasso(LassoTool.POLYGON);
  }

  private async onRectangleSelection(): Promise<void> {
    if (await this.clearCurrentLasso(LassoTool.RECTANGLE)) {
      return;
    }

    this.lassoToolsService.updateCurrentLasso(LassoTool.RECTANGLE);
  }

  private async clearCurrentLasso(selectedLasso: LassoTool): Promise<boolean> {
    const currentLasso = await firstValueFrom(this.lassoToolsService.currentLasso$);
    if (currentLasso === selectedLasso) {
      this.lassoToolsService.clearCurrentLasso();
      this.gisTopToolbarService.selectedToolbarButton.next('');
      return true;
    }
    return false;
  }

  public onToolbarAction(action: ITopToolbarAction) {
    switch (action.action) {
      case LassoTool.RECTANGLE.toLowerCase(): {
        this.onRectangleSelection();
        break;
      }
      case LassoTool.POLYGON.toLowerCase(): {
        this.onPolygonSelection();
        break;
      }
      case LassoTool.LASSO.toLowerCase(): {
        this.onFreehandSelection();
        break;
      }
      case 'basemap': {
        this.basemap.emit();
        break;
      }
      case 'zoomToWorld': {
        this.zoomToWorldView.emit();
        break;
      }
      case 'rubberbandzoom': {
        this.gisTopToolbarService.drawRectangleToZoom();
        break;
      }
    }
  }
}
