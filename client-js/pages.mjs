// import {default as go} from './index.js'
// go()

import ObjectListView from "../client-lib/index.mjs"
let i = 0

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
	})
	view.render()
	input.after(view.el)
}

