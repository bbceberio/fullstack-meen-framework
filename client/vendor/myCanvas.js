function myCanvas() {
  var myCanvas = document.getElementById('myCanvas'),
    w = myCanvas.width,
    h = myCanvas.height,
    context = myCanvas.getContext('2d');
  context.fillStyle = '#4AADD6';
  context.fillRect(0, 0, w, h);

  context.fillStyle = '#FFDE00';
  context.arc(w/2.4, h/2, h/4, 0, 2*Math.PI, false);
  context.fill();
}
