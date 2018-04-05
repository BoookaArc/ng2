import { Injectable, Optional } from '@angular/core';
import { DisposableView } from 'ng2-qgrid/core/view/disposable.view';
import { RootService } from 'ng2-qgrid/infrastructure/component/root.service';
import { isUndefined } from 'ng2-qgrid/core/utility';
import {AppError} from "ng2-qgrid/core/infrastructure/error";

export interface IEventArgs {
	source?: string;
	status?: string;
}

@Injectable()
export class FocusService extends DisposableView {
	private model;

	constructor(@Optional() private root: RootService) {
		super();

		this.model = root.model;
	}

	activateAfterRender(state: string, args?: IEventArgs): void {
		this.using(this.model[`${state}Changed`].on(e => {
			const params = isUndefined(args) ? 'empty' : Object.keys(args).join('&');

			switch (params) {
				case 'empty': {
					this.focus();
					break;
				}
				case 'source': {
					if (e.tag.source === args.source) {
						this.focus();
					}
					break;
				}
				case 'source&status': {
					if (e.tag.source === args.source && e.state.status === args.status) {
						this.focus();
					}
					break;
				}
				default: {
					throw new AppError('focus.service', `Invalid arguments ${args}`);
				}
			}
		}));
	}

	private focus(): void {
		this.root.table.view.focus();
	}
}
