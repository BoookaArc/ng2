import { Command } from '../command/command';
import { commandKey } from '../command/command.key';

export const HIGHLIGHT_CELL_COMMAND_KEY = commandKey('highlight.cell.command');

export class HighlightCellCommand extends Command {
	constructor(plugin) {
		const { model } = plugin;

		super({
			key: HIGHLIGHT_CELL_COMMAND_KEY,
			canExecute: () => model.scene().status === 'stop' && !model.drag().isActive,
			execute: (cell) => {
				let { cell: currentCell } = model.highlight();
				let hasChanges = true;
				if (cell === currentCell) {
					hasChanges = false;
				}
				else if (cell && currentCell) {
					hasChanges =
						cell.rowIndex !== currentCell.rowIndex
						|| cell.columnIndex !== currentCell.columnIndex;
				}

				if (hasChanges) {
					model.highlight({
						cell
					}, {
						source: 'highlight.cell.command'
					});
				}
			}
		});
	}
}
