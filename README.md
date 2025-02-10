# Object List in Input

This solves the problem for me where I have a screen to edit an object (an event, a newsletter, etc)
and the object has multiple of some sub type of object (like performance dates, documents, etc.)

This code works by using a text/hidden input element to store a JSON list. It then creates UI to
visualize that list as a sortable list of objects. The code renders boxes, to show the items, and
dialogs to create and edit the items, and the ability to remove options. It writes back to the 
input element whenever anything changes.

While I intend to use this with a `input` element as the data store, it's set up to be flexible
and asynchronus so that the data could be stored across the network.


## Install

```bash
npm install @webhandle/object-list-in-input
```


## Dependencies

It uses a number of dependencies to create dialogs, do dragable reordering, etc, but all of these
are pretty light, making the use of this code pretty light as well.

## Usage

There are lots HTML setups that could work. One of them is like:

```html
<label> Items
	<div class="data">
		<input name="items" type="hidden" class="object-list-view" value="[{&quot;name&quot;: &quot;one&quot;},{&quot;name&quot;: &quot;Angie&quot;},{&quot;name&quot;: &quot;two&quot;}]" />
	</div>
</label>
```

```js
import ObjectListView from "@webhandle/object-list-in-input"

let inputs = document.querySelectorAll('input[type="hidden"].object-list-view')
for(let input of inputs) {
	let view = new ObjectListView({

		// The input element which holds the data
		input: input
		
		// A string or function to create the fields
		, renderEditForm: 
		` <label>
			Name:
			<br>
			<input name="name" type="text" />
		</label> `
		
		// A string or function that renders summary data
		, renderTileDetails: function(data) {
			return `Name: ${data.name}`
		}
		// Code that gets run after the create/edit dialog opens
		, afterOpen(dialogBodyElement, self) {
			bodyElement.style.backgroundColor = '#eeeeee'
		}
	})
	
	// render all the html, set up listeners
	view.render()
	
	// put it on the page someplace
	input.after(view.el)
}
```

You have to implement the `renderEditForm` and `renderTileDetails` so it matches your data type.

The element in the html with class `data` is just there to contain the UI elements. The UI could be added anywhere to any element.

Make sure to escape the JSON for the `input` element value. It's pretty easy to do, but at least one way is to use the
package `@dankolz/escape-html-attribute-value` (which is already used by this package).

