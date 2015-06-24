
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





















   

 


   
#### Class canvasUtils





   
    
##### trait textFns

- [_getCtx](README.md#__getCtx)
- [calcObjSizes](README.md#_calcObjSizes)
- [createIteratorFor](README.md#_createIteratorFor)
- [fontStyleString](README.md#_fontStyleString)
- [prepareLines](README.md#_prepareLines)
- [renderPage](README.md#_renderPage)
- [renderText](README.md#_renderText)
- [renderText2](README.md#_renderText2)
- [textLength](README.md#_textLength)
- [txtToObjs](README.md#_txtToObjs)


    
    


   
      
    





   
# Class canvasUtils


The class has following internal singleton variables:
        
        
### canvasUtils::constructor( ctx )

```javascript

```
        


   
    
## trait textFns

The class has following internal singleton variables:
        
* _ctx
        
        
### <a name="__getCtx"></a>::_getCtx(t)


```javascript
if(!_ctx) {
    var can = document.createElement("canvas");
    _ctx = can.getContext("2d");
}
return _ctx;
```

### <a name="_calcObjSizes"></a>::calcObjSizes(page)


```javascript

var iter = this.createIteratorFor( page.words );
var w = null;
while(w = iter.next() ) {
    var len = this.textLength( w.text+" ", page );
    w.w = len;
    w.h = page.fontSize;
}

return page;


```

### <a name="_createIteratorFor"></a>::createIteratorFor(words, startIndex)


```javascript
/*
{
  "words": [
    [
      {
        "text": "a",
        "_i": 0
      },
      {
        "text": "f",
        "_i": 1,
        "_newline": true
      }
    ],
    [
      {
        "text": "d",
        "_i": 0,
        "_newline": true
      }
    ]
  ]
}
*/
var para_i = 0, word_i = 0;
var iteratorObj = {
    start : function() {
        para_i = 0;
        word_i = 0;
    },
    next : function() {
        var para = words[para_i];
        if(!para) return null;
        if(para.length <= word_i ) {
            para_i++;
            word_i = 0;
            return iteratorObj.next();
        } else {
            var i = word_i++;
            return para[i];
        }
    }, 
    prev : function() {
        if(word_i<=0) {
            if(para_i<=0) return null;
            para_i--;
            word_i = words[para_i].length;
            return iteratorObj.prev();
        }
        var para = words[para_i];
        word_i--;
        return para[word_i];
    }
}
return iteratorObj;
```

### <a name="_fontStyleString"></a>::fontStyleString(page)


```javascript

var str = Math.floor( page.fontSize )+"px "+page.fontFamily;  
if(page.italic) str="italic "+str;
if(page.bold) str="bold "+str;

return str;    
```

### <a name="_prepareLines"></a>::prepareLines(page)


```javascript

// Root item...
/*
{
  "words": [
    [
      {
        "text": "a",
        "_i": 0,
        "w" : 34,
        "h" : 13
      },
      {
        "text": "f",
        "_i": 1,
        "_newline": true
      }
    ],
    [
      {
        "text": "d",
        "_i": 0,
        "_newline": true
      }
    ]
  ]
}

// the page attributes used for this object...
{
   lineStep : 11,
   wordStep : 0,
   w : 100,
   h : 100,
   x : 10,   // paddings for the page
   y : 10   
}
*/

// This should be iterating the words through
var iterator = this.createIteratorFor( page.words );

page._lines = [];
page._lineHeight = [];
page._lineCnt = 0;

page._hOverFlow = 0;

var width = page.w, // the document width;
    height = page.h,
    x = 0,
    y = 0,
    me = this,
    lineIndex = 0,
    pageIndex = 0,
    totalW = 0,
    maxH = 0,
    totalH = 0,
    itemsAtLine = 0,
    lineStep = page.lineStep || 4,
    wordStep = page.wordStep || 0;
    
//if(startFrom) lineIndex = startFrom._lineIndex;
//if(!startFrom) startFrom = root.firstChild();
    
var calculateLines = function(startFrom) {
    itemsAtLine = 0;
    totalW = 0;
    lineIndex =  0; // if several pages, this might not be true
    var ch = null;
    
    var pushToLine = function(lineIndex, item, reset) {
        if(!page._lines[lineIndex]) {
            page._lines[lineIndex] = [];
        } else {
            if(reset) page._lines[lineIndex].length = 0; 
        }
        page._lines[lineIndex].push(item);        
    }
    
    while(ch = startFrom.next()) {
        
        if(itemsAtLine==0) {
            if(ch.h > maxH) maxH = ch.h;
            
            pushToLine( lineIndex, ch, true );

            totalW += ch.w + wordStep;
            
            if(totalW > page.w) page._hOverFlow = totalW - page.w;
            
            ch._lineIndex = lineIndex;
            ch._total = totalW;
            page._lineCnt = lineIndex+1;
            itemsAtLine++;
        } else {
            var testW = totalW + ch.w + wordStep;
            if(testW >= width) {
                itemsAtLine = 1;
                lineIndex++;
                pushToLine( lineIndex, ch, true );
                totalW = ch.w + wordStep;     
                if(totalW > page.w) page._hOverFlow = totalW - page.w;
                totalH += maxH;
                ch._total = totalW;
                ch._lineIndex = lineIndex;
                page._lineCnt = lineIndex+1;
            } else {
                totalW += ch.w + wordStep;
                ch._lineIndex = lineIndex;
                ch._total = totalW;
                pushToLine( lineIndex, ch );
                page._lineCnt = lineIndex+1;
                itemsAtLine++;
            }
        }
        if(ch._newline) {
            itemsAtLine = 0;
            lineIndex++;
            totalW = 0;
            totalH += maxH;
        }

    }
    for(var i=0; i<page._lineCnt; i++)
        page._lineHeight[i] = 0;
    
    startFrom.start();
    
     while(ch = startFrom.next()) {
        var i = ch._lineIndex;
        // console.log("Height test ", ch.h());
        if(page._lineHeight[i] < ch.h) {
           page._lineHeight[i] = ch.h;
        }
     }
        
}
calculateLines(iterator);

var tot = 0;
for(var i=0; i<page._lineCnt; i++)
    tot += page._lineHeight[i];
    
tot += ( page.lineStep || 5 ) * page._lineCnt;
// The pagination part is left out from this
return tot;

```

### <a name="_renderPage"></a>::renderPage(page, ctx, useFunctionalCtx)


```javascript
/*
  "fontSize": 16,
  "fontFamily": "Arial",
  "w": 200,
  "h": 100,
  "_lines": [
    [
      {
        "text": "a",
        "_i": 0,
        "w": 13.34375,
        "h": 16,
        "_lineIndex": 0,
        "_total": 13.34375
      },
      {
        "text": "b",
        "_i": 1,
        "_newline": true,
        "w": 13.34375,
        "h": 16,
        "_lineIndex": 0,
        "_total": 26.6875
      }
    ]
  ],
  "_lineHeight": [
    16
  ],
  "_lineCnt": 1
}
*/

var lineCnt = page._lineCnt,
    x = 0,
    y = 0,
    lineStep = 5;
if(page.x) x+=page.x;
if(page.y) x+=page.y;
if(page.lineStep) lineStep = page.lineStep;

var start_x = x;

if(useFunctionalCtx) {
    ctx.textBaseline( 'bottom' );    
    ctx.font( this.fontStyleString(page) );    
} else {
    ctx.textBaseline = 'bottom';    
    ctx.font = this.fontStyleString(page);
}

for(var line_i = 0; line_i < lineCnt ; line_i++) {
    var lineH = page._lineHeight[line_i];
    var line = page._lines[line_i];
    x = start_x;
    var microStep = 0;
    if(page.align=="center") x += (page.w - line[line.length-1]._total)/2;
    if(page.align=="right") x += (page.w - line[line.length-1]._total);
    if(page.align=="fill" && (line.length>1)) microStep = (page.w - line[line.length-1]._total) / ( line.length-1);
    
    if(microStep > page.width*0.2) microStep = 0;
    if(line_i == lineCnt-1) microStep = 0;
    if(line.length > 0 && line[line.length-1]._newline) microStep = 0;
    
    for(var word_i=0; word_i<line.length; word_i++) {
        var ch = line[word_i];
        ctx.fillText(ch.text, x, y + lineH );  
        ctx.strokeText(ch.text, x, y + lineH );  
        x += ch.w + microStep;
    }
    y += page._lineHeight[line_i] + lineStep;
}
 

```

### <a name="_renderText"></a>::renderText(text, page, ctx)


```javascript

var myPage = this.txtToObjs(text, page);
var it = this.calcObjSizes( myPage );

var origFont = page.fontSize;

if(page.fitToPage) {
    var maxCnt = 10, error = 0, step = 4,   
        txtLen = text.length;
    var testHeight = this.prepareLines( myPage );
    var useFontSize = origFont;
    var r = 1;
    
    var fsEstimate = Math.sqrt( page.w*page.h / txtLen );
    if(fsEstimate > page.h) fsEstimate = page.h;
    var me = this;
    var tryWith = function( newSize ) {
        useFontSize = newSize;
        myPage.fontSize = useFontSize;
        me.calcObjSizes( myPage );
        testHeight = me.prepareLines( myPage );
        error = testHeight - page.h;        
    }
    tryWith( fsEstimate );

    while( maxCnt > 0  && ( Math.abs( error )  > 1 ) ) {
        var fsCurr = Math.sqrt( page.w*testHeight / txtLen );
        if(!step) step = Math.abs( fsCurr - fsEstimate );
        if(page.h < testHeight) {
            useFontSize = useFontSize-step*r;
        } else {
            useFontSize = useFontSize+step*r;
        }
        tryWith( useFontSize );
        maxCnt--;
        r = r - 0.04;
    }
    maxCnt = 20;
    while( maxCnt > 0  && ( error >= 0 ) ) {
        useFontSize = useFontSize - 1;
        tryWith( useFontSize );
        maxCnt--;
    }    
    
    if(myPage._hOverFlow) {
        myPage.fontSize = useFontSize * 0.9*( myPage.w / ( myPage.w + myPage._hOverFlow) );
        this.calcObjSizes( myPage );
        testHeight = this.prepareLines( myPage );        
    }
    error = testHeight - page.h;
    
    myPage._autoFontSize = useFontSize;

} else {
    this.prepareLines( myPage );
}
this.renderPage(myPage, ctx);

myPage.fontSize = origFont;
```

### <a name="_renderText2"></a>::renderText2(text, page, ctx)


```javascript
var myPage = this.txtToObjs(text, page);
var it = this.calcObjSizes( myPage );
this.prepareLines( myPage );
this.renderPage(myPage, ctx, true);
```

### <a name="_textLength"></a>::textLength(txt, page)


```javascript
var ctx = this._getCtx();
ctx.font = this.fontStyleString(page);    
return ctx.measureText(txt).width;

```

### <a name="_txtToObjs"></a>::txtToObjs(text, res)


```javascript

// The lines of the text
var lines = text.split("\n");
var prev = null;

if(!res) {
  res = {
    words : []
  }   
}

if(!res.words) res.words = [];
res.words.length=0;

lines.forEach( function(line) {
    var txtList = line.split(" ");
    var lineObs = [], i = 0;
    txtList.forEach( function(txt) {
        var t = txt; // do not trim this time
        if(t.length>0) {
            var o = {
                text : t,
                _i : i++
            };
            lineObs.push(o);
        }
    });
    if(lineObs.length == 0) {
        var o = {
            text : "",
            _i : i++
        };
        lineObs.push(o);        
    }
    if(lineObs.length > 0) {
        lineObs[i-1]._newline = true;
        res.words.push(lineObs);
    } 
});

return res;
```


    
    


   
      
    




