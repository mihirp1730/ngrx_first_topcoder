import { Directive, HostListener, Input, OnDestroy } from '@angular/core';
import { IOpportunityMapRepresentation } from '@apollo/app/services/opportunity';
import { Store } from '@ngrx/store';
import { GisCanvas, GisMapDataService, GisMapLargeService, SettingsService } from '@slb-innersource/gis-canvas';
import { Subscription } from 'rxjs';

import * as opportunitySelectors from '../state/selectors/opportunity.selectors';

@Directive({
  selector: '[apolloMapHighlight]'
})
export class MapHighlightDirective implements OnDestroy {
  @Input('apolloMapHighlight') highlightResultObject: IOpportunityMapRepresentation;
  subscription: Subscription = new Subscription();

  selectedLayers$ = this.store.select(opportunitySelectors.selectHiddenMRs);

  layerPrefix = '_gis_highlight_';
  mapRepresentationId = 'mapRepresentationId';
  selectedLayer: any[];
  constructor(
    public gisMapLargeService: GisMapLargeService,
    public mapDataService: GisMapDataService,
    public settingsService: SettingsService,
    private store: Store
  ) { }

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
    this.mapDataService.gisMapInstance?.layers.forEach((l) => {
      if (l.originalOptions.name?.includes(this.layerPrefix)) {
        this.removeHighlightLayer(l);
      }
    });
  }

  public highlightResult(highlightResultObject) {
    if (!this.settingsService.map.highlightResult || this.selectedLayer?.find((item) => item.mapRepresentationId === highlightResultObject.mapRepresentationId)) {
      return;
    }
    const layerToHighlight = this.gisMapLargeService.settingsService.layersConfiguration.find(setting => {
      return setting["id"] === highlightResultObject.type;
    });
    const selectedLayer = this.mapDataService.gisMapInstance.layers.find(e => { return e?.originalOptions?.name === layerToHighlight.name});
    if(selectedLayer) {
        const originalOptions = selectedLayer.originalOptions;
        if (!originalOptions.name?.includes(this.layerPrefix)) {
          if (originalOptions.service && originalOptions.service.type === 'WMS') {
            return false;
          }
          const defaultHighlightStyle = this.settingsService.highlightStyleResultOnHover.getDefaultHighlightStyle(
            originalOptions.query.select.type
          );
          const defaultStyle = this.settingsService.defaultLayer.getDefaultRuleStyle(originalOptions.query.select.type);
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
                  col: this.mapRepresentationId,
                  test: 'Equal',
                  value: highlightResultObject.mapRepresentationId
                }
              ]
            ];
            const newLayerObj = {
              name: `${this.layerPrefix}${originalOptions.name}`,
              query: { ...originalOptions.query, where },
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
