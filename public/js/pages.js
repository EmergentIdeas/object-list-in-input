/******/ var __webpack_modules__ = ({

/***/ "./node_modules/@dankolz/escape-html-attribute-value/index.js":
/*!********************************************************************!*\
  !*** ./node_modules/@dankolz/escape-html-attribute-value/index.js ***!
  \********************************************************************/
/***/ ((module) => {

function escapeHtmlAttributeValue(s, preserveCR) {
    preserveCR = preserveCR ? '&#13;' : '\n';
    return ('' + s) 
        .replace(/&/g, '&amp;') 
        .replace(/'/g, '&apos;') 
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\r\n/g, preserveCR) 
        .replace(/[\r\n]/g, preserveCR)
}

module.exports = escapeHtmlAttributeValue


/***/ }),

/***/ "./node_modules/ei-dialog/dialog.js":
/*!******************************************!*\
  !*** ./node_modules/ei-dialog/dialog.js ***!
  \******************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

let dialogStyles = __webpack_require__(/*! ./dialog-styles.txt */ "./node_modules/ei-dialog/dialog-styles.txt")
let sequence = 0

// If we're loading via a module system or packed by webpack, we may
// have a module here instead of the value. We need to check for default
// and use that if it exists.
if(typeof dialogStyles !== 'string' && dialogStyles.default) {
	dialogStyles = dialogStyles.default	
}


/**
 * A button definition.
 * @typedef {Object} Button
 * @property {string} classes Classes to add to the button
 * @property {string} label Text shown to the user
 */



/**
 * A whole page dialog. 
 * @param {object} options 
 * @param {string,function} options.body The contents of the body section. This can be a string,
 * in which case it will just be inserted into the body. It can be a function, in which case
 * it is expected to return a string (which will be inserted) or a Promise, which should resolve to
 * a string, which will be inserted. However, this function is passed the body element and dialog
 * object as arguments, so it can also modify content directory and return an empty string.
 * @param {object} options.on An object which the key is the selector and the value is a funtion
 * which is called when the object with that selector is clicked. If the function returns false the
 * dialog will not be closed. If it returns a Promise, the promise will be resolved and if the resolved
 * value is false, it will not be closed. Any other return condition will result in the dialog being
 * closed.
 * @param {Button[]} options.buttons The buttons that will show up in the footer of the dialog. If buttons are not
 * specified, "OK" and "Cancel" buttons will be added.
 * @param {string} options.title The title of the dialog
 * @param {string} options.dialogFrameClass An additional string inserted into the class attribute for
 * specific styling of specific types of dialog boxes.
 * @param {function} options.afterOpen A function which is called after open with the body element and dialog object
 * as arguments.
 */
var Dialog = function(options) {
	this.id = "dialog" + (new Date().getTime()) + (sequence++)
	Object.assign(this, options)
	if(!this.on) {
		this.on = {}
	}
	if(!this.on['.btn-cancel']) {
		this.on['.btn-cancel'] = function() {
		}
	}
	if(!this.on['.btn-close']) {
		this.on['.btn-close'] = function() {
		}
	}
	
	if(!options.buttons) {
		this.buttons = [
			{
				classes: 'btn btn-primary btn-ok',
				label: 'OK'
			},
			{
				classes: 'btn btn-cancel',
				label: 'Cancel'
			}
		]
	}
	
	this.body = options.body
}

Dialog.prototype.getBodySelector = function() {
	return '#' + this.id + ' .body'
}

Dialog.prototype.getFrameSelector = function() {
	return '#' + this.id 
}

Dialog.prototype.addStylesIfNeeded = function() {
	if(!document.querySelector('#dialog-frame-styles')) {
		document.querySelector('head').insertAdjacentHTML('beforeend', 
			'<style type="text/css" id="dialog-frame-styles">' +
			dialogStyles + 
			'</style>')
	}
}

Dialog.prototype.renderButton = function(button) {
	return `<button class="${button.classes}" type="button">${button.label}</button>`
}

Dialog.prototype.generateFrame = function() {
	let buttons = this.buttons.map(this.renderButton).join('')
	
	return `
<div class="dialog-frame ${this.dialogFrameClass || ''}" id="${this.id}" >
	<div class="mask">
	</div>
	<div class="the-dialog">
		<div class="close btn-close">&times;</div>
		<div class="head">
			${this.title}
		</div>
		<div class="body">
		</div>
		<div class="foot">
			${buttons}
		</div>
	</div>
</div>
	`
}

Dialog.prototype.open = function() {
	let self = this
	this.addStylesIfNeeded()
	document.querySelector('body').insertAdjacentHTML('beforeend', this.generateFrame())
	
	let bodySelector = this.getBodySelector()
	let frameSelector = this.getFrameSelector()
	
	let bodyContent
	let bodyElement = document.querySelector(bodySelector)
	let frameElement = document.querySelector(frameSelector)

	
	
	frameElement.addEventListener('click', function(evt) {
		for(let selector in self.on) {
			let target = frameElement.querySelector(selector)
			if(evt.target == target) {
				let result = self.on[selector]()
				if(typeof result === 'boolean') {
					if(result) {
						self.close()
					}
				}
				else if(typeof Promise === 'function' && result instanceof Promise) {
					result.then(function(result) {
						if(result !== false) {
							self.close()
						}
					})
				}
				else {
					self.close()
				}
				
				break
			}
		}
	})
	
	function afterOpenResizeSetup() {
		setTimeout(function() {
			let head = document.querySelector(frameSelector + ' .head').clientHeight 
			let foot = document.querySelector(frameSelector + ' .foot').clientHeight
			let topAndBottom = head + foot

			bodyElement.style.maxHeight = 'calc(90vh - ' + topAndBottom + 'px)'
			frameElement.classList.add('open')
			
			if(self.afterOpen) {
				self.afterOpen(bodyElement, self)
			}
		})
	}
	
	if(typeof this.body === 'function') {
		bodyContent = this.body(bodyElement, this)
	}
	else if(typeof this.body == 'string') {
		bodyContent = this.body
	}

	if(typeof bodyContent === 'string') {
		bodyElement.insertAdjacentHTML('beforeend', bodyContent)
		afterOpenResizeSetup()
	}
	else if(typeof Promise === 'function' && bodyContent instanceof Promise) {
		bodyContent.then(function(content) {
			bodyElement.insertAdjacentHTML('beforeend', content)
			afterOpenResizeSetup()
		})
	}
	

	return this
}

Dialog.prototype.close = function() {
	let frame = document.querySelector(this.getFrameSelector())
	frame.remove()
	return this
}

module.exports = Dialog



/***/ }),

/***/ "./node_modules/form-value-injector/form-value-injector.js":
/*!*****************************************************************!*\
  !*** ./node_modules/form-value-injector/form-value-injector.js ***!
  \*****************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {


const inputInjector = __webpack_require__(/*! input-value-injector */ "./node_modules/input-value-injector/input-value-injector.js")
const textareaInjector = __webpack_require__(/*! textarea-value-injector */ "./node_modules/textarea-value-injector/textarea-value-injector.js")
const selectInjector = __webpack_require__(/*! select-value-injector */ "./node_modules/select-value-injector/select-value-injector.js")

let injectValues = function(text, values) {
	
	let result = inputInjector(text, values)
	result = textareaInjector(result, values)
	result = selectInjector(result, values)
	
	
	return result
}

module.exports = injectValues

/***/ }),

/***/ "./node_modules/input-value-injector/input-value-injector.js":
/*!*******************************************************************!*\
  !*** ./node_modules/input-value-injector/input-value-injector.js ***!
  \*******************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
	evalFunction
	, attributeEscapes
	, fetchValue
	, isOrContains
	, escForRegex
	, escapeAttributeValue
} = __webpack_require__(/*! value-injector-common */ "./node_modules/value-injector-common/value-injector-common.js")


function makeDate(date) {
	if(date instanceof Date) {
		return date
	}
	return new Date(date)
}

function pad(value, len, pad) {
	value = '' + value
	while(value.length < len) {
		value = pad + value
	}
	return value
}

function formatDate(date) {
	date = makeDate(date)
	let year = date.getFullYear()
	let month = pad(date.getMonth() + 1, 2, '0')
	let day = pad(date.getDate(), 2, '0')

	return `${year}-${month}-${day}`
}
function formatTime(date) {
	date = makeDate(date)
	let hour = pad(date.getHours(), 2, '0')
	let minute = pad(date.getMinutes(), 2, '0')
	let sec = pad(date.getSeconds(), 2, '0')
	let milli = pad(date.getMilliseconds(), 4, '0')
	return `${hour}:${minute}`
}

function formatCombined(date) {
	return formatDate(date) + 'T' + formatTime(date)
}

let nameAttrPattern = /\sname=["'](.*?)["']/i
let valAttrPattern = /\svalue=["'](.*?)["']/i
let typeAttrPattern = /\stype=["'](.*?)["']/i
let inputPattern = /(<input.*?>)/i
let checkedAttrPattern = /\schecked(=["'](.*?)["'])?/i


let injectValues = function(text, values) {
	
	let result = ''
	
	text.split(inputPattern).forEach((item) => {
		if(item.toLowerCase().indexOf('<input') == 0) {
			let r = item.match(nameAttrPattern)
			let name = r ? r[1] : null
			
			r = item.match(typeAttrPattern)
			let type = (r ? r[1] : 'text').toLowerCase()
			
			
			if(type === 'text' || type === 'hidden' || type === 'date' || type === 'time' || type === 'datetime-local'
			|| type === 'search' || type === 'email' || type === 'number' || type === 'tel' || type === 'url' 
			|| type === 'month' || type === 'week' || type === 'color' || type === 'week'
			) {
				r = item.match(valAttrPattern)
				let value = r ? r[1] : null
				
				let newVal = fetchValue(values, name)
				if(type === 'date') {
					if(newVal) {
						let orgValue = newVal
						try {
							newVal = formatDate(newVal)
						} catch(e) {
							newVal = orgValue
						}
						if(newVal == 'Invalid date') {
							newVal = orgValue
						}
					}
				}
				else if(type === 'time') {
					if(newVal) {
						let orgValue = newVal
						try {
							newVal = formatTime(newVal)
						} catch(e) {
							newVal = orgValue
						}
						if(newVal == 'Invalid date') {
							newVal = orgValue
						}
					}
				}
				else if(type === 'datetime-local') {
					if(newVal) {
						let orgValue = newVal
						try {
							newVal = formatCombined(newValue)
						} catch(e) {}
						if(newVal == 'Invalid date') {
							newVal = orgValue
						}
					}
				}
				
				let replacementText
				if(newVal === null || newVal === undefined) {
					replacementText = ''
				}
				else {
					newVal = escapeAttributeValue(newVal)
					replacementText = ' value="' + newVal + '"'
				}


				if(value != null) {
					if(newVal != null) {
						item = item.replace(valAttrPattern, replacementText)
					}
				}
				else {
					if(item.endsWith('/>')) {
						item = item.slice(0, -2)
					}
					else {
						item = item.slice(0, -1)
					}
					item = item + replacementText + ' />'
				}
				
				result += item
			}
			else if(type === 'radio') {
				r = item.match(valAttrPattern)
				let value = r ? r[1] : null
				let newVal = fetchValue(values, name)
				
				if(!value) {
					// We don't have a specific value, so we'll say it's checked
					// if the new value is truthy.
					
					if(!newVal || newVal == 'false' || newVal == 'off') {
						item = item.replace(checkedAttrPattern, '')
					}
					else {
						// so we should have it checked
						if(!item.match(checkedAttrPattern)) {
							if(item.endsWith('/>')) {
								item = item.slice(0, -2)
							}
							else {
								item = item.slice(0, -1)
							}
							item = item + ' checked="checked" />'  
						}
						// if the above were not true, it's because it's already checked
					}
				}
				else {
					if(!newVal || newVal != value) {
						// if the new value is blank or does not equal the value in
						// in the value attribute, we'll make it unchecked
						item = item.replace(checkedAttrPattern, '')
					}
					else {
						// so we should have it checked
						if(!item.match(checkedAttrPattern)) {
							if(item.endsWith('/>')) {
								item = item.slice(0, -2)
							}
							else {
								item = item.slice(0, -1)
							}
							item = item + ' checked="checked" />'  
						}
						// if the above were not true, it's because it's already checked
					}
				}
				
				result += item
			}
			else if(type === 'checkbox') {
				r = item.match(valAttrPattern)
				let value = r ? r[1] : null
				let newVal = fetchValue(values, name)
				
				if(!value) {
					// We don't have a specific value, so we'll say it's checked
					// if the new value is truthy.
					
					if(!newVal || isOrContains('false', newVal) || isOrContains('off', newVal)) {
						item = item.replace(checkedAttrPattern, '')
					}
					else {
						// so we should have it checked
						if(!item.match(checkedAttrPattern)) {
							if(item.endsWith('/>')) {
								item = item.slice(0, -2)
							}
							else {
								item = item.slice(0, -1)
							}
							item = item + ' checked="checked" />'  
						}
						// if the above were not true, it's because it's already checked
					}
				}
				else {
					if(!newVal || !isOrContains(value, newVal)) {
						// if the new value is blank or does not equal the value in
						// in the value attribute, we'll make it unchecked
						item = item.replace(checkedAttrPattern, '')
					}
					else {
						// so we should have it checked
						if(!item.match(checkedAttrPattern)) {
							if(item.endsWith('/>')) {
								item = item.slice(0, -2)
							}
							else {
								item = item.slice(0, -1)
							}
							item = item + ' checked="checked" />'  
						}
						// if the above were not true, it's because it's already checked
					}
				}
				
				result += item
			}
			else {
				result += item
			}
			
		}
		else {
			result += item
		}
	})
	
	return result
}


module.exports = injectValues


/***/ }),

/***/ "./node_modules/ei-dialog/dialog-styles.txt":
/*!**************************************************!*\
  !*** ./node_modules/ei-dialog/dialog-styles.txt ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (".dialog-frame {\n\tposition: fixed;\n\ttop: 0;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n\tz-index: 11000;\n\topacity: 0;\n\ttransition: opacity .3s;\n\toverflow: hidden;\n\t\n\t\n\tdisplay: grid;\n\tjustify-content: center;\n\talign-content: center;\n\tpadding: 5vh 5%;\n}\n\n.dialog-frame.open {\n\topacity: 1;\n}\n\n.dialog-frame .mask {\n\tposition: absolute;\n\tbox-sizing: border-box;\n\ttop: 0;\n\tbottom: 0;\n\tleft: 0;\n\tright: 0;\n\tbackground-color: #333333;\n\topacity: .7;\n\theight: 100%;\n\tz-index: 0;\n\t\n}\n\n\n.dialog-frame .the-dialog {\n\tposition: relative;\n\tdisplay: inline-block;\n\tz-index: 1;\n\tborder-radius: 5px;\n\tbackground-color: white;\n\toverflow: hidden;\n\ttransform: scale(.84);\n\ttransition: transform 0.262s cubic-bezier(.77,-1.72,.08,1);\n}\n\n.dialog-frame.open .the-dialog {\n\ttransform: scale(1);\n}\n\n.dialog-frame .the-dialog .close {\n\tposition: absolute;\n\ttop: 0px;\n\tright: 0px;\n\tpadding: 8px 10px 10px 10px;\n\tcursor: pointer;\n}\n\n.dialog-frame .the-dialog .head {\n\tborder-bottom: solid #aaaaaa 1px;\n\tline-height: 2em;\n\tpadding: 0 10px;\n}\n\n.dialog-frame .the-dialog .body {\n\tbox-sizing: border-box;\n\tpadding: 20px;\n\toverflow: auto;\n\tmax-height: calc(90vh - 75px);\n}\n\n.dialog-frame .the-dialog .foot {\n\tborder-top: solid #aaaaaa 1px;\n\tpadding: 10px;\n}\n\n.dialog-frame .the-dialog .foot button {\n\tmargin-right: 15px;\n}");

/***/ }),

/***/ "./node_modules/select-value-injector/select-value-injector.js":
/*!*********************************************************************!*\
  !*** ./node_modules/select-value-injector/select-value-injector.js ***!
  \*********************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
	evalFunction
	, attributeEscapes
	, fetchValue
	, isOrContains
	, escForRegex
	, escapeAttributeValue
} = __webpack_require__(/*! value-injector-common */ "./node_modules/value-injector-common/value-injector-common.js")



let nameAttrPattern = /\sname=["'](.*?)["']/i
let valAttrPattern = /\svalue=["'](.*?)["']/i
let typeAttrPattern = /\stype=["'](.*?)["']/i
let selectPattern = /(<select[\w\W]*?select\w*>)/im
let selectedAttrPattern = /\sselected(=["'](.*?)["'])?/i


let injectValues = function(text, values) {
	
	let result = ''
	
	text.split(selectPattern).forEach((item) => {
		if(item.toLowerCase().indexOf('<select') == 0) {
			let r = item.match(nameAttrPattern)
			let name = r ? r[1] : null
			
			let newVal = fetchValue(values, name)
			if(typeof newVal != 'undefined' && newVal !== null) {
				item = item.replace(selectedAttrPattern, '')
				let optionMatch = item.match( new RegExp('value=["\']' + escForRegex(newVal) + '["\']', 'i'))
				if(optionMatch) {
					let breakIndex = item.indexOf(optionMatch[0]) + optionMatch[0].length
					item = item.slice(0, breakIndex) + ' selected="selected" ' + item.substring(breakIndex)
				}
			}
			
			result += item
		}
		else {
			result += item
		}
	})
	
	return result
}


module.exports = injectValues


/***/ }),

/***/ "./node_modules/textarea-value-injector/textarea-value-injector.js":
/*!*************************************************************************!*\
  !*** ./node_modules/textarea-value-injector/textarea-value-injector.js ***!
  \*************************************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const {
	evalFunction
	, attributeEscapes
	, fetchValue
	, isOrContains
	, escForRegex
	, escapeAttributeValue
} = __webpack_require__(/*! value-injector-common */ "./node_modules/value-injector-common/value-injector-common.js")


let nameAttrPattern = /\sname=["'](.*?)["']/i
let valAttrPattern = /\svalue=["'](.*?)["']/i
let typeAttrPattern = /\stype=["'](.*?)["']/i
let textareaPattern = /(<textarea[\w\W]*?textarea\w*>)/im
let selectedAttrPattern = /\sselected(=["'](.*?)["'])?/i


let injectValues = function(text, values) {
	
	let result = ''
	
	text.split(textareaPattern).forEach((item) => {
		if(item.toLowerCase().indexOf('<textarea') == 0) {
			let r = item.match(nameAttrPattern)
			let name = r ? r[1] : null
			
			if(name) {
				let newVal = fetchValue(values, name)
				if(typeof newVal != 'undefined' && newVal !== null) {
					let startTagEnd = item.indexOf('>')
					let endTagStart = item.lastIndexOf('<')
					item = item.substring(0, startTagEnd + 1) + newVal + item.substring(endTagStart)
				}
			}
			
			result += item
		}
		else {
			result += item
		}
	})
	
	return result
}


module.exports = injectValues

/***/ }),

/***/ "./node_modules/value-injector-common/value-injector-common.js":
/*!*********************************************************************!*\
  !*** ./node_modules/value-injector-common/value-injector-common.js ***!
  \*********************************************************************/
/***/ ((module) => {


let attributeEscapes = {
	'&': '&amp;'
	, '"': '&quot;'
	, '<': '&lt;'
}

let evalFunction = new Function('data',
	`with (data.context) {
		try {
			return eval(data.expression);
		} catch (e) {
			return null;
		}
	}`
)

function fetchValue(obj, path) {
	if(typeof obj === 'null' || typeof obj === 'undefined') {
		return null
	}
	return evalFunction.call(this, {
		context: obj
		, expression: path
	})
}


function isOrContains(target, possible) {
	if(Array.isArray(possible)) {
		return possible.includes(target)
	}
	else {
		return target == possible
	}
}

function escForRegex(val) {
	if(val && val.replace) {
		return val.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&")
	}
	else {
		return val;
	}
}

function escapeAttributeValue(attr) {
	if(attr === null || attr === undefined) {
		attr = ''
	}
	if(typeof attr !== 'string') {
		attr = '' + attr
	}
	for(let [key, value] of Object.entries(attributeEscapes)) {
		attr = attr.split(key).join(value)
	}
	return attr
}


module.exports = {
	evalFunction
	, attributeEscapes
	, fetchValue
	, isOrContains
	, escForRegex
	, escapeAttributeValue
}


/***/ }),

/***/ "./client-lib/generate-styles.mjs":
/*!****************************************!*\
  !*** ./client-lib/generate-styles.mjs ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ generateStyles)
/* harmony export */ });
function generateStyles() {

return `
<style>
.object-list-view-list {
	padding: 0;
}
.object-list-view-list li {
	display: grid;
	grid-template-columns: auto 1fr;
	column-gap: 30px;
	background-color: #f8f8f8;
	padding: 10px;
	margin-bottom: 10px;
}
.object-list-view-list li .actions a {
	display: block;
	cursor: pointer;
	text-decoration: none;
}
</style>
`
}

/***/ }),

/***/ "./client-lib/index.mjs":
/*!******************************!*\
  !*** ./client-lib/index.mjs ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ObjectListView)
/* harmony export */ });
/* harmony import */ var _webhandle_backbone_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @webhandle/backbone-view */ "./node_modules/@webhandle/backbone-view/client-js/index.js");
/* harmony import */ var _webhandle_drag_sortable_list__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @webhandle/drag-sortable-list */ "./node_modules/@webhandle/drag-sortable-list/client-lib/list-view.mjs");
/* harmony import */ var _webhandle_form_answer_dialog__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @webhandle/form-answer-dialog */ "./node_modules/@webhandle/form-answer-dialog/client-lib/form-answer-dialog.mjs");
/* harmony import */ var _generate_styles_mjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./generate-styles.mjs */ "./client-lib/generate-styles.mjs");
/* harmony import */ var _render_tile_mjs__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./render-tile.mjs */ "./client-lib/render-tile.mjs");







class ObjectListView extends _webhandle_backbone_view__WEBPACK_IMPORTED_MODULE_0__.View {
	constructor(options) {
		super(options)
		this.listClass = options.listClass || 'object-list-view-list'
		this.listItemClass = options.listItemClass || 'tile'
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
		if (this.renderStyles) {
			content += this.generateStyles()
		}
		
		content += this.generateButtonRow(this.additionalButtonRowClasses)

		content += `<ul class="${this.listClass}">`
		for (let dat of (await this.getData())) {
			content += this.renderTile(dat)
		}
		content += '</ul>'
		
		content += this.generateButtonRow()
		
		this.el.innerHTML = content

		let elList = this.el.querySelector('ul')
		let itemsList = new _webhandle_drag_sortable_list__WEBPACK_IMPORTED_MODULE_1__["default"]({
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
		if(answer) {
			selected.closest('.' + this.listItemClass).remove()
			this.updateData()
		}
	}

	async editClicked(evt, selected) {
		evt.preventDefault()
		let li = selected.closest('.' + this.listItemClass)
		let data = JSON.parse(li.getAttribute(this.dataAttributeName))
		let dialog = new _webhandle_form_answer_dialog__WEBPACK_IMPORTED_MODULE_2__["default"]({
			data: data
			, title: 'Edit'
			, body: this.stringifyEditForm(data)
			, afterOpen: this.afterOpen
		})

		let info = await dialog.open()

		if(info) {
			li.querySelector('.details').innerHTML = this.renderTileDetails(info)	
			li.setAttribute(this.dataAttributeName, JSON.stringify(info))
			this.updateData()
		}
	}

	async addClicked(evt, selected) {
		evt.preventDefault()
		let dialog = new _webhandle_form_answer_dialog__WEBPACK_IMPORTED_MODULE_2__["default"]({
			title: 'Add'
			, body: this.stringifyEditForm()
			, afterOpen: this.afterOpen
		})

		let info = await dialog.open()
		
		if(info) {
			let html = this.renderTile(info)
			let ul = this.el.querySelector('.' + this.listClass)
			ul.insertAdjacentHTML('beforeend', html)
			this.updateData()
		}
	}
	
	stringifyEditForm(data) {
		if(typeof this.renderEditForm === 'string') {
			return this.renderEditForm
		}
		return this.renderEditForm(data)
	}
}

ObjectListView.prototype.generateStyles = _generate_styles_mjs__WEBPACK_IMPORTED_MODULE_3__["default"]
ObjectListView.prototype.renderTile = _render_tile_mjs__WEBPACK_IMPORTED_MODULE_4__["default"]


/***/ }),

/***/ "./client-lib/render-tile.mjs":
/*!************************************!*\
  !*** ./client-lib/render-tile.mjs ***!
  \************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ renderTile)
/* harmony export */ });
/* harmony import */ var _dankolz_escape_html_attribute_value__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @dankolz/escape-html-attribute-value */ "./node_modules/@dankolz/escape-html-attribute-value/index.js");


function renderTile(data) {

return `<li class="${this.listItemClass || 'tile'}"  data-serialized="${_dankolz_escape_html_attribute_value__WEBPACK_IMPORTED_MODULE_0__(JSON.stringify(data))}" draggable="true" style="touch-action: none;">
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

/***/ }),

/***/ "./node_modules/@webhandle/backbone-view/client-js/event-entry-mapper.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@webhandle/backbone-view/client-js/event-entry-mapper.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ eventEntryMapper)
/* harmony export */ });
function eventEntryMapper([key, value]) {
	key = key.trim()
	let parts = key.split(' ')
	let event = parts.shift().trim()
	let selector = parts.join(' ').trim()
	
	if(typeof value === 'string') {
		value = value.trim()
	}	
	
	return {
		event: event,
		selector: selector,
		handler: value
	}
}

/***/ }),

/***/ "./node_modules/@webhandle/backbone-view/client-js/extract-event-names.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@webhandle/backbone-view/client-js/extract-event-names.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ extractEventNames)
/* harmony export */ });
function extractEventNames(eventTriggers) {
	let eventNames = Array.from(eventTriggers.reduce((acc, trigger) => {
		acc.add(trigger.event)
		return acc
	}, new Set()))
	return eventNames
}

/***/ }),

/***/ "./node_modules/@webhandle/backbone-view/client-js/generate-id.js":
/*!************************************************************************!*\
  !*** ./node_modules/@webhandle/backbone-view/client-js/generate-id.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ generateId)
/* harmony export */ });
/**
 * Generates a random string id in the browser. Will probably not work
 * on the server.
 * @returns A base64 web url safe string
 */
function generateId() {
	let array = new Uint8Array(32)
	window.crypto.getRandomValues(array)
	let value = btoa(array)
	value = value.replace(/\//g, "_").replace(/\+/g, "-").replace(/=+$/, "")
	return value
}

/***/ }),

/***/ "./node_modules/@webhandle/backbone-view/client-js/index.js":
/*!******************************************************************!*\
  !*** ./node_modules/@webhandle/backbone-view/client-js/index.js ***!
  \******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   View: () => (/* reexport safe */ _view_js__WEBPACK_IMPORTED_MODULE_0__.View)
/* harmony export */ });
/* harmony import */ var _view_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./view.js */ "./node_modules/@webhandle/backbone-view/client-js/view.js");




/***/ }),

/***/ "./node_modules/@webhandle/backbone-view/client-js/view.js":
/*!*****************************************************************!*\
  !*** ./node_modules/@webhandle/backbone-view/client-js/view.js ***!
  \*****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   View: () => (/* binding */ View)
/* harmony export */ });
/* harmony import */ var _generate_id_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./generate-id.js */ "./node_modules/@webhandle/backbone-view/client-js/generate-id.js");
/* harmony import */ var _event_entry_mapper_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-entry-mapper.js */ "./node_modules/@webhandle/backbone-view/client-js/event-entry-mapper.js");
/* harmony import */ var _extract_event_names_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./extract-event-names.js */ "./node_modules/@webhandle/backbone-view/client-js/extract-event-names.js");

// import pick from "./pick.js"



let defaultOptions = {
	// The default `tagName` of a View's element is `"div"`.
	tagName: 'div'
	
	, events: {}

}
let viewOptions = ['model', 'el', 'id', 'attributes', 'className', 'tagName', 'events'];

/**
 * A way to connect data to be displayed, a way to display it, and an organization
 * of functions to handle events.
 */
class View {
	constructor(options) {
		this.id = (0,_generate_id_js__WEBPACK_IMPORTED_MODULE_0__["default"])()
		Object.assign(this, defaultOptions)
		this.preinitialize.apply(this, arguments);
		Object.assign(this, options)
		this._ensureElement()
		this.initialize.apply(this, arguments);
	}


	/**
	 * preinitialize is an empty function by default. You can override it with a function
	 * or object.  preinitialize will run before any instantiation logic is run in the View
	 */
	preinitialize() { }

	/**
	 * Initialize is an empty function by default. Override it with your own
	 * initialization logic.
	 */
	initialize() { }

	/**
	 * **render** is the core function that your view should override, in order
	 * to populate its element (`this.el`), with the appropriate HTML. The
	 * convention is for **render** to always return `this`.
	 * @returns this
	 */
	render() {
		return this
	}
	
	/**
	 * Removes the element from the dom. Does not disable event listeners
	 */
	remove() {
		this.el.parentElement.removeChild(this.el)
	}
	
	/**
	 * Adds this view as a child to a containing element. Nothing special is going on here.
	 * This is just a shortcut for container.appendChild
	 * @param {Element} container 
	 */
	appendTo(container) {
		container.appendChild(this.el)
	}

	/**
	 * Clears the contents of the container and adds this view.
	 * @param {Element} container 
	 */
	replaceContentsOf(container) {
		container.innerHTML = ''
		this.appendTo(container)
	}

	/**
	 * Set the element for this view, and if new, adds listeners to it in accordance
	 * with the "events" member.
	 * @param {Element} el The dom element which will be the root of this view
	 * @returns this
	 */
	setElement(el) {
		if (this.el !== el) {
			this.el = el
			this._addListeners()
		}
		return this
	}

	/**
	 * Produces a DOM element to be assigned to your view. Exposed for
	 * subclasses using an alternative DOM manipulation API.
	 * @param {string} name The element tag name
	 * @returns The dom element
	 */
	_createElement(name) {
		let el = document.createElement(name)
		el.setAttribute('id', this.id)
		el.view = this
		return el
	}

	/**
	 * Ensures that the element exists. Applies attributes and className
	 * to it regardless
	 */
	_ensureElement() {
		if (!this.el) {
			this.setElement(this._createElement(this.tagName))
		}
		else {
			this._addListeners()
		}
		this._setAttributes()
		if (this.className) {
			this.el.classList.add(this.className)
		}
	}

	/**
	 * Set attributes from a hash on this view's element.  Exposed for
	 * subclasses using an alternative DOM manipulation API.
	 * @param {object} attributes 
	 */
	_setAttributes(attributes) {
		if (this.attributes) {
			for (let [key, value] of Object.entries(this.attributes)) {
				this.el.setAttribute(key, value)
			}
		}
	}

	/**
	 * 
	 * Set callbacks, where `this.events` is a hash of
	 * *{"event selector": "callback"}*
	 *
	 *    {
	 *       'mousedown .title':  'edit',
	 *       'click .button':     'save',
	 *       'click .open':       function(e) { ... },
	 *       'keydown .':     	  'handleKey'
	 *    }
	 * pairs. Callbacks will be bound to the view, with `this` set properly.
	 * 
	 * 
	 * Note that the selector `.` will match the root element and can be used
	 * as a final chance to handle events or for events like an escape key
	 * which are essentially global to the widget.
	 * 
	 */
	_addListeners() {
		this.eventTriggers = Object.entries(this.events).map(_event_entry_mapper_js__WEBPACK_IMPORTED_MODULE_1__["default"])
		let eventNames = (0,_extract_event_names_js__WEBPACK_IMPORTED_MODULE_2__["default"])(this.eventTriggers)		

		for(let eventName of eventNames) {
			this.el.addEventListener(eventName, this._eventHandler.bind(this))
		}
	}
	
	/**
	 * Get the elements from the view which match the selector
	 * @param {string} selector A css selector. `.` will select the root element
	 * @returns An array of elements
	 */
	_getCandidates(selector) {
		if(selector === '.') {
			return [this.el]
		}
		return Array.from(this.el.querySelectorAll(selector))
	}
	
	/**
	 * Handles all events for all elements within the view. It attempts to find a
	 * trigger matching the event and then process it. It will match and invoke
	 * only one trigger.
	 * @param {Event} evt 
	 */
	_eventHandler(evt) {
		for(let trigger of this.eventTriggers) {
			if(evt.type == trigger.event) {
				let candidates = this._getCandidates(trigger.selector)
				let found = null
				for(let candidate of candidates) {
					if(candidate === evt.target || candidate.contains(evt.target)) {
						found = candidate
						break
					}
				}
				if(found) {
					if(typeof trigger.handler === 'string') {
						this[trigger.handler].call(this, evt, found)
					}	
					else if(typeof trigger.handler === 'function') {
						trigger.handler.call(this, evt, found)
					}
					break
				}
			}
		}
	}
}


/***/ }),

/***/ "./node_modules/@webhandle/drag-sortable-list/client-lib/data-item-worker.mjs":
/*!************************************************************************************!*\
  !*** ./node_modules/@webhandle/drag-sortable-list/client-lib/data-item-worker.mjs ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ DataItemWorker)
/* harmony export */ });

class DataItemWorker {

	async getFileFromEntry(entry) {
		let p = new Promise(async (resolve, reject) => {
			try {
				if (entry.file) {
					entry.file(file => {
						file.entry = entry
						resolve(file)
					}, (err) => {
						console.error(err)
						resolve(null)
					})
				}
				else {
					resolve(null)
				}
			}
			catch (e) {
				console.error(e)
				resolve(null)
			}
		})
		return p
	}

	async readDirectoryEntries(entry) {
		let p = new Promise((resolve, reject) => {
			let dirReader = entry.createReader()
			let result = []
			let readThem = () => {
				dirReader.readEntries(async (entries) => {
					try {
						if(entries && entries.length > 0) {
							for (let entry of entries) {
								result.push(entry)
							}
							readThem()
						}
						else {
							resolve(result)
						}
					}
					catch (e) {
						console.error(e)
						resolve(result)
					}
				})
			}
			readThem()
		})
		return p
	}

	/**
	 * 
	 * Takes a list of DataTransferItems and resolves them to FileEntry objects.
	 * 
	 * Note, you can get a real File object by calling `getFileFromEntry`
	 * @param {array[DataTransferItem|File|FileEntry|DirectoryEntry]} entries 
	 * @param {*} [options]
	 * @returns 
	 */
	async expandEntries(entries, options) {
		options = Object.assign({
			keepDirectories: false
			, recursive: true
		}, options)
		let expanded = []
		let target = [...entries]	
		
		while(target.length > 0) {
			
			// You MUST process all of the DataTransferItems first. If you do a directory read
			// it will blank out the information on those items.
			let item = target.shift()
			
			if(item instanceof File) {
				expanded.push(item)
			}
			else if(item.isFile === true && item.isDirectory === false) {
				expanded.push(item)
			}
			else if(item.isFile === false && item.isDirectory === true) {
				let dirEntries = await this.readDirectoryEntries(item)
				if(options.recursive) {
					target.push(...dirEntries)
				}
				else {
					if(!options.keepDirectories) {
						dirEntries = dirEntries.filter(item => item.isFile)
					}
					expanded.push(...dirEntries)
				}
				if(options.keepDirectories) {
					expanded.push(item)
				}
			}
			else if (item.kind === "file") {
				if (item.webkitGetAsEntry) {
					let entry = item.webkitGetAsEntry()
					if (entry) {
						target.push(entry)
					}
				}
				else if(item.getAsFile) {
					target.push(item.getAsFile())
				}
			}
		}
		
		expanded = expanded.filter(item => !!item)
		return expanded
	}

	/**
	 * A utility function to extract the file entries from a file drop event.
	 * @param {Event} evt 
	 * @returns 
	 */
	async getFileEntriesFromEvent(evt, options) {
		let entries = []
		// items is the new interface we should use if that's available
		if (evt.dataTransfer.items) {
			entries.push(...evt.dataTransfer.items)
		} 
		else if(evt.dataTransfer.files) {
			entries.push(...evt.dataTransfer.files)
		}
		let result = await this.expandEntries(entries, options)
		return result.filter(item => !!item)
	}


}

/***/ }),

/***/ "./node_modules/@webhandle/drag-sortable-list/client-lib/list-view.mjs":
/*!*****************************************************************************!*\
  !*** ./node_modules/@webhandle/drag-sortable-list/client-lib/list-view.mjs ***!
  \*****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ ListView)
/* harmony export */ });
/* harmony import */ var _webhandle_backbone_view__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @webhandle/backbone-view */ "./node_modules/@webhandle/backbone-view/client-js/index.js");
/* harmony import */ var _webhandle_minimal_browser_event_emitter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @webhandle/minimal-browser-event-emitter */ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/index.js");
/* harmony import */ var _data_item_worker_mjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./data-item-worker.mjs */ "./node_modules/@webhandle/drag-sortable-list/client-lib/data-item-worker.mjs");




let dataItemWorker = new _data_item_worker_mjs__WEBPACK_IMPORTED_MODULE_2__["default"]()

class ListView extends _webhandle_backbone_view__WEBPACK_IMPORTED_MODULE_0__.View {

	/**
	 * Setup the event listners and default objects.
	 * @param {Object} options 
	 */
	preinitialize(options = {}) {
		this.desktopHandleSelector = options.desktopHandleSelector
		this.mobileHandleSelector = options.mobileHandleSelector || '.handle'
		this.events = Object.assign({}, {
			'drop .': 'handleDrop'
			, 'dragend .': 'handleDragEnd'
			, 'dragleave .': 'handleDragLeave'
			, 'dragover .': 'handleDragover'
			, 'dragenter .': 'dragEnter'
			, 'dragover *': 'dragEnterCell'
			, 'dragstart *': 'dragStart'
			, ['touchstart ' + this.mobileHandleSelector]: 'touchDrag'
			, ['touchmove ' + this.mobileHandleSelector]: 'touchMove'
			, ['touchend ' + this.mobileHandleSelector]: 'touchEnd'
			, ['touchcancel ' + this.mobileHandleSelector]: 'touchCancel'
		}, options.events)
		this.placeholderName = options.placeholderName || 'New Item'
		options.events = this.events
		if (!this.emitter) {
			this.emitter = new _webhandle_minimal_browser_event_emitter__WEBPACK_IMPORTED_MODULE_1__["default"]()
		}
		this.overscrollCaptures = {}
	}

	/**
	 * Returns true if a file is being dragged into the list.
	 * @param {Event} evt 
	 * @returns 
	 */
	isFileTypeDrag(evt) {
		if (evt.dataTransfer && evt.dataTransfer.item && evt.dataTransfer.item.length > 0) {
			if (evt.dataTransfer.items[0].kind === 'file') {
				return true
			}
		}
		if (evt.dataTransfer && evt.dataTransfer.types) {
			for (let type of evt.dataTransfer.types) {
				if (type.toLowerCase() == 'files') {
					return true
				}
			}
		}

		return false
	}

	/**
	 * Looks to see if there's a resource label and we should therefore consider this an
	 * external resource object that's being dragged into the list.
	 * @param {Event} evt 
	 * @returns 
	 */
	isResourceTypeDrag(evt) {
		return !!this.extractLabel(evt)
	}

	/**
	 * Watches for entry of dragging into a cell so we can tell of the user is still
	 * performing a drag operation.
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	dragEnterCell(evt, selected) {
		this.canCancel = false
	}

	/**
	 * Watch for the end of dragging for one of the existing cells. This is the cleanup
	 * for the case where a user is dragging and then presses escape.
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	handleDragEnd(evt, selected) {
		this.cleanupDrag()
	}

	/**
	 * Watches for the mouse leaving the list area. The spec has no good way to tell if the user
	 * has stopped dragging within our control area, so here we're doing a little dance to watch
	 * when the user leaves any of the top level elements and then perform a cancel if we don't
	 * see another drag event within a few milliseconds.
	 * 
	 * This does sometimes lead to false positives, but that's generally okay since the code just
	 * interprets the next drag event as if the user just started their drag, so it recovers 
	 * fairly well.
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	handleDragLeave(evt, selected) {
		if (this.externalDrag) {
			if (evt.target == this.el || this.getCells().includes(evt.target)) {
				// so we're leaving the whole list. If we don't immediately enter someplace else
				// then we should interpret this as a cancel
				// In this case, "the whole list" is one of the cells or the container
				this.canCancel = true
				setTimeout(() => {
					if (this.canCancel) {
						this.cleanupDrag()
					}
				}, 20)
			}
		}
	}

	/**
	 * Returns true if this is a type of object from outside the list that can be added
	 * to the list. By default it allows files and uri-list types. To turn off the abilty
	 * to drag other items into the list, just override to return false.
	 * @param {Event} evt 
	 * @returns 
	 */
	shouldInsertCellForExternalDrag(evt) {
		return this.isFileTypeDrag(evt) || this.isResourceTypeDrag(evt)
	}


	/**
	 * This is the mobile/touch equivalent of dragStart
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	touchDrag(evt, selected) {
		this.captureOverscroll('html')
		this.captureOverscroll('body')
		this.dragStart(evt, selected)
	}

	/**
	 * Handle the user touch dragging an item.
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	touchMove(evt, selected) {
		let top = this.boxTop()
		let pos = Math.max(0, evt.touches[0].pageY) - top
		this.positionOnDrag(pos)
	}

	/**
	 * This is essentially a mobile/touch drop
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	touchEnd(evt, selected) {
		this.handleDrop(evt, selected)
	}

	/**
	 * Cleanup after a mobile drag
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	touchCancel(evt, selected) {
		this.cleanupDrag()
	}

	/**
	 * Listens for the element being dragged. The spec seems to indicate that this is
	 * fired on mobile as well, but in practice is seems to only get fired on 
	 * desktop.
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	dragStart(evt, selected) {
		this.dragging = this.getCellFromChild(selected)
		this.dragging.classList.add('dragging')
		if (evt.dataTransfer) {
			evt.dataTransfer.setDragImage(document.createElement('div'), 0, 0)
		}
	}

	/**
	 * Extracts a placeholder label from the data transfer types. The label name is
	 * part of the type name. So, a type of `data:text/label,awesome` would indicate
	 * that the placeholder is supposed to be `awesome`.
	 * @param {Event} evt 
	 * @returns 
	 */
	extractLabel(evt) {
		let labelPrefix = 'data:text/label,'
		for (let type of evt.dataTransfer.types) {
			if (type.indexOf(labelPrefix) == 0) {
				return type.substring(labelPrefix.length)
			}
		}

		return null
	}

	/**
	 * Restores the elements previous overscroll behavior (see captureOverscroll for why we need
	 * this)
	 * @param {string} elName 
	 */
	restoreOverscroll(elName) {
		if (elName in this.overscrollCaptures) {
			document.querySelector(elName).style['overscroll-behavior'] = this.overscrollCaptures[elName]
			delete this.overscrollCaptures[elName]
		}
	}

	/**
	 * Used for mobile to get the present value of what happens when the user drags their finger
	 * farther than the screen can scroll. By default what happens is a page reload. That won't 
	 * be what we want if a user is dragging a list item, so we have to capture that behavior and
	 * change it so that nothing happens to the page.
	 * @param {string} elName 
	 */
	captureOverscroll(elName) {
		let el = document.querySelector(elName)
		this.overscrollCaptures[elName] = el.style['overscroll-behavior']
		el.style['overscroll-behavior'] = 'none'
	}

	/**
	 * Utility function to create a dom node based on html
	 * @param {string} html 
	 * @returns 
	 */
	_makeElementFromHTML(html) {
		let div = document.createElement('div')
		div.innerHTML = html
		let child = div.children[0]
		return child
	}


	/**
	 * Creates markup for the external drag event placeholder cell. Attempts
	 * to determine a reasonable label.
	 * @param {Event} evt 
	 * @returns 
	 */
	createExternalDragPlaceholderHTML(evt) {
		let placeholder = this.extractLabel(evt) || this.placeholderName
		let html = `<div class="cell">
			<span class="handle">↕</span>
			${placeholder}
		</div>`
		return html

	}

	/**
	 * Creates a placeholder cell for a drag event where the source is an
	 * external object like a file or something else on the page.
	 * @param {Event} evt 
	 */
	createExternalDragPlaceholderCell(evt) {
		let html = this.createExternalDragPlaceholderHTML(evt)
		let cell = this._makeElementFromHTML(html)
		cell.setAttribute('draggable', true)
		this.addCell(cell)
		this.dragStart(evt, cell)
	}

	dragEnter(evt, selected) {
		if (!this.dragging && this.shouldInsertCellForExternalDrag(evt)) {
			// If we're not already doing a drag operation, we need to start one
			// We create a placeholder for this event and then move it up and down
			// like a pre-existing cell. 
			// NOTE: We do not have much information about the contents of the
			// drag until the drop event occurs. This placeholder may have to be
			// somewhat generic.
			this.externalDrag = true
			this.createExternalDragPlaceholderCell(evt)
		}
	}

	/**
	 * Watch for movement of something being dragged
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	handleDragover(evt, selected) {
		evt.preventDefault()
		this.canCancel = false
		let top = this.boxTop()
		let pos = evt.y - top

		if (this.dragging) {
			if (evt.dataTransfer) {
				evt.dataTransfer.dropEffect = 'move'
			}
			this.positionOnDrag(pos)
		}
		else {
			if (evt.dataTransfer) {
				evt.dataTransfer.dropEffect = 'copy'
			}
		}
	}

	/**
	 * Creates permanent cells for files dropped into the list
	 * @param {array[FileEntry|File]} files 
	 * @returns an array of Elements
	 */
	createCellsForFiles(files) {
		let cells = files.map(file => {
			let html = `<div class="cell">
				<span class="handle">↕</span>
				${file.name}
			</div>`
			let el = this._makeElementFromHTML(html)
			el.data = file
			return el
		})
		return cells
	}

	/**
	 * Creates permanent cells for resource objects dropped into the list
	 * @param {array[string]} uriList 
	 * @returns an array of Elements
	 */
	createCellsForUriList(uriList) {
		if (!Array.isArray(uriList)) {
			uriList = [uriList]
		}
		let cells = uriList.map(uri => {
			let html = `<div class="cell">
				<span class="handle">↕</span>
				${uri}
			</div>`
			let el = this._makeElementFromHTML(html)
			el.data = uri
			return el
		})
		return cells
	}

	/**
	 * Creates permanent cells for drops of unknown types.
	 * @param {Event} evt 
	 * @returns An array of elements
	 */
	createCellsForUnknownType(evt) {
		return []
	}
	
	isExternalDrop(evt) {
		let uriList
		if (evt.dataTransfer) {
			uriList = evt.dataTransfer.getData('text/uri-list')
		}

		if (this.externalDrag || uriList) {
			return true
		}
		return false
	}
	
	async getFilesEntries(evt) {
		let files = await dataItemWorker.getFileEntriesFromEvent(evt, {
			keepDirectories: false
			, recursive: true
		})
		return files
	}

	/**
	 * Creates permanent cells for external items dropped into the list,
	 * emits events, and does cleaup
	 * @param {Event} evt 
	 * @param {Element} selected 
	 */
	handleDrop(evt, selected) {
		evt.preventDefault()
		
		// Sometimes the placeholder gets cleaned up before the insertion of the new nodes
		// happens. Let's capture the following element just in case we need it.
		let afterDragElement
		if(this.dragging) {
			afterDragElement = this.dragging.nextElementSibling
		}

		let p = new Promise(async (resolve, reject) => {
			if (this.isExternalDrop(evt)) {
				// if a link is dropped, there's no exteralDrag object, just a drop object
				let uriList
				if (evt.dataTransfer) {
					uriList = evt.dataTransfer.getData('text/uri-list')
				}

				let changes = []
				let files = await this.getFilesEntries(evt)
				let cells = []
				if (files && files.length > 0) {
					cells = this.createCellsForFiles(files)
					for (let count = 0; count < cells.length; count++) {
						let cell = cells[count]
						if (!cell.file) {
							cell.file = files[count]
						}
					}
				}
				else if (uriList) {
					if (typeof uriList == 'string') {
						// Acording to the spec, this should be a list with one uri on every line
						// In practice, it seems like the browser is eating the return characters
						// In my tests, I'm passing multiple uris as comma separated. I'm handling
						// both cases here.
						let parts = [uriList]
						for (let sep of ['\r\n', '\n', ',']) {
							let newParts = []
							for (let part of parts) {
								newParts.push(...part.split(sep))
							}
							parts = newParts
						}
						uriList = parts
					}
					cells = this.createCellsForUriList(uriList)
				}
				else {
					cells = this.createCellsForUnknownType(evt)
				}

				for (let cell of cells) {
					cell.setAttribute('draggable', true)
					this.addCell(cell, {
						before: this.dragging || afterDragElement
					})
					changes.push({
						cell: cell
						, file: cell.file
					})
				}
				if (this.dragging) {
					this.dragging.remove()
				}
				this.emitter.emit('list-change', {
					type: 'drop'
					, cells: cells
					, files: files
					, changes: changes
					, event: evt
				})
			}
			else {
				this.emitter.emit('list-change', {
					type: 'reorder'
					, cells: [this.dragging]
				})
			}

		})
		this.cleanupDrag()
		return p
	}

	/**
	 * Adds a new item to the list, last item by default 
	 * @param {string|Element} cell The item to add 
	 * @param {*} [options]
	 * @param {boolean} options.first If true inserted at the start of the list
	 * @param {boolean} options.last If true inserted at the end of the list
	 * @param {Element} options.after Insert after this item 
	 * @param {Element} options.before Insert before this item
	 * @param {*} options.data Data to be set on the element
	 */
	addCell(cell, options = {}) {
		if (typeof cell === 'string') {
			cell = this._makeElementFromHTML(cell)
		}

		if (options.data) {
			cell.data = options.data
		}

		if (options.first) {
			this.el.insertAdjacentElement('afterbegin', cell)
		}
		else if (options.before) {
			this.el.insertBefore(cell, options.before)
		}
		else if (options.after) {
			options.after.after(cell)
		}
		else {
			this.el.insertAdjacentElement('beforeend', cell)
		}
		return cell
	}

	/**
	 * 
	 * @param {int} pos position of pointer relative to the top of the box
	 */
	positionOnDrag(pos) {
		let over = this.findOver(pos)
		this.addCell(this.dragging, {
			before: over
		})
	}

	/**
	 * Gets the top level objects of the list.
	 * @returns 
	 */
	getCells() {
		return [...this.el.children]
	}

	/**
	 * Cleanup after a drag event by deleting any placeholder objects
	 * and restoring the browser to its pre-drag settings
	 */
	cleanupDrag() {
		if (this.dragging && this.externalDrag) {
			this.dragging.remove()
		}

		delete this.dragging
		delete this.externalDrag
		this.getCells().forEach(cell => {
			cell.classList.remove('dragging')
		})
		this.restoreOverscroll('html')
		this.restoreOverscroll('body')
	}

	/**
	 * Determine which cell the pointer/finger is currently over.
	 * @param {Object} pos 
	 * @returns 
	 */
	findOver(pos) {
		let locations = this.findLocations()
		for (let loc of locations) {
			if (pos >= loc.top && pos <= loc.bottom) {
				return loc.cell
			}
		}
	}

	/**
	 * Gets the top of the list box
	 * @returns 
	 */
	boxTop() {
		let boxRect = this.el.getBoundingClientRect()
		let top = boxRect.top
		return top
	}


	/**
	 * Sets up the cells to be draggable and makes the mobile touch handles ready for drag.
	 */
	render() {
		if (this.desktopHandleSelector) {
			this.el.querySelectorAll(this.desktopHandleSelector).forEach(handle => {
				handle.setAttribute("draggable", true)
			})
		}
		else {
			this.getCells().forEach(cell => {
				cell.setAttribute("draggable", true)
			})
		}
		if (this.mobileHandleSelector) {
			this.el.querySelectorAll(this.mobileHandleSelector).forEach(handle => {
				handle.style['touch-action'] = 'none'
			})
		}
	}

	/**
	 * 
	 * @returns The relative locations of the cells in the list
	 */
	findLocations() {
		let top = this.boxTop()

		let locations = []
		this.getCells().forEach(cell => {
			let rect = cell.getBoundingClientRect()
			locations.push({
				top: rect.top - top
				, bottom: rect.bottom - top
				, cell: cell
			})
		})
		return locations
	}

	/**
	 * Give a node for the cell or a descendent of a cell, returns the node
	 * for the cell.
	 * @param {Node} child 
	 * @returns 
	 */
	getCellFromChild(child) {
		if (child.parentElement == this.el) {
			return child
		}
		if (!child) {
			return null
		}
		return this.getCellFromChild(child.parentElement)
	}
}




/***/ }),

/***/ "./node_modules/@webhandle/form-answer-dialog/client-lib/form-answer-dialog.mjs":
/*!**************************************************************************************!*\
  !*** ./node_modules/@webhandle/form-answer-dialog/client-lib/form-answer-dialog.mjs ***!
  \**************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ FormAnswerDialog)
/* harmony export */ });
/* harmony import */ var ei_dialog__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ei-dialog */ "./node_modules/ei-dialog/dialog.js");
/* harmony import */ var form_value_injector__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! form-value-injector */ "./node_modules/form-value-injector/form-value-injector.js");
/* harmony import */ var _webhandle_gather_form_data__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @webhandle/gather-form-data */ "./node_modules/@webhandle/gather-form-data/gather-form-data.mjs");





class FormAnswerDialog extends ei_dialog__WEBPACK_IMPORTED_MODULE_0__ {
	/**
	 * 
	 * @param {Object} options Properties to create the dialog box. In addition to the properties from Dialog
	 * there those below.
	 * @param {Object} options.data The data which will be used to populate the controls in the dialog
	 */
	constructor(options) {
		super(Object.assign({}, options,
			{
				on: {
					'.btn-ok': () => {
						this.resolve(this.gatherData())
						return true
					},
					'.mask': () => {
						this.resolve()
						return true
					},
					'.btn-cancel': () => {
						this.resolve()
						return true
					}
				}

			}
		))
		if (this.afterOpen) {
			this.afterOpenOriginal = this.afterOpen
		}
		this.afterOpen = function (bodyElement, self) {
			if (this.data) {
				bodyElement.innerHTML = form_value_injector__WEBPACK_IMPORTED_MODULE_1__(bodyElement.innerHTML, this.data)
			}
			let firstInput = bodyElement.querySelector('input, textarea')
			if (firstInput) {
				firstInput.focus()
			}

			if (this.afterOpenOriginal) {
				this.afterOpenOriginal(bodyElement, self)
			}
		}
	}
	gatherData() {
		let dialogBody = document.querySelector(this.getBodySelector())
		return (0,_webhandle_gather_form_data__WEBPACK_IMPORTED_MODULE_2__["default"])(dialogBody)
	}

	async open() {
		this.promise = new Promise((resolve, reject) => {
			this.resolve = resolve
			this.reject = reject
		})
		super.open()

		return this.promise
	}

}

/***/ }),

/***/ "./node_modules/@webhandle/gather-form-data/gather-form-data.mjs":
/*!***********************************************************************!*\
  !*** ./node_modules/@webhandle/gather-form-data/gather-form-data.mjs ***!
  \***********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ gatherFormData)
/* harmony export */ });
/**
 * Gathers the data from the form controls.
 * @param {HTMLElement} formBody The html element containing the controls. Probably
 * a form tag element, but it really doesn't matter.
 */
function gatherFormData(formBody) {
	let result = {}
	let controls = formBody.querySelectorAll('input, textarea, select')
	for (let control of controls) {
		if (control.type === 'checkbox') {
			if (!control.checked) {
				continue
			}
		}
		else if (control.type === 'radio') {
			if (!control.checked) {
				continue
			}
		}
		result[control.getAttribute('name')] = control.value
	}
	return result
}



/***/ }),

/***/ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/event-emitter.mjs":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@webhandle/minimal-browser-event-emitter/client-js/event-emitter.mjs ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ EventEmitter)
/* harmony export */ });
/* harmony import */ var _streamish_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./streamish.mjs */ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/streamish.mjs");


/**
 * Add this most basic of the EventEmitter functions (on, emit, removeListener) to the browser's
 * EventTarget functionality.
 * 
 * The eventEmitter.emit() method allows an arbitrary set of arguments to be passed to the listener 
 * functions. Keep in mind that when an ordinary listener function is called, the standard this 
 * keyword is intentionally set to reference the EventEmitter instance to which the listener is attached.
 */
let base = typeof EventTarget === 'undefined' ? _streamish_mjs__WEBPACK_IMPORTED_MODULE_0__["default"] : EventTarget
class EventEmitter extends base {
	constructor(target) {
		super(target)
		if(target) {
			this.innerEventTarget = target
		}
		else {
			this.innerEventTarget = this
		}
	}
	/**
	 * Adds the listener function to the end of the listeners array for the event named eventName. No checks 
	 * are made to see if the listener has already been added. Multiple calls passing the same combination 
	 * of eventName and listener will result in the listener being added, and called, multiple times.
	 * @param {string} eventName The event type name
	 * @param {*} listener The listener function where has arbitrary arguments
	 */
	on(eventName, listener) {
		if(this.innerEventTarget.addEventListener) {
			let nativeListener = (event) => {
				listener.apply(this, event.detail)
			}
			listener.nativeListener = nativeListener
			this.innerEventTarget.addEventListener(eventName, nativeListener)
		}
		else {
			super.on(eventName, listener)
		}
		return this
	}

	/**
	 * Synchronously calls each of the listeners registered for the event named eventName, in the order 
	 * they were registered, passing the supplied arguments to each.
	 * 
	 * @param {string} eventName The event type name
	 * @param  {...any} args 
	 */
	emit(eventName, ...args) {
		if(this.innerEventTarget.dispatchEvent) {
			this.innerEventTarget.dispatchEvent(this._makeEvent(eventName, args))
		}
		else {
			super.emit(eventName, ...args)
		}
		return this
	}

	/**
	 * Removes the specified listener from the listener array for the event named eventName.
	 * @param {string} eventName The event type name
	 * @param {function} listener The listener function
	 */
	removeListener(eventName, listener) {
		if(this.innerEventTarget.removeEventListener) {
			listener = listener.nativeListener || listener
			this.innerEventTarget.removeEventListener(eventName, listener)
		}
		else {
			super.removeListener(eventName, listener)
		}
		return this
	}
	
	_makeEvent(eventName, args) {
		if(typeof CustomEvent === 'function') {
			return new CustomEvent(eventName, {
				detail: args
			})
		}
		else {
			let evt = new Event(eventName)
			evt.detail = args
			return evt
		}
	}
}

/***/ }),

/***/ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/index.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@webhandle/minimal-browser-event-emitter/client-js/index.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _streamish_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./streamish.mjs */ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/streamish.mjs");
/* harmony import */ var _event_emitter_mjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event-emitter.mjs */ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/event-emitter.mjs");
let Emitter
;


if (typeof EventTarget !== 'undefined') {
	Emitter = _event_emitter_mjs__WEBPACK_IMPORTED_MODULE_1__["default"]
}
else {
	Emitter = _streamish_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]
}


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Emitter);

/***/ }),

/***/ "./node_modules/@webhandle/minimal-browser-event-emitter/client-js/streamish.mjs":
/*!***************************************************************************************!*\
  !*** ./node_modules/@webhandle/minimal-browser-event-emitter/client-js/streamish.mjs ***!
  \***************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Streamish)
/* harmony export */ });

class Streamish {
	constructor() {
		this.handles = {}
	}

	on(evt, handle) {
		let handles = this.handles[evt]
		if (!handles) {
			handles = this.handles[evt] = []
		}
		handles.push(handle)
		return this
	}

	emit(evt, ...args) {
		if (evt in this.handles) {
			for (let handle of this.handles[evt]) {
				handle.apply(this, args)
			}
		}
	}

	/**
	 * Removes the specified listener from the listener array for the event named eventName.
	 * @param {string} eventName The event type name
	 * @param {function} listener The listener function
	 */
	removeListener(eventName, listener) {
		if (eventName in this.handles) {
			this.handles[eventName] = this.handles[eventName].filter(func => {
				return func !== listener
			})
		}
	}
}

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*****************************!*\
  !*** ./client-js/pages.mjs ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _client_lib_index_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../client-lib/index.mjs */ "./client-lib/index.mjs");



let inputs = document.querySelectorAll('input[type="hidden"].object-list-view')
for(let input of inputs) {
	let view = new _client_lib_index_mjs__WEBPACK_IMPORTED_MODULE_0__["default"]({
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


})();


//# sourceMappingURL=pages.js.map