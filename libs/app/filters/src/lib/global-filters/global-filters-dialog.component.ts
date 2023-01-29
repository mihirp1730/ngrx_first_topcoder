import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { GisLayerPanelService, SettingsService } from '@slb-innersource/gis-canvas';
import { IFilterModel } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-filters/gis-filter-model/filter.model';
import { IGisLayer } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-layer-panel/gis-layer-panel.model';

@Component({
  selector: 'apollo-global-filters-dialog',
  templateUrl: './global-filters-dialog.component.html',
  styleUrls: ['./global-filters-dialog.component.scss']
})
export class GlobalFiltersDialogComponent {
  @Input() public layer!: IGisLayer;
  @Input() public filter!: IFilterModel;
  @Output() public filterChange: EventEmitter<IGisLayer> = new EventEmitter<IGisLayer>();

  constructor(
    public gisLayerPanelService: GisLayerPanelService,
    public settingsService: SettingsService,
    private cdRef: ChangeDetectorRef
  ) {}

  public onFilterChange() {
    this.filterChange.emit(this.layer);
    this.cdRef.detectChanges();
  }
}
