
# canvasUtils

Tools for manipulating the HTML 5 Canvas 

## renderText( text, pageDefinition, context)

Supports HTML Canvas word wrapping to box with newlines, aligment modes:

- left
- right
- center
- fill

Step 1: create a page definition
```javascript
var page = {  w : 200, 
              h : 100, 
              align : "right",
              bold : true, // optional
              italic : true, // optional
              fontSize : 48, 
              fitToPage : true, // optional, if set to true, tries to fit to box
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

http://jsfiddle.net/uh1qhpd6/

# Automatically fitting the content

This is experimental feature to fit the content to the container area

http://jsfiddle.net/g0v9m8L8/




