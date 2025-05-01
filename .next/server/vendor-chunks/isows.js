"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/isows";
exports.ids = ["vendor-chunks/isows"];
exports.modules = {

/***/ "(ssr)/./node_modules/isows/_cjs/index.js":
/*!******************************************!*\
  !*** ./node_modules/isows/_cjs/index.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.WebSocket = void 0;\nconst WebSocket_ = __webpack_require__(/*! ws */ \"(ssr)/./node_modules/ws/index.js\");\nconst utils_js_1 = __webpack_require__(/*! ./utils.js */ \"(ssr)/./node_modules/isows/_cjs/utils.js\");\nexports.WebSocket = (() => {\n    try {\n        return (0, utils_js_1.getNativeWebSocket)();\n    }\n    catch {\n        if (WebSocket_.WebSocket)\n            return WebSocket_.WebSocket;\n        return WebSocket_;\n    }\n})();\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXNvd3MvX2Nqcy9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCxpQkFBaUI7QUFDakIsbUJBQW1CLG1CQUFPLENBQUMsNENBQUk7QUFDL0IsbUJBQW1CLG1CQUFPLENBQUMsNERBQVk7QUFDdkMsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIi9Vc2Vycy95b3Vzc2VmZXdpZGEvYnJpY2tiYXNlLWZyb250ZW5kLW5leHRqcy9ub2RlX21vZHVsZXMvaXNvd3MvX2Nqcy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuV2ViU29ja2V0ID0gdm9pZCAwO1xuY29uc3QgV2ViU29ja2V0XyA9IHJlcXVpcmUoXCJ3c1wiKTtcbmNvbnN0IHV0aWxzX2pzXzEgPSByZXF1aXJlKFwiLi91dGlscy5qc1wiKTtcbmV4cG9ydHMuV2ViU29ja2V0ID0gKCgpID0+IHtcbiAgICB0cnkge1xuICAgICAgICByZXR1cm4gKDAsIHV0aWxzX2pzXzEuZ2V0TmF0aXZlV2ViU29ja2V0KSgpO1xuICAgIH1cbiAgICBjYXRjaCB7XG4gICAgICAgIGlmIChXZWJTb2NrZXRfLldlYlNvY2tldClcbiAgICAgICAgICAgIHJldHVybiBXZWJTb2NrZXRfLldlYlNvY2tldDtcbiAgICAgICAgcmV0dXJuIFdlYlNvY2tldF87XG4gICAgfVxufSkoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWluZGV4LmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/isows/_cjs/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/isows/_cjs/utils.js":
/*!******************************************!*\
  !*** ./node_modules/isows/_cjs/utils.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.getNativeWebSocket = void 0;\nfunction getNativeWebSocket() {\n    if (typeof WebSocket !== \"undefined\")\n        return WebSocket;\n    if (typeof global.WebSocket !== \"undefined\")\n        return global.WebSocket;\n    if (typeof window.WebSocket !== \"undefined\")\n        return window.WebSocket;\n    if (typeof self.WebSocket !== \"undefined\")\n        return self.WebSocket;\n    throw new Error(\"`WebSocket` is not supported in this environment\");\n}\nexports.getNativeWebSocket = getNativeWebSocket;\n//# sourceMappingURL=utils.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXNvd3MvX2Nqcy91dGlscy5qcyIsIm1hcHBpbmdzIjoiQUFBYTtBQUNiLDhDQUE2QyxFQUFFLGFBQWEsRUFBQztBQUM3RCwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQjtBQUMxQiIsInNvdXJjZXMiOlsiL1VzZXJzL3lvdXNzZWZld2lkYS9icmlja2Jhc2UtZnJvbnRlbmQtbmV4dGpzL25vZGVfbW9kdWxlcy9pc293cy9fY2pzL3V0aWxzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5nZXROYXRpdmVXZWJTb2NrZXQgPSB2b2lkIDA7XG5mdW5jdGlvbiBnZXROYXRpdmVXZWJTb2NrZXQoKSB7XG4gICAgaWYgKHR5cGVvZiBXZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiBXZWJTb2NrZXQ7XG4gICAgaWYgKHR5cGVvZiBnbG9iYWwuV2ViU29ja2V0ICE9PSBcInVuZGVmaW5lZFwiKVxuICAgICAgICByZXR1cm4gZ2xvYmFsLldlYlNvY2tldDtcbiAgICBpZiAodHlwZW9mIHdpbmRvdy5XZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiB3aW5kb3cuV2ViU29ja2V0O1xuICAgIGlmICh0eXBlb2Ygc2VsZi5XZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiBzZWxmLldlYlNvY2tldDtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJgV2ViU29ja2V0YCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG59XG5leHBvcnRzLmdldE5hdGl2ZVdlYlNvY2tldCA9IGdldE5hdGl2ZVdlYlNvY2tldDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/isows/_cjs/utils.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/isows/_esm/index.js":
/*!******************************************!*\
  !*** ./node_modules/isows/_esm/index.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("var ws__WEBPACK_IMPORTED_MODULE_0___namespace_cache;\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   WebSocket: () => (/* binding */ WebSocket)\n/* harmony export */ });\n/* harmony import */ var ws__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ws */ \"(ssr)/./node_modules/ws/index.js\");\n/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils.js */ \"(ssr)/./node_modules/isows/_esm/utils.js\");\n\n\nconst WebSocket = (() => {\n    try {\n        return (0,_utils_js__WEBPACK_IMPORTED_MODULE_1__.getNativeWebSocket)();\n    }\n    catch {\n        if (ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket)\n            return ws__WEBPACK_IMPORTED_MODULE_0__.WebSocket;\n        return /*#__PURE__*/ (ws__WEBPACK_IMPORTED_MODULE_0___namespace_cache || (ws__WEBPACK_IMPORTED_MODULE_0___namespace_cache = __webpack_require__.t(ws__WEBPACK_IMPORTED_MODULE_0__, 2)));\n    }\n})();\n//# sourceMappingURL=index.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXNvd3MvX2VzbS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQWlDO0FBQ2U7QUFDekM7QUFDUDtBQUNBLGVBQWUsNkRBQWtCO0FBQ2pDO0FBQ0E7QUFDQSxZQUFZLHlDQUFvQjtBQUNoQyxtQkFBbUIseUNBQW9CO0FBQ3ZDLGVBQWUsZ0xBQVU7QUFDekI7QUFDQSxDQUFDO0FBQ0QiLCJzb3VyY2VzIjpbIi9Vc2Vycy95b3Vzc2VmZXdpZGEvYnJpY2tiYXNlLWZyb250ZW5kLW5leHRqcy9ub2RlX21vZHVsZXMvaXNvd3MvX2VzbS9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBXZWJTb2NrZXRfIGZyb20gXCJ3c1wiO1xuaW1wb3J0IHsgZ2V0TmF0aXZlV2ViU29ja2V0IH0gZnJvbSBcIi4vdXRpbHMuanNcIjtcbmV4cG9ydCBjb25zdCBXZWJTb2NrZXQgPSAoKCkgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBnZXROYXRpdmVXZWJTb2NrZXQoKTtcbiAgICB9XG4gICAgY2F0Y2gge1xuICAgICAgICBpZiAoV2ViU29ja2V0Xy5XZWJTb2NrZXQpXG4gICAgICAgICAgICByZXR1cm4gV2ViU29ja2V0Xy5XZWJTb2NrZXQ7XG4gICAgICAgIHJldHVybiBXZWJTb2NrZXRfO1xuICAgIH1cbn0pKCk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1pbmRleC5qcy5tYXAiXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbMF0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/isows/_esm/index.js\n");

/***/ }),

/***/ "(ssr)/./node_modules/isows/_esm/utils.js":
/*!******************************************!*\
  !*** ./node_modules/isows/_esm/utils.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   getNativeWebSocket: () => (/* binding */ getNativeWebSocket)\n/* harmony export */ });\nfunction getNativeWebSocket() {\n    if (typeof WebSocket !== \"undefined\")\n        return WebSocket;\n    if (typeof global.WebSocket !== \"undefined\")\n        return global.WebSocket;\n    if (typeof window.WebSocket !== \"undefined\")\n        return window.WebSocket;\n    if (typeof self.WebSocket !== \"undefined\")\n        return self.WebSocket;\n    throw new Error(\"`WebSocket` is not supported in this environment\");\n}\n//# sourceMappingURL=utils.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvaXNvd3MvX2VzbS91dGlscy5qcyIsIm1hcHBpbmdzIjoiOzs7O0FBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyIvVXNlcnMveW91c3NlZmV3aWRhL2JyaWNrYmFzZS1mcm9udGVuZC1uZXh0anMvbm9kZV9tb2R1bGVzL2lzb3dzL19lc20vdXRpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIGdldE5hdGl2ZVdlYlNvY2tldCgpIHtcbiAgICBpZiAodHlwZW9mIFdlYlNvY2tldCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIFdlYlNvY2tldDtcbiAgICBpZiAodHlwZW9mIGdsb2JhbC5XZWJTb2NrZXQgIT09IFwidW5kZWZpbmVkXCIpXG4gICAgICAgIHJldHVybiBnbG9iYWwuV2ViU29ja2V0O1xuICAgIGlmICh0eXBlb2Ygd2luZG93LldlYlNvY2tldCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5XZWJTb2NrZXQ7XG4gICAgaWYgKHR5cGVvZiBzZWxmLldlYlNvY2tldCAhPT0gXCJ1bmRlZmluZWRcIilcbiAgICAgICAgcmV0dXJuIHNlbGYuV2ViU29ja2V0O1xuICAgIHRocm93IG5ldyBFcnJvcihcImBXZWJTb2NrZXRgIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBlbnZpcm9ubWVudFwiKTtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOlswXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/isows/_esm/utils.js\n");

/***/ })

};
;