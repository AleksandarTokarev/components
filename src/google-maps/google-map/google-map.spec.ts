import {Component, ViewChild} from '@angular/core';
import {waitForAsync, TestBed} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {GoogleMapsModule} from '../google-maps-module';
import {createMapConstructorSpy, createMapSpy} from '../testing/fake-google-map-utils';
import {DEFAULT_HEIGHT, DEFAULT_OPTIONS, DEFAULT_WIDTH, GoogleMap} from './google-map';

/** Represents boundaries of a map to be used in tests. */
const testBounds: google.maps.LatLngBoundsLiteral = {
  east: 12,
  north: 13,
  south: 14,
  west: 15,
};

/** Represents a latitude/longitude position to be used in tests. */
const testPosition: google.maps.LatLngLiteral = {
  lat: 30,
  lng: 35,
};

describe('GoogleMap', () => {
  let mapConstructorSpy: jasmine.Spy;
  let mapSpy: jasmine.SpyObj<google.maps.Map>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        imports: [GoogleMapsModule],
        declarations: [TestApp],
      });
    }),
  );

  beforeEach(() => {
    TestBed.compileComponents();
  });

  afterEach(() => {
    (window.google as any) = undefined;
    (window as any).gm_authFailure = undefined;
  });

  it('throws an error is the Google Maps JavaScript API was not loaded', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy, false);

    expect(() => TestBed.createComponent(TestApp)).toThrow(
      new Error(
        'Namespace google not found, cannot construct embedded google ' +
          'map. Please install the Google Maps JavaScript API: ' +
          'https://developers.google.com/maps/documentation/javascript/' +
          'tutorial#Loading_the_Maps_API',
      ),
    );
  });

  it('initializes a Google map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!;
    expect(container.nativeElement.style.height).toBe(DEFAULT_HEIGHT);
    expect(container.nativeElement.style.width).toBe(DEFAULT_WIDTH);
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, DEFAULT_OPTIONS);
  });

  it('sets height and width of the map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.height = '750px';
    fixture.componentInstance.width = '400px';
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!;
    expect(container.nativeElement.style.height).toBe('750px');
    expect(container.nativeElement.style.width).toBe('400px');
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, DEFAULT_OPTIONS);

    fixture.componentInstance.height = '650px';
    fixture.componentInstance.width = '350px';
    fixture.detectChanges();

    expect(container.nativeElement.style.height).toBe('650px');
    expect(container.nativeElement.style.width).toBe('350px');
  });

  it('should be able to set a number value as the width/height', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    const instance = fixture.componentInstance;
    instance.height = 750;
    instance.width = 400;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!.nativeElement;
    expect(container.style.height).toBe('750px');
    expect(container.style.width).toBe('400px');

    instance.height = '500';
    instance.width = '600';
    fixture.detectChanges();

    expect(container.style.height).toBe('500px');
    expect(container.style.width).toBe('600px');
  });

  it('should be able to set null as the width/height', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    const instance = fixture.componentInstance;
    instance.height = instance.width = null;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!.nativeElement;
    expect(container.style.height).toBeFalsy();
    expect(container.style.width).toBeFalsy();
  });

  it('sets center and zoom of the map', () => {
    const options = {center: {lat: 3, lng: 5}, zoom: 7, mapTypeId: DEFAULT_OPTIONS.mapTypeId};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.center = options.center;
    fixture.componentInstance.zoom = options.zoom;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!;
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, options);

    fixture.componentInstance.center = {lat: 8, lng: 9};
    fixture.componentInstance.zoom = 12;
    fixture.detectChanges();

    expect(mapSpy.setCenter).toHaveBeenCalledWith({lat: 8, lng: 9});
    expect(mapSpy.setZoom).toHaveBeenCalledWith(12);
  });

  it('sets map options', () => {
    const options = {
      center: {lat: 3, lng: 5},
      zoom: 7,
      draggable: false,
      mapTypeId: DEFAULT_OPTIONS.mapTypeId,
    };
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!;
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, options);

    fixture.componentInstance.options = {...options, heading: 170};
    fixture.detectChanges();

    expect(mapSpy.setOptions).toHaveBeenCalledWith({...options, heading: 170});
  });

  it('should set a default center if the custom options do not provide one', () => {
    const options = {zoom: 7};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(mapConstructorSpy.calls.mostRecent()?.args[1].center).toBeTruthy();
  });

  it('should set a default zoom level if the custom options do not provide one', () => {
    const options = {};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(mapConstructorSpy.calls.mostRecent()?.args[1].zoom).toEqual(DEFAULT_OPTIONS.zoom);
  });

  it('should not set a default zoom level if the custom options provide "zoom: 0"', () => {
    const options = {zoom: 0};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(mapConstructorSpy.calls.mostRecent()?.args[1].zoom).toEqual(0);
  });

  it('gives precedence to center and zoom over options', () => {
    const inputOptions = {center: {lat: 3, lng: 5}, zoom: 7, heading: 170};
    const correctedOptions = {
      center: {lat: 12, lng: 15},
      zoom: 5,
      heading: 170,
      mapTypeId: DEFAULT_OPTIONS.mapTypeId,
    };
    mapSpy = createMapSpy(correctedOptions);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.center = correctedOptions.center;
    fixture.componentInstance.zoom = correctedOptions.zoom;
    fixture.componentInstance.options = inputOptions;
    fixture.detectChanges();

    const container = fixture.debugElement.query(By.css('div'))!;
    expect(mapConstructorSpy).toHaveBeenCalledWith(container.nativeElement, correctedOptions);
  });

  it('exposes methods that change the configuration of the Google Map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const component = fixture.debugElement.query(By.directive(GoogleMap)).componentInstance;

    component.fitBounds(testBounds, 10);
    expect(mapSpy.fitBounds).toHaveBeenCalledWith(testBounds, 10);

    component.panBy(12, 13);
    expect(mapSpy.panBy).toHaveBeenCalledWith(12, 13);

    component.panTo(testPosition);
    expect(mapSpy.panTo).toHaveBeenCalledWith(testPosition);

    component.panToBounds(testBounds, 10);
    expect(mapSpy.panToBounds).toHaveBeenCalledWith(testBounds, 10);
  });

  it('exposes methods that get information about the Google Map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    const component = fixture.debugElement.query(By.directive(GoogleMap)).componentInstance;

    mapSpy.getBounds.and.returnValue(undefined);
    expect(component.getBounds()).toBe(null);

    component.getCenter();
    expect(mapSpy.getCenter).toHaveBeenCalled();

    mapSpy.getClickableIcons.and.returnValue(true);
    expect(component.getClickableIcons()).toBe(true);

    mapSpy.getHeading.and.returnValue(10);
    expect(component.getHeading()).toBe(10);

    component.getMapTypeId();
    expect(mapSpy.getMapTypeId).toHaveBeenCalled();

    mapSpy.getProjection.and.returnValue(undefined);
    expect(component.getProjection()).toBe(null);

    component.getStreetView();
    expect(mapSpy.getStreetView).toHaveBeenCalled();

    mapSpy.getTilt.and.returnValue(7);
    expect(component.getTilt()).toBe(7);

    mapSpy.getZoom.and.returnValue(5);
    expect(component.getZoom()).toBe(5);
  });

  it('initializes event handlers that are set on the map', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();

    const addSpy = mapSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('click', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('center_changed', jasmine.any(Function));
    expect(addSpy).toHaveBeenCalledWith('rightclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('bounds_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dblclick', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('drag', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragend', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('dragstart', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('heading_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('idle', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('maptypeid_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mousemove', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseout', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('mouseover', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('projection_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('tilesloaded', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('tilt_changed', jasmine.any(Function));
    expect(addSpy).not.toHaveBeenCalledWith('zoom_changed', jasmine.any(Function));
  });

  it('should be able to add an event listener after init', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    createMapConstructorSpy(mapSpy).and.callThrough();

    const addSpy = mapSpy.addListener;
    const fixture = TestBed.createComponent(TestApp);
    fixture.detectChanges();

    expect(addSpy).not.toHaveBeenCalledWith('projection_changed', jasmine.any(Function));

    // Pick an event that isn't bound in the template.
    const subscription = fixture.componentInstance.map.projectionChanged.subscribe();
    fixture.detectChanges();

    expect(addSpy).toHaveBeenCalledWith('projection_changed', jasmine.any(Function));
    subscription.unsubscribe();
  });

  it('should set the map type', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();

    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.mapTypeId = 'terrain' as unknown as google.maps.MapTypeId;
    fixture.detectChanges();

    expect(mapConstructorSpy).toHaveBeenCalledWith(
      jasmine.any(HTMLElement),
      jasmine.objectContaining({mapTypeId: 'terrain'}),
    );

    fixture.componentInstance.mapTypeId = 'roadmap' as unknown as google.maps.MapTypeId;
    fixture.detectChanges();

    expect(mapSpy.setMapTypeId).toHaveBeenCalledWith('roadmap');
  });

  it('sets mapTypeId through the options', () => {
    const options = {mapTypeId: 'satellite'};
    mapSpy = createMapSpy(options);
    mapConstructorSpy = createMapConstructorSpy(mapSpy).and.callThrough();
    const fixture = TestBed.createComponent(TestApp);
    fixture.componentInstance.options = options;
    fixture.detectChanges();

    expect(mapConstructorSpy.calls.mostRecent()?.args[1].mapTypeId).toBe('satellite');
  });

  it('should emit authFailure event when window.gm_authFailure is called', () => {
    mapSpy = createMapSpy(DEFAULT_OPTIONS);
    mapConstructorSpy = createMapConstructorSpy(mapSpy);

    expect((window as any).gm_authFailure).toBeUndefined();

    const createFixture = () => {
      const fixture = TestBed.createComponent(TestApp);
      fixture.detectChanges();
      spyOn(fixture.componentInstance.map.authFailure, 'emit');
      return fixture;
    };

    const fixture1 = createFixture();
    const fixture2 = createFixture();

    expect((window as any).gm_authFailure).toBeDefined();
    (window as any).gm_authFailure();

    expect(fixture1.componentInstance.map.authFailure.emit).toHaveBeenCalled();
    expect(fixture2.componentInstance.map.authFailure.emit).toHaveBeenCalled();
  });
});

@Component({
  selector: 'test-app',
  template: `<google-map [height]="height"
                         [width]="width"
                         [center]="center"
                         [zoom]="zoom"
                         [options]="options"
                         [mapTypeId]="mapTypeId"
                         (mapClick)="handleClick($event)"
                         (centerChanged)="handleCenterChanged()"
                         (mapRightclick)="handleRightclick($event)">
            </google-map>`,
})
class TestApp {
  @ViewChild(GoogleMap) map: GoogleMap;
  height?: string | number | null;
  width?: string | number | null;
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  options?: google.maps.MapOptions;
  mapTypeId?: google.maps.MapTypeId;

  handleClick(event: google.maps.MapMouseEvent) {}
  handleCenterChanged() {}
  handleRightclick(event: google.maps.MapMouseEvent) {}
}
