module.exports = {
	fetch: global.fetch || (() => {}),
	Request: global.Request || class {},
	Response: global.Response || class {},
	Headers: global.Headers || class {},
	FormData: global.FormData || class {},
	Blob: global.Blob || class {},
	File: global.File || class {},
}
