
import ObjectListView from "../client-lib/index.mjs"

let inputs = document.querySelectorAll('input[type="hidden"].object-list-view')
for(let input of inputs) {
	let view = new ObjectListView({
		input: input
		, renderEditForm: 
		`
		<label>
			Name:
			<br>
			<input name="name" type="text" />
		</label>
		
		`
		, renderTileDetails: function(data) {
			return `Name: ${data.name}`
		}

		, afterOpen(bodyElement, self) {
			bodyElement.style.backgroundColor = '#eeeeee'
		}
		// , generateStyles() {
		// 	return ''
		// }
		// , renderTile(data) {
		// 	return ''
		// }
	})
	view.render()
	input.after(view.el)
}

