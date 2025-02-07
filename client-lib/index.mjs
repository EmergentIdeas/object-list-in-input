import { View } from '@webhandle/backbone-view'
// import escapeAttributeValue from './escape-attribute-value.mjs'

import gatherFormData from '@webhandle/gather-form-data'
import formValueInjector from 'form-value-injector'
import ListView from '@webhandle/drag-sortable-list'
import FormAnswerDialog from '@webhandle/form-answer-dialog'
import generateStyles from './generate-styles.mjs'
import renderTile from './render-tile.mjs'


export default class ObjectListView extends View {
	constructor(options) {
		super(options)
		this.input = options.input
		this.renderTile = options.renderTile || this.renderTile
		this.renderTileDetails = options.renderTileDetails || this.renderTileDetails
		this.listClass = options.listClass || 'object-list-view-list'
		this.listItemClass = options.listItemClass = 'tile'
		if ('renderStyles' in options) {
			this.renderStyles = options.renderStyles
		}
		else {
			this.renderStyles = true
		}
		
		this.dataAttributeName = options.dataAttributeName || 'data-serialized'
	}

	preinitialize() {
		this.events = {
			'click .delete': 'deleteClicked'
			, 'click .edit': 'editClicked'
			, 'click .add-item': 'addClicked'
		}
	}
	
	generateStyles = generateStyles

	renderTile = renderTile

	renderTileDetails(data) {
		return `${data.name}`
	}
	
	renderEditForm() {
		return ''
	}

	getData() {
		let value = this.input.value
		if (!value) {
			return []
		}
		return JSON.parse(value) || []
	}

	updateInput() {
		let result = []
		let items = this.el.querySelectorAll('.' + this.listItemClass)
		for (let item of items) {
			result.push(JSON.parse(item.getAttribute(this.dataAttributeName)))
		}
		this.input.value = JSON.stringify(result)
	}
	
	generateButtonRow(additionalClasses) {
		return `<div class="button-row ${additionalClasses}"><a href="#" class="add-item">Add</a></div>`
	}

	render() {
		let content = ''
		if (this.renderStyles) {
			content += this.generateStyles()
		}
		
		content += this.generateButtonRow()

		content += `<ul class="${this.listClass}">`
		for (let dat of this.getData()) {
			content += this.renderTile(dat)
		}
		content += '</ul>'
		
		content += this.generateButtonRow()
		
		
		this.el.innerHTML = content


		let elList = this.el.querySelector('ul')
		let itemsList = new ListView({
			el: elList
			// , mobileHandleSelector: `.${this.listItemClass} .move`
			, mobileHandleSelector: `.${this.listItemClass}`
			, createCellsForFiles(files) {
				return []
			}
			, createCellsForUriList(files) {
				return []
			}
		})
		itemsList.render()
		this.itemsList = itemsList
		this.itemsList.emitter.on('list-change', (evt) => {
			this.updateInput()
		})

		return this
	}

	deleteClicked(evt, selected) {
		evt.preventDefault()
		let answer = confirm('Please confirm that you want to delete this item?')
		if(answer) {
			selected.closest('.' + this.listItemClass).remove()
			this.updateInput()
		}
	}

	async editClicked(evt, selected) {
		evt.preventDefault()
		let li = selected.closest('.' + this.listItemClass)
		let data = JSON.parse(li.getAttribute(this.dataAttributeName))
		let dialog = new FormAnswerDialog({
			data: data
			, title: 'Edit'
			, body: this.renderEditForm
		})

		let info = await dialog.open()

		console.log(JSON.stringify(info))
		
		if(info) {
			li.querySelector('.details').innerHTML = this.renderTileDetails(info)	
			li.setAttribute(this.dataAttributeName, JSON.stringify(info))
			this.updateInput()
		}

	}

	async addClicked(evt, selected) {
		evt.preventDefault()
		let dialog = new FormAnswerDialog({
			title: 'Add'
			, body: this.renderEditForm
		})

		let info = await dialog.open()
		console.log(JSON.stringify(info))
		
		if(info) {
			let html = this.renderTile(info)
			let ul = this.el.querySelector('.' + this.listClass)
			ul.insertAdjacentHTML('beforeend', html)
			this.updateInput()
		}

	}
}
