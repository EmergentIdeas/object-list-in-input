export default function generateStyles() {

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