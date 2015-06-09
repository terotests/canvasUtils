var canvasUtils_prototype = function() {
  'use strict';;
  (function(_myTrait_) {
    var _ctx;
    _myTrait_._getCtx = function(t) {

      if (!_ctx) {
        var can = document.createElement("canvas");
        _ctx = can.getContext("2d");
      }
      return _ctx;
    }
    _myTrait_.calcObjSizes = function(page) {

      var iter = this.createIteratorFor(page.words);

      var w = null;

      while (w = iter.next()) {
        var len = this.textLength(w.text + " ", page);
        w.w = len;
        w.h = page.fontSize;
      }

      return page;


    }
    _myTrait_.createIteratorFor = function(words, startIndex) {
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
      var para_i = 0,
        word_i = 0;
      var iteratorObj = {
        start: function() {
          para_i = 0;
          word_i = 0;
        },
        next: function() {
          var para = words[para_i];
          if (!para) return null;
          if (para.length <= word_i) {
            para_i++;
            word_i = 0;
            return iteratorObj.next();
          } else {
            var i = word_i++;
            return para[i];
          }
        },
        prev: function() {
          if (word_i <= 0) {
            if (para_i <= 0) return null;
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
    }
    _myTrait_.fontStyleString = function(page) {

      var str = Math.floor(page.fontSize) + "px " + page.fontFamily;
      if (page.italic) str = "italic " + str;
      if (page.bold) str = "bold " + str;

      return str;
    }
    _myTrait_.prepareLines = function(page) {

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
      var iterator = this.createIteratorFor(page.words);

      page._lines = [];
      page._lineHeight = [];
      page._lineCnt = 0;

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
        lineIndex = 0; // if several pages, this might not be true
        var ch = null;

        var pushToLine = function(lineIndex, item, reset) {
          if (!page._lines[lineIndex]) {
            page._lines[lineIndex] = [];
          } else {
            if (reset) page._lines[lineIndex].length = 0;
          }
          page._lines[lineIndex].push(item);
        }

        while (ch = startFrom.next()) {

          if (itemsAtLine == 0) {
            if (ch.h > maxH) maxH = ch.h;

            pushToLine(lineIndex, ch, true);

            totalW += ch.w + wordStep;
            ch._lineIndex = lineIndex;
            ch._total = totalW;
            page._lineCnt = lineIndex + 1;
            itemsAtLine++;
          } else {
            var testW = totalW + ch.w + wordStep;
            if (testW >= width) {
              itemsAtLine = 1;
              lineIndex++;
              pushToLine(lineIndex, ch, true);
              totalW = ch.w + wordStep;
              totalH += maxH;
              ch._total = totalW;
              ch._lineIndex = lineIndex;
              page._lineCnt = lineIndex + 1;
            } else {
              totalW += ch.w + wordStep;
              ch._lineIndex = lineIndex;
              ch._total = totalW;
              pushToLine(lineIndex, ch);
              page._lineCnt = lineIndex + 1;
              itemsAtLine++;
            }
          }
          if (ch._newline) {
            itemsAtLine = 0;
            lineIndex++;
            totalW = 0;
            totalH += maxH;
          }

        }
        for (var i = 0; i < page._lineCnt; i++)
          page._lineHeight[i] = 0;

        startFrom.start();

        while (ch = startFrom.next()) {
          var i = ch._lineIndex;
          // console.log("Height test ", ch.h());
          if (page._lineHeight[i] < ch.h) {
            page._lineHeight[i] = ch.h;
          }
        }

      }
      calculateLines(iterator);

      // The pagination part is left out from this
      return;

      /*
           // console.log("Pagination ", this);
           
           // calculate the line heights...
           
           
           
           // console.log("Line Heights ", me._lineHeight);
           
           // And finally, position the items accordingly...
           var index = 0,
               x = page.x,
               y = page.y,
               leftOver = null;
           
           // console.log("Page ", page);
           // console.log("Line heights ", me._lineHeight);
           
           var item = startFrom;
           
           while(item) {
               
           
               var ch = item;
           
               var i = ch._lineIndex,
                   h = me._lineHeight[i];
               if(y+h>(page.y+page.h)) {
                   leftOver = ch;
                   break;
               }
               if(ch._lineIndex>index) {
                   x = page.x;
                   y += me._lineHeight[i-1] +lineStep;
                   index = ch._lineIndex;
               }
           
               if(y+h>(page.y+page.h)) {
                   leftOver = ch;
                   break;
               }        
               
               ch.x(x).y( y + (h - ch.h()) );
               
               if(ch._newline) {
                   var area = ch.hitArea() || {};
                   area.x = ch.x();
                   area.y = y;
                   area.w = (page.x+page.w) - area.x;
                   area.h = h;
                   ch.hitArea(area);
               } else {
                   var area = ch.hitArea() || {};
                   area.x = ch.x();
                   area.y = y;
                   area.w = ch.w()+wordStep;
                   area.h = h;
                   ch.hitArea(area);            
               }
               
               x+=ch.w()+wordStep;
           
               var next = item.next(),
                   bSet = false;
               if(next) {
                   if(next._lineIndex == item._lineIndex) {
                       if(next.h() < item.h()/2) {
                           var subPage = {
                               x : x,
                               y : y,
                               w : ( page.x + page.w) - x,
                               h : item.h()
                           }
                           var loopTo = this.orientLines(subPage, next);
                           
                           // if(loopTo==next) return null;
                           
                           x  = page.x;
                           y += item.h();
           
                           bSet = true;
                           item = loopTo;
                           
                           if(item) calculateLines(item);
                       }
                   }    
               }
            
               if(!bSet) item = item.next();
               
               
           }
           
           return leftOver;
           */

    }
    _myTrait_.renderPage = function(page, ctx, useFunctionalCtx) {
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
      if (page.x) x += page.x;
      if (page.y) x += page.y;
      if (page.lineStep) lineStep = page.lineStep;

      var start_x = x;

      if (useFunctionalCtx) {
        ctx.textBaseline('bottom');
        ctx.font(this.fontStyleString(page));
      } else {
        ctx.textBaseline = 'bottom';
        ctx.font = this.fontStyleString(page);
      }

      for (var line_i = 0; line_i < lineCnt; line_i++) {
        var lineH = page._lineHeight[line_i];
        var line = page._lines[line_i];
        x = start_x;
        var microStep = 0;
        if (page.align == "center") x += (page.w - line[line.length - 1]._total) / 2;
        if (page.align == "right") x += (page.w - line[line.length - 1]._total);
        if (page.align == "fill" && (line.length > 1)) microStep = (page.w - line[line.length - 1]._total) / (line.length - 1);

        if (microStep > page.width * 0.2) microStep = 0;
        if (line_i == lineCnt - 1) microStep = 0;

        for (var word_i = 0; word_i < line.length; word_i++) {
          var ch = line[word_i];
          ctx.fillText(ch.text, x, y + lineH);
          ctx.strokeText(ch.text, x, y + lineH);
          x += ch.w + microStep;
        }
        y += page._lineHeight[line_i] + lineStep;
      }


    }
    _myTrait_.renderText = function(text, page, ctx) {

      var myPage = this.txtToObjs(text, page);
      var it = this.calcObjSizes(myPage);
      this.prepareLines(myPage);
      this.renderPage(myPage, ctx);
    }
    _myTrait_.renderText2 = function(text, page, ctx) {
      var myPage = this.txtToObjs(text, page);
      var it = this.calcObjSizes(myPage);
      this.prepareLines(myPage);
      this.renderPage(myPage, ctx, true);
    }
    _myTrait_.textLength = function(txt, page) {
      var ctx = this._getCtx();
      ctx.font = this.fontStyleString(page);
      return ctx.measureText(txt).width;

    }
    _myTrait_.txtToObjs = function(text, res) {

      // The lines of the text
      var lines = text.split("\n");
      var prev = null;

      if (!res) {
        res = {
          words: []
        }
      }
      if (!res.words) res.words = [];
      res.words.length = 0;

      lines.forEach(function(line) {
        var txtList = line.split(" ");
        var lineObs = [],
          i = 0;
        txtList.forEach(function(txt) {
          var t = txt; // do not trim this time
          if (t.length > 0) {
            var o = {
              text: t,
              _i: i++
            };
            lineObs.push(o);
          }
        });
        if (lineObs.length == 0) {
          var o = {
            text: "",
            _i: i++
          };
          lineObs.push(o);
        }
        if (lineObs.length > 0) {
          lineObs[i - 1]._newline = true;
          res.words.push(lineObs);
        }
      });

      return res;
    }
  }(this));;
  (function(_myTrait_) {
    var _initDone;
    _myTrait_.drawBox = function(ctx, x, y, w, h, fillStyle, strokeStyle) {
      ctx.beginPath();
      ctx.rect(x, y, w, h);
      ctx.closePath();
      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }
      if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
      }

    }
    _myTrait_.drawCircle = function(ctx, x, y, r) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI, false);
      ctx.closePath();


    }
    _myTrait_.drawDashedLine = function(ctx, xStart, yStart, xEnd, yEnd, size, relation) {

      if (!relation) relation = 0.5;
      if (!size) size = 10;

      var stepEmpty = (1 - relation) * size,
        step = relation * size;

      var dv_x = xEnd - xStart,
        dv_y = yEnd - yStart;

      var len = Math.sqrt(dv_x * dv_x + dv_y * dv_y);
      var i = dv_x / len
      j = dv_y / len;

      var x = xStart,
        y = yStart;

      while (len > 0) {

        if (step > len) step = len;
        this.drawLine(ctx, x, y, x + i * step, y + j * step);
        x = x + i * step;
        y = y + j * step;

        len = len - step;
        if (len <= 0) break;

        x = x + i * stepEmpty;
        y = y + j * stepEmpty;
        len = len - stepEmpty;

      }


    }
    _myTrait_.drawLine = function(ctx, xStart, yStart, xEnd, yEnd) {

      ctx.beginPath();
      ctx.moveTo(xStart, yStart);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();

    }
  }(this));;
  (function(_myTrait_) {
    if (_myTrait_.__traitInit && !_myTrait_.hasOwnProperty("__traitInit"))
      _myTrait_.__traitInit = _myTrait_.__traitInit.slice();
    if (!_myTrait_.__traitInit) _myTrait_.__traitInit = []
    _myTrait_.__traitInit.push(function(ctx) {

    });
  }(this));
}
var canvasUtils = function(a, b, c, d, e, f, g, h) {
  if (this instanceof canvasUtils) {
    var args = [a, b, c, d, e, f, g, h];
    if (this.__factoryClass) {
      var m = this;
      var res;
      this.__factoryClass.forEach(function(initF) {
        res = initF.apply(m, args);
      });
      if (Object.prototype.toString.call(res) == '[object Function]') {
        if (res._classInfo.name != canvasUtils._classInfo.name) return new res(a, b, c, d, e, f, g, h);
      } else {
        if (res) return res;
      }
    }
    if (this.__traitInit) {
      var m = this;
      this.__traitInit.forEach(function(initF) {
        initF.apply(m, args);
      })
    } else {
      if (typeof this.init == 'function')
        this.init.apply(this, args);
    }
  } else return new canvasUtils(a, b, c, d, e, f, g, h);
};
canvasUtils._classInfo = {
  name: 'canvasUtils'
};
canvasUtils.prototype = new canvasUtils_prototype();
if (typeof(window) != 'undefined') window['canvasUtils'] = canvasUtils;
if (typeof(window) != 'undefined') window['canvasUtils_prototype'] = canvasUtils_prototype;