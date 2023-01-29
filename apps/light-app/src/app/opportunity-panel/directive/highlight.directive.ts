import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { GisCanvas, GisMapDataService, GisMapLargeService, SettingsService } from '@slb-innersource/gis-canvas';
import { Subscription } from 'rxjs';
import * as opportunityPanelSelectors from '../state/selectors/opportunity-panel.selectors';
@Directive({
  selector: '[apolloHighlight]'
})
export class HighlightDirective implements OnDestroy {
  @Input('apolloHighlight') highlightResultObject: string;
  subscription: Subscription = new Subscription();

  selectedLayers$ = this.store.select(opportunityPanelSelectors.selectFilteredLayers);

  layerPrefix = '_gis_highlight_';
  opportunityId = 'OpportunityId';
  selectedLayer: any[];
  constructor(
    public gisMapLargeService: GisMapLargeService,
    public mapDataService: GisMapDataService,
    public settingsService: SettingsService,
    private store: Store
  ) {}

  ngOnInit() {
    this.subscription.add(
      this.selectedLayers$.pipe().subscribe((layers) => {
        this.selectedLayer = layers;
      })
    );
  }

  ngOnDestroy(): void {
    this.mouseleave();
    this.subscription.unsubscribe();
  }

  @HostListener('mouseenter') mouseover() {
    this.highlightResult(this.highlightResultObject);
  }

  @HostListener('mouseleave') mouseleave() {
    if (this.settingsService.map.highlightResult) {
      this.removeHighlightResult();
    }
  }

  public removeHighlightResult() {
    this.mapDataService.gisMapInstance.layers.forEach((l) => {
      if (l.originalOptions.name?.includes(this.layerPrefix)) {
        this.removeHighlightLayer(l);
      }
    });
  }

  public highlightResult(opportunityId) {
    if (this.settingsService.map.highlightResult) {
      this.mapDataService.gisMapInstance.layers
        .filter((layer) => this.selectedLayer?.find((item) => item === layer['originalTableName'].split('/')[1]))
        .forEach((selectedLayer) => {
          if (!selectedLayer.originalOptions.name?.includes(this.layerPrefix)) {
            if (selectedLayer.originalOptions.service && selectedLayer.originalOptions.service.type === 'WMS') {
              return false;
            }
            const defaultHighlightStyle = this.settingsService.highlightStyleResultOnHover.getDefaultHighlightStyle(
              selectedLayer.originalOptions.query.select.type
            );
            const defaultStyle = this.settingsService.defaultLayer.getDefaultRuleStyle(selectedLayer.originalOptions.query.select.type);
            if (defaultStyle) {
              const highlightStyle = {
                borderColor: defaultHighlightStyle.borderColor || defaultHighlightStyle.fillColor,
                borderWidth: defaultHighlightStyle.borderWidth || 1,
                fillColor: defaultHighlightStyle.fillColor
              };
              defaultStyle.rules[0].style = highlightStyle;
              const where = [
                [
                  {
                    col: this.opportunityId,
                    test: 'Equal',
                    value: opportunityId
                  }
                ]
              ];
              const newLayerObj = {
                name: `${this.layerPrefix}${selectedLayer.originalOptions.name}`,
                query: { ...selectedLayer.originalOptions.query, where },
                compositeKey: this.layerPrefix,
                zIndex: '1000',
                style: defaultStyle,
                opacity: '1',
                visible: true,
                defaultLayer: true
              };
              this.loadHighlightLayer(newLayerObj);
            }
          }
        });
    }
  }

  private loadHighlightLayer(layer) {
    const highlightLayer = this.gisMapLargeService.map.layers.find((layerData) => layerData.originalOptions.name == layer.name);
    if (!highlightLayer) {
      GisCanvas.layer(this.gisMapLargeService.map, layer);
    } else {
      highlightLayer.load(layer);
    }
  }

  private removeHighlightLayer(layer) {
    layer.originalOptions.visible = false;
    layer.hide();
  }
}
