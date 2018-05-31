import { build as buildPipe } from '../pipe/pipe.build';
import { Log } from '../infrastructure/log';
import { guid } from './guid';
import { PersistenceService } from '../persistence/persistence.service';
import { Scheduler } from './scheduler';
import { Defer } from '../infrastructure/defer';
import { isUndefined, clone, noop } from '../utility/kit';
import { PipeUnit } from '../pipe/pipe.unit';
import { FocusService } from '../focus/focus.service';

export class GridService {
	constructor(model) {
		this.model = model;
		this.scheduler = new Scheduler();
		this.state = new PersistenceService(model);
	}

	invalidate(source = 'invalidate', changes = {}, pipe = null, withBusy = true) {
		const { scheduler, model } = this;
		const scene = model.scene;
		const runPipe = buildPipe(model);
		const cancelBusy = withBusy ? this.busy() : noop;

		const nextTask = () => {
			cancelBusy();

			if (!scheduler.next()) {
				const round = scene().round;
				scene({ round: round + 1 }, {
					source,
					behavior: 'core'
				});
			}
		};

		const defer = new Defer();
		const task = () => {
			Log.info('grid', `start task ${source}`);

			scene({ status: 'start', round: 0 }, {
				source,
				behavior: 'core'
			});

			model.head().cache.clear();
			model.body().cache.clear();
			model.foot().cache.clear();

			return runPipe(source, changes, pipe || model.data().pipe)
				.then(() => {
					Log.info('grid', `finish task ${source}`);

					nextTask();
					defer.resolve();
				})
				.catch(ex => {
					Log.error('grid', ex);

					nextTask();
					defer.reject();
				});
		};

		Log.info('grid', `add task ${source}`);
		scheduler.add(task);

		return defer.promise;
	}

	busy() {
		const id = guid();
		const progress = this.model.progress;
		const queue = progress().queue.concat([id]);
		progress({ queue });

		return () => {
			const queue = Array.from(progress().queue);
			const index = queue.indexOf(id);
			if (index >= 0) {
				queue.splice(index, 1);
				progress({ queue });
			}
		};
	}

	focus(rowIndex, columnIndex) {
		const focus = new FocusService(this.model);
		focus.activate(rowIndex, columnIndex);
	}
}
