import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SlbPopoverComponent } from '@slb-dls/angular-material/popover';
import { GisLayerPanelService, GisLayersService } from '@slb-innersource/gis-canvas';
import { IFilterAttributeModel } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-filters/gis-filter-model/filter-attribute.model';
import { IFilterModel } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-filters/gis-filter-model/filter.model';
import { IGisLayer } from '@slb-innersource/gis-canvas/gis-canvas-widget/gis-canvas-widget-components/gis-canvas-core/gis-layer-panel/gis-layer-panel.model';

@Component({
  selector: 'apollo-global-filters',
  templateUrl: './global-filters.component.html',
  styleUrls: ['./global-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class GisGlobalFiltersComponent implements OnChanges {
  @Input() public layers: IGisLayer[] = [];
  @Input() public dataObjectFilter = false;
  @Output() public filterChange: EventEmitter<IGisLayer> = new EventEmitter<IGisLayer>();
  @Output() public clearDataObjectFilter: EventEmitter<void> = new EventEmitter<void>();
  filter!: IFilterModel;
  selectedLayer!: IGisLayer | null;
  @ViewChild('tooltip') canvasElement!: SlbPopoverComponent;
  showGlobalFilters = false;
  opportunityLayer!: any;
  attributeSelected = false;
  disableClearBtn = true;

  constructor(
    public readonly gisLayerService: GisLayersService,
    public readonly gisLayerPanelService: GisLayerPanelService,
    public element: ElementRef
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    
    if(changes?.layers?.currentValue) {
      this.opportunityLayer = changes.layers.currentValue.filter((item: { name: string; }) => item.name === "Opportunity")[0];
      this.layers.forEach(layer => {
        if (layer.filter?.attributes.find((attr) => attr.isGlobalFilter)) {
          this.showGlobalFilters = true;
        }
      });
    }
  }

  public onClick(layer: IGisLayer, attribute: IFilterAttributeModel) {
    this.canvasElement.close();
    this.selectedLayer = layer;
    this.filter = {
      ...layer.filter,
      attributes: [attribute]
    } as IFilterModel;
  }

  isFilter(attribute: any) {
    let selector = '';
    attribute?.map((item: { selected: boolean }) => { 
      if(item.selected === true) {
        selector =  'selected'
      }
    })
    return selector;
  } 

  onFilterChange(layer: IGisLayer) {
    this.gisLayerPanelService.isLayersFilterChanged = true;
    if (layer.filter) {
      layer.filter.isAnyAttributeSelected = true;
    }
    this.isAnyAttribute(this.opportunityLayer.filter.attributes);
    this.gisLayerService.onFilterChange(layer);
    this.filterChange.emit(layer);
  }

  onClose() {
    this.selectedLayer = null;
  }

  isAnyAttribute(attribute: any[]) : any{
    this.attributeSelected = false;
    for(let i=0; i<attribute.length ;i++) {
        if(attribute[i].values.findIndex((item: { selected: boolean; }) => item.selected === true) > -1) {
            this.attributeSelected = true;
            break;
        }
    }
  }
  clearAllFilters() {
    if(this.attributeSelected) {   
      this.opportunityLayer.filter.attributes = this.gisLayerPanelService.clearAllFilter(this.opportunityLayer.filter.attributes);
      this.attributeSelected = false;    
      this.onFilterChange(this.opportunityLayer);
    }
    if(this.dataObjectFilter) {
       this.clearDataObjectFilter.emit();
    }
  }
}
