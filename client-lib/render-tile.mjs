import escapeAttributeValue from '@dankolz/escape-html-attribute-value'

export default function renderTile(data) {

return `<li class="${this.listItemClass || 'tile'}"  data-serialized="${escapeAttributeValue(JSON.stringify(data))}" draggable="true" style="touch-action: none;">
	<div class="actions">
		<a class="edit">e</a>
		<a class="delete" >&times;</a>
		<!-- <a class="move" href="#">&#8597;</a> -->
		
	</div>
	<div class="details">
		${this.renderTileDetails(data)}
	</div>
</li>
	`
}