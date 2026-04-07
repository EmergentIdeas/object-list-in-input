import { View } from '@webhandle/backbone-view'
import { ListView } from '@webhandle/drag-sortable-list'
import { FormAnswerDialog } from '@webhandle/dialog'
import renderTile from './render-tile.mjs'


export class ObjectListView extends View {
	constructor(options) {
		super(options)
		this.listClass = options.listClass || 'object-list-view-list'
		this.listItemClass = options.listItemClass || 'tile'

		this.dataAttributeName = options.dataAttributeName || 'data-serialized'
	}

	preinitialize() {
		this.events = {
			'click .delete': 'deleteClicked'
			, 'click .edit': 'editClicked'
			, 'click .add-item': 'addClicked'
		}
	}

	renderTileDetails(data) {
		return `${data.name}`
	}

	renderEditForm(data) {
		return ''
	}

	async getData() {
		let value = this.input.value
		if (!value) {
			return []
		}
		return JSON.parse(value) || []
	}

	async setData(data) {
		this.input.value = data
	}

	async updateData() {
		let result = []
		let items = this.el.querySelectorAll('.' + this.listItemClass)
		for (let item of items) {
			result.push(JSON.parse(item.getAttribute(this.dataAttributeName)))
		}
		return this.setData(JSON.stringify(result))
	}

	generateButtonRow(additionalClasses) {
		return `<div class="button-row ${additionalClasses || ''}"><a href="#" class="add-item">Add</a></div>`
	}

	async render() {
		let content = ''

		content += this.generateButtonRow(this.additionalButtonRowClasses)

		content += `<ul class="${this.listClass}">`
		for (let dat of (await this.getData())) {
			content += this.renderTile(dat)
		}
		content += '</ul>'

		content += this.generateButtonRow()

		this.el.innerHTML = content

		let elList = this.el.querySelector('ul')
		let itemsList = new ListView({
			el: elList
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
			this.updateData()
		})

		return this
	}

	deleteClicked(evt, selected) {
		evt.preventDefault()
		let answer = confirm('Please confirm that you want to delete this item?')
		if (answer) {
			selected.closest('.' + this.listItemClass).remove()
			this.updateData()
		}
	}
	afterOpen() {

	}

	async editClicked(evt, selected) {
		evt.preventDefault()
		let li = selected.closest('.' + this.listItemClass)
		let data = JSON.parse(li.getAttribute(this.dataAttributeName))
		data = this.preInjectionProcessor(data)
		
		

		let dialog = new FormAnswerDialog({
			data: data
			, title: 'Edit'
			, body: this.stringifyEditForm(data)
		})
		dialog.afterOpenOrg = dialog.afterOpen
		dialog.afterOpenList = this.afterOpen
		dialog.afterOpen = function() {
			this.afterOpenOrg()
			this.afterOpenList()
		}

		let info = await dialog.open()

		if (info) {
			info = this.returnedInfoProcessor(info)
			li.querySelector('.details').innerHTML = this.renderTileDetails(info)
			li.setAttribute(this.dataAttributeName, JSON.stringify(info))
			this.updateData()
		}
	}

	async addClicked(evt, selected) {
		evt.preventDefault()
		let dialog = new FormAnswerDialog({
			title: 'Add'
			, body: this.stringifyEditForm()
		})
		dialog.afterOpenOrg = dialog.afterOpen
		dialog.afterOpenList = this.afterOpen
		dialog.afterOpen = function() {
			this.afterOpenOrg()
			this.afterOpenList()
		}

		let info = await dialog.open()

		if (info) {
			info = this.returnedInfoProcessor(info)
			let html = this.renderTile(info)
			let ul = this.el.querySelector('.' + this.listClass)
			ul.insertAdjacentHTML('beforeend', html)
			this.updateData()
		}
	}
	
	preInjectionProcessor(info) {
		return info
	}
	returnedInfoProcessor(info) {
		return info
	}

	stringifyEditForm(data) {
		if (typeof this.renderEditForm === 'string') {
			return this.renderEditForm
		}
		return this.renderEditForm(data)
	}

	renderTile = renderTile
}


export { View, ListView, FormAnswerDialog }
export default ObjectListView