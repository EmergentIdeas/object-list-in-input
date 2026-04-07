import createInitializeWebhandleComponent from "@webhandle/initialize-webhandle-component/create-initialize-webhandle-component.mjs"
import ComponentManager from "@webhandle/initialize-webhandle-component/component-manager.mjs"
import path from "node:path"
import setupBackboneView from "@webhandle/backbone-view/initialize-webhandle-component.mjs"
import setupDialog from "@webhandle/dialog/initialize-webhandle-component.mjs"
import setupDragSortableList from "@webhandle/drag-sortable-list/initialize-webhandle-component.mjs"


const initializeWebhandleComponent = createInitializeWebhandleComponent()

initializeWebhandleComponent.componentName = '@webhandle/object-list-in-input'
initializeWebhandleComponent.componentDir = import.meta.dirname
initializeWebhandleComponent.defaultConfig = {
	"publicFilesPrefix": '/' + initializeWebhandleComponent.componentName + "/files"
	, "alwaysProvideResources": false
}
initializeWebhandleComponent.staticFilePath = 'public'
initializeWebhandleComponent.templatePath = 'views'


initializeWebhandleComponent.setup = async function(webhandle, config) {
	let manager = new ComponentManager()
	manager.config = config
	
	let managerBackboneView = setupBackboneView(webhandle)
	let managerDialog = await setupDialog(webhandle)
	let managerDragSortableList = await setupDragSortableList(webhandle)

	webhandle.routers.preDynamic.use((req, res, next) => {
		if(config.alwaysProvideResources || !initializeWebhandleComponent.supportsMultipleImportMaps(req)) {
			manager.addExternalResources(res.locals.externalResourceManager)
		}
		next()
	})
	
	manager.addExternalResources = (externalResourceManager, options) => {
		managerDialog.addExternalResources(externalResourceManager)
		managerDragSortableList.addExternalResources(externalResourceManager)
		externalResourceManager.includeResource({
			mimeType: 'text/css'
			, url: config.publicFilesPrefix + '/css/styles.css'
		})

		externalResourceManager.provideResource({
			url: config.publicFilesPrefix + '/js/index.js'
			, mimeType: 'application/javascript'
			, resourceType: 'module'
			, name: initializeWebhandleComponent.componentName
		})
	}

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/addExternalResources', (data) => {
		let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
		manager.addExternalResources(externalResourceManager)
	})

	webhandle.addTemplate(initializeWebhandleComponent.componentName + '/renderExternalResources', (data) => {
		try {
			let externalResourceManager = initializeWebhandleComponent.getExternalResourceManager(data)
			manager.addExternalResources(externalResourceManager)

			let resources = externalResourceManager.render()
			return resources
		}
		catch(e) {
			console.error(e)
		}
	})

	// Allow access to the component and style code
	let filePath = path.join(initializeWebhandleComponent.componentDir, initializeWebhandleComponent.staticFilePath)
	manager.staticPaths.push(
		webhandle.addStaticDir(
			filePath,
			{
				urlPrefix: config.publicFilesPrefix
				, fixedSetOfFiles: true
			}
		)
	)
	
	webhandle.addTemplateDir(
		path.join(initializeWebhandleComponent.componentDir, initializeWebhandleComponent.templatePath)
		, {
			immutable: !webhandle.development 
		}
	)

	return manager
}

export default initializeWebhandleComponent
