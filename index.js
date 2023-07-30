var loaderUtils = require("loader-utils");
var path = require("path");
var hash = require("hash-sum");
var qs = require("querystring");

module.exports = function () {};

module.exports.pitch = function (remainingRequest) {
	var isProduction = this.minimize || process.env.NODE_ENV === "production";
	var addStylesShadowPath = loaderUtils.stringifyRequest(
		this,
		"!" + path.join(__dirname, "lib/addStylesShadow.js")
	);

	var request = loaderUtils.stringifyRequest(this, "!!" + remainingRequest);
	var relPath = path.relative(__dirname, this.resourcePath).replace(/\\/g, "/");
	var id = JSON.stringify(hash(request + relPath));
	var options = loaderUtils.getOptions(this) || {};

	// direct css import from js --> direct, or manually call `styles.__inject__(ssrContext)` with `manualInject` option
	// css import from vue file --> component lifecycle linked
	// style embedded in vue file --> component lifecycle linked
	var isVue =
		/"vue":true/.test(remainingRequest) ||
		options.manualInject ||
		qs.parse(this.resourceQuery.slice(1)).vue != null;

	var shared = [
		"// style-loader: Adds some css to the DOM by adding a <style> tag",
		"",
		"// load the styles",
		"var content = require(" + request + ");",
		// get default export if list is an ES Module (CSS Loader v4+)
		"if(content.__esModule) content = content.default;",
		// content list format is [id, css, media, sourceMap]
		"if(typeof content === 'string') content = [[module.id, content, '']];",
		"if(content.locals) module.exports = content.locals;",
	];

	const { pkg } = options;

	var code = [
		"// add the styles to the DOM",
		"var add = require(" + addStylesShadowPath + ").default",
		`var update = add(${id}, content, "${pkg.name}", "${pkg.version}");`,
	];

	if (!isProduction) {
		code = code.concat([
			"// Hot Module Replacement",
			"if(module.hot) {",
			" // When the styles change, update the <style> tags",
			" if(!content.locals) {",
			"   module.hot.accept(" + request + ", function() {",
			"     var newContent = require(" + request + ");",
			"     if(newContent.__esModule) newContent = newContent.default;",
			"     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];",
			"     update(newContent);",
			"   });",
			" }",
			" // When the module is disposed, remove the <style> tags",
			" module.hot.dispose(function() { update(); });",
			"}",
		]);
	}

	return shared.concat(code).join("\n");
};
