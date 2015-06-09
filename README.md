
# canvasUtils

Tools for manipulating the HTML 5 Canvas 

Documentation: TODO.

## renderText( text, pageDefinition, context)

Step 1: create a page definition
```javascript
var page = {  w : 200, 
              h : 100, 
              align : "right",
              fontSize : 48, 
              fontFamily : "Arial" };
```

Step 2: instantiate canvasUtils object

```javascript
var canvTools = canvasUtils();
```

Step 3: render text to context

```javascript
canvTools.renderText("some text", page, context);
```
Where "context" is the HTML5 canvas context.

Example:

http://jsfiddle.net/0ydbba4L/



