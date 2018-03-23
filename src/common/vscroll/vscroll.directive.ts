
import { Directive, OnInit, OnDestroy, ElementRef, Input, EventEmitter } from '@angular/core';
import { placeholderBitmap } from './vscroll.utility';

@Directive({
	selector: '[q-grid-vscroll]'
})
export class VscrollDirective implements OnDestroy {
	scrollEvent = new EventEmitter<any>();
	resetEvent = new EventEmitter<any>();

	constructor(private elementRef: ElementRef) {
		elementRef.nativeElement.addEventListener('scroll', this.onScroll, { passive: true });
		window.addEventListener('resize', this.onResize);
	}

	ngOnDestroy() {
		this.elementRef.nativeElement.removeEventListener('scroll', this.onScroll);
		window.removeEventListener('resize', this.onResize);
	}

	drawPlaceholder(width: number, height: number) {
		const box = this.elementRef.nativeElement;
		const style = box.style;
		const placeholder = placeholderBitmap(width || box.clientWidth, height || box.clientHeight);

		style.backgroundImage = 'url(' + placeholder + ')';
		style.backgroundRepeat = 'repeat';
	}

	resetX() {
		this.elementRef.nativeElement.scrollLeft = 0;
	}

	resetY() {
		this.elementRef.nativeElement.scrollTop = 0;
	}

	get element() {
		return this.elementRef.nativeElement;
	}

	private onScroll() {
		this.scrollEvent.emit();
	}

	private onResize() {
		const e = { handled: false, source: 'resize' };
		this.resetEvent.emit(e);
	}
}
