/* eslint-disable no-fallthrough */
const sorttable = {
  makeSortable: function(table) {
    if (table.getElementsByTagName("thead").length == 0) {
      // table doesn't have a tHead. Since it should have, create one and
      // put the first table row in it.
      let the = document.createElement("thead");
      the.appendChild(table.rows[0]);
      table.insertBefore(the, table.firstChild);
    }
    // Safari doesn't support table.tHead, sigh
    if (table.tHead == null)
      table.tHead = table.getElementsByTagName("thead")[0];
    //if (table.tHead.rows.length != 1) return; // can't cope with two header rows
    // work through each column and calculate its type
    let headrow = table.tHead.childNodes;
    let override;
    for (var i = 0; i < headrow.length; i++) {
      // manually override the type with a sorttable_type attribute
      if (!headrow[i].className.match(/\bsorttable_nosort\b/)) {
        // skip this col
        let mtch = headrow[i].className.match(/\bsorttable_([a-z0-9]+)\b/);
        if (mtch) {
          override = mtch[1];
        }
        if (mtch && typeof sorttable["sort_" + override] === "function") {
          headrow[i].sorttable_sortfunction = sorttable["sort_" + override];
        } else {
          headrow[i].sorttable_sortfunction = sorttable.guessType(table, i);
        }
        // make it clickable to sort
        headrow[i].sorttable_columnindex = i;
        headrow[i].sorttable_tbody = table.tBodies[0];
        if (mtch && override == "default") {
          sorttable.applySort.call(headrow[i]);
        }
        dean_addEvent(headrow[i], "click", sorttable.applySort);
      }
    }
  },

  applySort: function() {
    if (this.className.search(/\bsorttable_sorted\b/) != -1) {
      // if we're already sorted by this column, just
      // reverse the table, which is quicker
      sorttable.reverse(this.sorttable_tbody);
      this.className = this.className.replace(
        "sorttable_sorted",
        "sorttable_sorted_reverse"
      );
      return;
    }
    if (this.className.search(/\bsorttable_sorted_reverse\b/) != -1) {
      // if we're already sorted by this column in reverse, just
      // re-reverse the table, which is quicker
      sorttable.reverse(this.sorttable_tbody);
      this.className = this.className.replace(
        "sorttable_sorted_reverse",
        "sorttable_sorted"
      );
      return;
    }
    // remove sorttable_sorted classes
    let theadrow = this.parentNode;
    forEach(theadrow.childNodes, function(cell) {
      if (cell.nodeType == 1) {
        // an element
        cell.className = cell.className.replace("sorttable_sorted_reverse", "");
        cell.className = cell.className.replace("sorttable_sorted", "");
      }
    });

    this.className += " sorttable_sorted";
    // build an array to sort. This is a Schwartzian transform thing,
    // i.e., we "decorate" each row with the actual sort key,
    // sort based on the sort keys, and then put the rows back in order
    // which is a lot faster because you only do getInnerText once per row
    let row_array = [];
    let col = this.sorttable_columnindex;
    let rows = this.sorttable_tbody.rows;
    for (var j = 0; j < rows.length; j++) {
      row_array[row_array.length] = [
        sorttable.getInnerText(rows[j].cells[col]),
        rows[j]
      ];
    }
    /* If you want a stable sort, uncomment the following line */
    //sorttable.shaker_sort(row_array, this.sorttable_sortfunction);
    /* and comment out this one */
    row_array.sort(this.sorttable_sortfunction);

    let tb = this.sorttable_tbody;
    for (let j = 0; j < row_array.length; j++) {
      tb.appendChild(row_array[j][1]);
    }
  },

  guessType: function(table, column) {
    // guess the type of a column based on its first non-blank row
    let sortfn = sorttable.sort_alpha;
    for (var i = 0; i < table.tBodies[0].rows.length; i++) {
      let text = sorttable.getInnerText(table.tBodies[0].rows[i].cells[column]);
      if (text != "") {
        if (text.match(/^-?[£$¤]?[\d,.]*?%?$/)) {
          return sorttable.sort_numeric;
        }
        // check for a date: dd/mm/yyyy or dd/mm/yy
        // can have / or . or - as separator
        // can be mm/dd as well
        let possdate = text.match(sorttable.DATE_RE);
        if (possdate) {
          // looks like a date
          let first = parseInt(possdate[1]);
          let second = parseInt(possdate[2]);
          if (first > 12) {
            // definitely dd/mm
            return sorttable.sort_ddmm;
          } else if (second > 12) {
            return sorttable.sort_mmdd;
          } else {
            // looks like a date, but we can't tell which, so assume
            // that it's dd/mm (English imperialism!) and keep looking
            sortfn = sorttable.sort_alpha;
          }
        }
      }
    }
    return sortfn;
  },

  getInnerText: function(node) {
    // gets the text we want to use for sorting for a cell.
    // strips leading and trailing whitespace.
    // this is *not* a generic getInnerText function; it's special to sorttable.
    // for example, you can override the cell text with a customkey attribute.
    // it also gets .value for <input> fields.

    if (!node) return "";

    let hasInputs =
      typeof node.getElementsByTagName === "function" &&
      node.getElementsByTagName("input").length;

    if (node.getAttribute("sorttable_customkey") != null) {
      return node.getAttribute("sorttable_customkey");
    } else if (sorttable.firstTextNode(node) && !hasInputs) {
      return sorttable
        .firstTextNode(node)
        .textContent.replace(/^\s+|\s+$/g, "");
    } else if (typeof node.innerText !== "undefined" && !hasInputs) {
      return node.innerText.replace(/^\s+|\s+$/g, "");
    } else if (typeof node.text !== "undefined" && !hasInputs) {
      return node.text.replace(/^\s+|\s+$/g, "");
    } else {
      switch (node.nodeType) {
      case 3:
        if (node.nodeName.toLowerCase() == "input") {
          return node.value.replace(/^\s+|\s+$/g, "");
        }
      case 4:
        return node.nodeValue.replace(/^\s+|\s+$/g, "");
      case 1:
      case 11:
        var innerText = "";
        for (var i = 0; i < node.childNodes.length; i++) {
          innerText += sorttable.getInnerText(node.childNodes[i]);
        }
        return innerText.replace(/^\s+|\s+$/g, "");
      default:
        return "";
      }
    }
  },

  firstTextNode: function(node) {
    for (var i = 0; i < node.childNodes.length; i++) {
      var curNode = node.childNodes[i];
      if (curNode.nodeName === "#text") {
        return curNode;
      }
    }
    return undefined;
  },

  reverse: function(tbody) {
    // reverse the rows in a tbody
    let newrows = [];
    for (let i = 0; i < tbody.rows.length; i++) {
      newrows[newrows.length] = tbody.rows[i];
    }
    for (let i = newrows.length - 1; i >= 0; i--) {
      tbody.appendChild(newrows[i]);
    }
  },

  /* sort functions
     each sort function takes two parameters, a and b
     you are comparing a[0] and b[0] */
  sort_numeric: function(a, b) {
    let aa = parseFloat(a[0].replace(/[^0-9.-]/g, ""));
    if (isNaN(aa)) aa = -1;
    let bb = parseFloat(b[0].replace(/[^0-9.-]/g, ""));
    if (isNaN(bb)) bb = -1;
    return aa - bb;
  },
  sort_alpha: function(a, b) {
    if (a[0] == b[0]) return 0;
    if (a[0] < b[0]) return -1;
    return 1;
  },
  sort_ddmm: function(a, b) {
    let mtch = a[0].match(sorttable.DATE_RE);
    let y = mtch[3];
    let m = mtch[2];
    let d = mtch[1];
    if (m.length == 1) m = "0" + m;
    if (d.length == 1) d = "0" + d;
    let dt1 = y + m + d;
    mtch = b[0].match(sorttable.DATE_RE);
    y = mtch[3];
    m = mtch[2];
    d = mtch[1];
    if (m.length == 1) m = "0" + m;
    if (d.length == 1) d = "0" + d;
    let dt2 = y + m + d;
    if (dt1 == dt2) return 0;
    if (dt1 < dt2) return -1;
    return 1;
  },
  sort_mmdd: function(a, b) {
    let mtch = a[0].match(sorttable.DATE_RE);
    let y = mtch[3];
    let d = mtch[2];
    let m = mtch[1];
    if (m.length == 1) m = "0" + m;
    if (d.length == 1) d = "0" + d;
    let dt1 = y + m + d;
    mtch = b[0].match(sorttable.DATE_RE);
    y = mtch[3];
    d = mtch[2];
    m = mtch[1];
    if (m.length == 1) m = "0" + m;
    if (d.length == 1) d = "0" + d;
    let dt2 = y + m + d;
    if (dt1 == dt2) return 0;
    if (dt1 < dt2) return -1;
    return 1;
  },

  shaker_sort: function(list, comp_func) {
    // A stable sort function to allow multi-level sorting of data
    // see: http://en.wikipedia.org/wiki/Cocktail_sort
    // thanks to Joseph Nahmias
    var b = 0;
    var t = list.length - 1;
    var swap = true;

    while (swap) {
      swap = false;
      for (var i = b; i < t; ++i) {
        if (comp_func(list[i], list[i + 1]) > 0) {
          var q = list[i];
          list[i] = list[i + 1];
          list[i + 1] = q;
          swap = true;
        }
      } // for
      t--;

      if (!swap) break;

      for (let i = t; i > b; --i) {
        if (comp_func(list[i], list[i - 1]) < 0) {
          let q = list[i];
          list[i] = list[i - 1];
          list[i - 1] = q;
          swap = true;
        }
      } // for
      b++;
    } // while(swap)
  }
};

// eslint-disable-next-line no-useless-escape
sorttable.DATE_RE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/;

/* ******************************************************************
   Supporting functions: bundled here to avoid depending on a library
   ****************************************************************** */

function dean_addEvent(element, type, handler) {
  if (element.addEventListener) {
    element.addEventListener(type, handler, false);
  } else {
    // assign each event handler a unique ID
    if (!handler.$$guid) handler.$$guid = dean_addEvent.guid++;
    // create a hash table of event types for the element
    if (!element.events) element.events = {};
    // create a hash table of event handlers for each element/event pair
    var handlers = element.events[type];
    if (!handlers) {
      handlers = element.events[type] = {};
      // store the existing event handler (if there is one)
      if (element["on" + type]) {
        handlers[0] = element["on" + type];
      }
    }
    // store the event handler in the hash table
    handlers[handler.$$guid] = handler;
    // assign a global event handler to do all the work
    element["on" + type] = handleEvent;
  }
}
// a counter used to create unique IDs
dean_addEvent.guid = 1;

function handleEvent(event) {
  var returnValue = true;
  // grab the event object (IE uses a global event object)
  event =
    event ||
    fixEvent(
      ((this.ownerDocument || this.document || this).parentWindow || window)
        .event
    );
  // get a reference to the hash table of event handlers
  var handlers = this.events[event.type];
  // execute each event handler
  for (var i in handlers) {
    this.$$handleEvent = handlers[i];
    if (this.$$handleEvent(event) === false) {
      returnValue = false;
    }
  }
  return returnValue;
}

function fixEvent(event) {
  // add W3C standard event methods
  event.preventDefault = fixEvent.preventDefault;
  event.stopPropagation = fixEvent.stopPropagation;
  return event;
}
fixEvent.preventDefault = function() {
  this.returnValue = false;
};
fixEvent.stopPropagation = function() {
  this.cancelBubble = true;
};

// Dean's forEach: http://dean.edwards.name/base/forEach.js
/*
	forEach, version 1.0
	Copyright 2006, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

// array-like enumeration
if (!Array.forEach) {
  // mozilla already supports this
  Array.forEach = function(array, block, context) {
    for (var i = 0; i < array.length; i++) {
      block.call(context, array[i], i, array);
    }
  };
}

// generic enumeration
Function.prototype.forEach = function(object, block, context) {
  for (var key in object) {
    if (typeof this.prototype[key] === "undefined") {
      block.call(context, object[key], key, object);
    }
  }
};

// character enumeration
String.forEach = function(string, block, context) {
  Array.forEach(string.split(""), function(chr, index) {
    block.call(context, chr, index, string);
  });
};

// globally resolve forEach enumeration
var forEach = function(object, block, context) {
  if (object) {
    var resolve = Object; // default
    if (object instanceof Function) {
      // functions have a "length" property
      resolve = Function;
    } else if (object.forEach instanceof Function) {
      // the object implements a custom forEach method so use that
      object.forEach(block, context);
      return;
    } else if (typeof object === "string") {
      // the object is a string
      resolve = String;
    } else if (typeof object.length === "number") {
      // the object is array-like
      resolve = Array;
    }
    resolve.forEach(object, block, context);
  }
};
