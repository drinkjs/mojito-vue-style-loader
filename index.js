var loaderUtils = require("loader-utils");
var path = require("path");
var hash = require("hash-sum");
var qs = require("querystring");

module.exports = function () {};

module.exports.pitch = function (remainingRequest) {
	var addStylesShadowPath = loaderUtils.stringifyRequest(
		this,
		"!" + path.join(__dirname, "lib/addStylesShadow.js")
	);

	var request = loaderUtils.stringifyRequest(this, "!!" + remainingRequest);
	var relPath = path.relative(__dirname, this.resourcePath).replace(/\\/g, "/");
	var id = JSON.stringify(hash(request + relPath));
	var options = loaderUtils.getOptions(this) || {};

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

	const { flag, event } = options;

	var code = [
		"// add the styles to the DOM",
		"var add = require(" + addStylesShadowPath + ").default",
		`var update = add(${id}, content, "${event}", "${flag}");`,
	];

	return shared.concat(code).join("\n");
};
