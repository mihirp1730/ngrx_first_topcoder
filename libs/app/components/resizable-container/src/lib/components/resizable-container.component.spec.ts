import { DOCUMENT } from '@angular/common';
import { ElementRef, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { noop } from 'lodash';

import { ResizableContainerComponent } from './resizable-container.component';

const mockRenderer = {
  setStyle: jest.fn()
};

class MockElementRef {
  nativeElement = {
    addEventListener: jest.fn(),
    style: {
      cursor: null,
      userSelect: null,
      pointerEvents: null,
      width: 0
    },
    parentNode: {
      getBoundingClientRect: jest.fn(() => ({
        left: 0
      }))
    }
  };
}
describe('ResizableContainerComponent', () => {
  let component: ResizableContainerComponent;
  let fixture: ComponentFixture<ResizableContainerComponent>;
  let documentMock: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: Renderer2, useValue: mockRenderer },
        { provide: ElementRef, useClass: MockElementRef }
      ],
      declarations: [ ResizableContainerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResizableContainerComponent);
    documentMock = TestBed.inject(DOCUMENT);
    component = fixture.componentInstance;
    jest.spyOn(component, 'setResizerEvent').mockImplementationOnce(noop);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('setResizerEvent', () => {
    beforeEach(() => {
      component.siblingElement = new MockElementRef();
      (component as any).resizerElement = new MockElementRef();
    });
    it('should add mousedown event listener', () => {
      component.setResizerEvent();
      expect((component as any).resizer).toBeDefined();
      expect((component as any).rightSide).toBeDefined();
      expect((component as any).leftSide).toBeDefined();
    });
  });

  describe('mouseDownHandler', () => {
    it('should set mousedown and mousemove event listeners', () => {
      const documentSpy = jest.spyOn(documentMock, 'addEventListener').mockImplementation();
      component.mouseDownHandler(null);
      expect(documentSpy).toBeCalled();
    });
  });

  describe('mouseMoveHandler', () => {
    beforeEach(() => {
      (component as any).resizer = new MockElementRef().nativeElement;
      (component as any).leftSide = new MockElementRef().nativeElement;
      (component as any).rightSide = new MockElementRef().nativeElement;
    })
    it('should set new width to client x', () => {
      const clientX = 700;
      const getValidWidthSpy = jest.spyOn((component as any), 'getValidWidth').mockReturnValue(clientX);
      component.mouseMoveHandler({clientX});
      expect((component as any).leftSide.style.width).toEqual(`${clientX}px`);
      expect((component as any).resizer.style.cursor).toEqual('col-resize');
      expect(documentMock.body.style.cursor).toEqual('col-resize');
      expect((component as any).leftSide.style.userSelect).toEqual('none');
      expect((component as any).leftSide.style.pointerEvents).toEqual('none');
      expect((component as any).rightSide.style.userSelect).toEqual('none');
      expect((component as any).rightSide.style.pointerEvents).toEqual('none');
      expect(getValidWidthSpy).toBeCalled();
    });
  });

  describe('getValidWidth', () => {
    beforeEach(() => {
      (component as any).minWidth = 1;
      (component as any).maxWidth = 10;
    });

    it('should return given width', () => {
      const width = 5;
      const result = (component as any).getValidWidth(width);
      expect(result).toEqual(width);
    });

    it('should return minWidth', () => {
      const width = 0;
      const result = (component as any).getValidWidth(width);
      expect(result).toEqual((component as any).minWidth);
    });

    it('should return maxWidth', () => {
      const width = 11;
      const result = (component as any).getValidWidth(width);
      expect(result).toEqual((component as any).maxWidth);
    });
  });
});
