function myD3($) {
  var myD3 = $('#my-d3'),
    content = this.get('content');
  //myD3.html(JSON.stringify(content));

  var details = "";
  function display(child) {
    if (child instanceof Array) {
      for (var i = 0, len = child.length; i < len; i++) {
        display(child[i]);
      }
    } else if (child instanceof Object) {
      let className = child['type'];
      if (child['tagName'] !== undefined) {
        className += ' ' + child['tagName'];
      }
      details += '<div class="' + className + '">Type: ' + child['type'];
      if (child['type'] === 'Text') {
        details += '<br>Content: ' + child['content'] + '</div>';
      } else {
        if (child['tagName']) {
          details += '<br>Tag Name: ' + child['tagName'];
        }
        let objLen = Object.keys(child['attributes']).length;
        if (objLen > 0) {
          let attrObj = child['attributes'];
          let count = 1;
          details += '<br>Attributes: ';
          for (var key in attrObj) {
            if (attrObj.hasOwnProperty(key)) {
              details += key + '=' + attrObj[key];
              if (count !== objLen) {
                details += ', ';
              }
            }
            count++;
          }
        }

        if (child['children']) {
          details += '<div class="children">';
          display(child['children']);
          details += '</div>';
        }
        details += '</div>';
      }
    }
  }

  display(content);
  myD3.html(details);
}
