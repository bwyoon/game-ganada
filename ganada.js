/*
 가나다 HTML5+css+javascript(jquery) version
 1990년 서울대 핵물리 실험실에 있을때 Turbo PASCAL을 이용해서 DOS버젼으로 오락실 가나다 게임을 흉내내서 만들었습니다.
 가나다 게임은 이후로 새로운 프로그래밍 언어를 공부할때마다 다시 프로그래밍해서 그 프로그래밍 언어를 좀더 잘 이해할 수 있게 되었던 게임이기도 합니다.
 1993년에는 Turbo C로 프로그래밍한 버전을 1998년에는 java로 프로그래밍한 버전(http://membres.multimania.fr/bwyoon/ganada.html)을 만들었습니다.
 이번에는 html+css+javascript 버전으로 만들어 보았습니다. 
 이 게임의 배포, 수정, 및 수정 후 재배포 등등 제 3자의 이 게임에 관련된 모든 행위를 
 게임의 자바 스크립트 상단에 있는 이 코멘트는 지우지 않고 원작자가 윤복원 (Bokwon Yoon)이라고 명시하는 조건에서 허락합니다.
 남이 만든 거 살짝 바꿔서 자기가 만든 것처럼 하는 사람들이 꼭 있더라구요. 
 자바 가나다 자기가 만들었다고 하시는 분들 다들 아시죠? (electric ... , xpuz ..., 실질적으로 같은 회사) 책까지 냈던데.
 짧은 시간에 만들다 보니 버그가 있을 듯 한데, 혹시 버그를 찾으시면 bwyoon@gmail.com 으로 리포트해 주세요.

 2012년 8월초에 윤복원 씀.


 This GANADA game is developed by Bokwon Yoon using html+css+javascript.
 Any modification of the code, distribution of the game, redistribution after modification of the code are granted
 only when you keep this original comment without being altered and you specify that the original work of this game is done by Bokwon Yoon.
 If you find any bug, please report it to me at bwyoon@gmail.com 

 (c) Bokwon Yoon 1990 (DOS version in Turbo PASCAL), 1993 (DOS version in Turbo C), 2012 - (html+css+javascript version)   
 
*/

var TileImg;
var TileSize = 45;
var BlinkColor = "#00ffff";

var SelX = -1, SelY = -1;
var GameLevel;
var TilesToRemove;

var TileArray;
var MaxGameLevel = 8;
var GameW     = [0,  8, 10, 12, 12, 12, 12, 16, 18];
var GameH     = [0,  6,  6,  6,  8, 10, 12, 10, 12];
var SameTile  = [0,  4,  4,  4,  6,  6,  8,  8,  8];
var DiffTile  = [0, 12, 15, 18, 16, 20, 18, 20, 27];
var TileCount = [0, 48, 60, 72, 96,120,144,160,216];

var TileBuf = new Array(216);
var PosXBuf = new Array(216);
var PosYBuf = new Array(216);
var BlinkInterval = null;
var TimerInterval = null;

function GetIEVersion() {
 var rv = -1; 
 if (navigator.appName == 'Microsoft Internet Explorer') {
  var ua = navigator.userAgent;
  var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
  if (re.exec(ua) != null)
   rv = parseFloat(RegExp.$1);
 }
 return rv;
}

function LoadGanadaImages()
{
 var iev = GetIEVersion();
 if ((iev < 9) && (iev > 0)) {
  alert("인터넷 익스플로러는 버전 9 이상에서 잘 작동합니다.\nFirefox난 Chrome 브라우저를 권장합니다." );
 }

 TileImg = new Array();
 for (n = 0; n < 27; n++) {
  TileImg[n] = new Image();
  TileImg[n].src = "ganadaimgs/ganada"+n+".gif";
 }
}

function SetTileSize(ts)
{
 var x0 = 10, y0 = 55, v, x, y, xy, id, left, top;

 TileSize = ts;
 $(".tile").css({"width" : TileSize});
 $(".tile").css({"height" : TileSize});
 $(".emptybox").css({"width" : TileSize});
 $(".emptybox").css({"height" : TileSize});
 $(".selectbox").css({"width" : TileSize-6});
 $(".selectbox").css({"height" : TileSize-6});
 for (x = 1; x <= 18; x++) 
 for (y = 1; y <= 12; y++) {
   left = x0+(x-1)*TileSize;
   top  = y0+(y-1)*TileSize;
   xy = x*100+y;
   id = "#tile"+xy;
   $(id).css({"left" : left});
   $(id).css({"top" : top});
   xy = x*100+y;
   id = "#selectbox"+xy;
   $(id).css({"left" : left});
   $(id).css({"top" : top});
   xy = x*100+y;
   id = "#emptybox"+xy;
   $(id).css({"left" : left});
   $(id).css({"top" : top});
 }
 $("img").css({"width" : TileSize});
 $("img").css({"height" : TileSize});

 v = TileSize*18+25;
 $("#gamepanel").css({"width" : v});
 v = TileSize*12+70;
 $("#gamepanel").css({"height" : v});
}

function SetTileImage(x, y, num)
{
 var xy = x*100+y;
 var id = "#tile"+xy;
 var imgfile = "ganadaimgs/ganada"+num+".gif";
 var eid = "#emptybox"+xy;

 $(id).html("<img src=\""+imgfile+"\" width=\""+TileSize+"\" height=\""+TileSize+"\">");
 if (num > 0) $(eid).css({"display" : "block"});
 else $(eid).css({"display" : "none"});
 TileArray[x][y] = num;
}

function Redraw()
{
 var s, x, y;

 s = $("#tilesize").val();
 localStorage["tilesize"] = s;
 SetTileSize(s);
 for (x = 1; x <= 18; x++) 
 for (y = 1; y <= 12; y++) SetTileImage(x, y, TileArray[x][y]);
}

function InitTileTable()
{
 var x0 = 10, y0 = 55, x, y, xy, id, v;

 for (x = 1; x <= 18; x++) 
 for (y = 1; y <= 12; y++) {
   xy = x*100+y;
   id = "tile"+xy;
   $("#gamepanel").append("<div id=\""+id+"\" class=\"tile\"></div>");
   id = "selectbox"+xy;
   $("#gamepanel").append("<div id=\""+id+"\" class=\"selectbox\" onClick=\"ClickTile("+x+","+y+")\"></div>");
   id = "emptybox"+xy;
   $("#gamepanel").append("<div id=\""+id+"\" class=\"emptybox\" onClick=\"ClickTile("+x+","+y+")\"></div>");
 }

 TileArray = new Array(20);
 for (x = 0; x < 20; x++) {
  TileArray[x] = new Array(14);
  for (y = 0; y < 14; y++) TileArray[x][y] = 0;
 }

 if (localStorage["tilesize"] != null) {
  v = localStorage["tilesize"];
  $("#tilesize").val(v).attr('selected', true);
 }

 if (localStorage["gamelevel"] != null) {
  v = localStorage["gamelevel"];
  $("#level").val(v).attr('selected', true);
 }

 Redraw();
}

function Start()
{
 var n, m, l, k, x, y, count;

 GameLevel = $("#level").val();
 localStorage["gamelevel"] = GameLevel;

 count = 0;
 for (n = 1; n <= DiffTile[GameLevel]; n++) 
 for (m = 1; m <= SameTile[GameLevel]; m++) TileBuf[count++] = n;

 count = 0;
 for (x = 10-GameW[GameLevel]/2; x <= 9+GameW[GameLevel]/2; x++)
 for (y =  7-GameH[GameLevel]/2; y <= 6+GameH[GameLevel]/2; y++) {
  PosXBuf[count] = x;
  PosYBuf[count++] = y;
 } 

 for (x = 1; x <= 18; x++) 
 for (y = 1; y <= 12; y++) SetTileImage(x, y, 0);

 for (n = TileCount[GameLevel]; n > 0; n--) {
  m = Math.floor(Math.random()*n);
  if (m >= n) m = n-1;
  l = Math.floor(Math.random()*n);
  if (l >= n) l = n-1;
  SetTileImage(PosXBuf[m], PosYBuf[m], TileBuf[l]);
  for (k = m; k < n-1; k++) {
   PosXBuf[k] = PosXBuf[k+1];
   PosYBuf[k] = PosYBuf[k+1];
  }
  for (k = l; k < n-1; k++) TileBuf[k] = TileBuf[k+1];
 }

 TilesToRemove = TileCount[GameLevel];
}

function LevelUp()
{
 GameLevel = parseInt($("#level").val());
 if (GameLevel < MaxGameLevel) {
  GameLevel += 1;
  $("#level").val(GameLevel).attr('selected', true);
  v = $("#time-div").text();
  v = parseInt(v)+TileCount[GameLevel];
  $("#time-div").html(v);
  Start();
 } else {
   window.clearInterval(BlinkInterval); BlinkInterval = null;
   window.clearInterval(TimerInterval); TimerInterval = null;
 }
}

function BlinkIntervalFunction()
{
 var c = (BlinkColor == "#00ffff") ? "#000000" : "#00ffff";
 var v = "3px solid "+c;

 $(".selectbox").css({"border" : v});
 BlinkColor = c;
}

function TimerIntervalFunction()
{
 var v;
 v = $("#time-div").text();
 if (parseInt(v) > 0) {
  v = parseInt(v)-1;
  if (v >= 0) $("#time-div").html(v);
  if (v == 0) {
   UnselectTile();
   window.clearInterval(BlinkInterval); BlinkInterval = null;
   window.clearInterval(TimerInterval); TimerInterval = null;
   alert("Time is over.");
  }
 }
}

function UnselectTile()
{
 var xy = SelX*100+SelY, id = "#selectbox"+xy;

 if ((SelX > 0) && (SelY > 0)) {
  $(id).css({"display" : "none"});
 }
 SelX = SelY = -1;
}

function SelectTile(x, y)
{
 var xy, id;

 if (TileArray[x][y] > 0) {
  SelX = x;
  SelY = y;
  xy = SelX*100+SelY;
  id = "#selectbox"+xy;
  $(id).css({"display" : "block"});
 }
}

function Replay()
{
 UnselectTile();
 //if (parseInt($("#time-div").text()) == 0) {
  if (BlinkInterval == null) BlinkInterval = window.setInterval(BlinkIntervalFunction, 100);
  if (TimerInterval == null) TimerInterval = window.setInterval(TimerIntervalFunction, 1000);
 //}
 GameLevel = parseInt($("#level").val());
 $("#time-div").html(TileCount[GameLevel]);
 Start();
}


function TileMatch(x1, y1, x2, y2)
{
 var x, y, sum, dia, xmin, xmax, ymin, ymax; 

 xmin = (x1 < x2) ? x1 : x2;
 xmax = (x1 > x2) ? x1 : x2;
 ymin = (y1 < y2) ? y1 : y2;
 ymax = (y1 > y2) ? y1 : y2;

 if ((TileArray[x1][y1] == 0) || (TileArray[x2][y2] == 0)) return false;
 if (TileArray[x1][y1] != TileArray[x2][y2]) return false;

 if (x1 == x2) {
  if ((y1 == y2+1) || (y1 == y2-1)) return true;
  x = x1;
  sum = 0;
  for (y = ymin+1; y <= ymax-1; y++) sum += TileArray[x][y];
  if (sum == 0) return true;
  x = x1+1;
  sum = 0;
  for (y = ymin; y <= ymax; y++) sum += TileArray[x][y];
  if (sum == 0) return true; 
  x = x1-1;
  sum = 0;
  for (y = ymin; y <= ymax; y++) sum += TileArray[x][y];
  return (sum == 0); 
 }
 if (y1 == y2) {
  if ((x1 == x2+1) || (x1 == x2-1)) return true;
  y = y1;
  sum = 0;
  for (x = xmin+1; x <= xmax-1; x++) sum += TileArray[x][y];
  if (sum == 0) return true; 
  y = y1+1;
  sum = 0;
  for (x = xmin; x <= xmax; x++) sum += TileArray[x][y];
  if (sum == 0) return true; 
  y = y1-1;
  sum = 0;
  for (x = xmin; x <= xmax; x++) sum += TileArray[x][y];
  return (sum == 0); 
 }
 
 if (x1 < x2) dia = (y1 < y2) ? "asc" : "desc";
 else dia = (y1 > y2) ? "asc" : "desc";
 
 if (dia == "asc") {
  sum = 0;
  for (x = xmin+1; x <= xmax; x++) sum += TileArray[x][ymin];
  for (y = ymin+1; y <  ymax; y++) sum += TileArray[xmax][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin+1; x <  xmax; x++) sum += TileArray[x][ymin];
  for (y = ymin+1; y <= ymax; y++) sum += TileArray[xmax-1][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin+1; x <= xmax+1; x++) sum += TileArray[x][ymin];
  for (y = ymin+1; y <= ymax  ; y++) sum += TileArray[xmax+1][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin; x <= xmax; x++) sum += TileArray[x][ymin-1];
  for (y = ymin; y <  ymax; y++) sum += TileArray[xmax][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin  ; x <= xmax; x++) sum += TileArray[x][ymin+1];
  for (y = ymin+2; y <  ymax; y++) sum += TileArray[xmax][y];
  if (sum == 0) return true;

  sum = 0;
  for (y = ymin+1; y <= ymax; y++) sum += TileArray[xmin][y];
  for (x = xmin+1; x <  xmax; x++) sum += TileArray[x][ymax];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymin+1; y <= ymax-1; y++) sum += TileArray[xmin][y];
  for (x = xmin+1; x <= xmax  ; x++) sum += TileArray[x][ymax-1];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymin+1; y <= ymax+1; y++) sum += TileArray[xmin][y];
  for (x = xmin+1; x <= xmax  ; x++) sum += TileArray[x][ymax+1];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymin; y <= ymax; y++) sum += TileArray[xmin-1][y];
  for (x = xmin; x <  xmax; x++) sum += TileArray[x][ymax];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymin  ; y <= ymax; y++) sum += TileArray[xmin+1][y];
  for (x = xmin+2; x <  xmax; x++) sum += TileArray[x][ymax];
  if (sum == 0) return true;
 } else {
  sum = 0;
  for (x = xmin+1; x <= xmax; x++) sum += TileArray[x][ymax];
  for (y = ymax-1; y >  ymin; y--) sum += TileArray[xmax][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin+1; x <= xmax-1; x++) sum += TileArray[x][ymax];
  for (y = ymax-1; y >=   ymin; y--) sum += TileArray[xmax-1][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin+1; x <= xmax+1; x++) sum += TileArray[x][ymax];
  for (y = ymax-1; y >=   ymin; y--) sum += TileArray[xmax+1][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin  ; x <= xmax; x++) sum += TileArray[x][ymax-1];
  for (y = ymax-2; y >  ymin; y--) sum += TileArray[xmax][y];
  if (sum == 0) return true;
  sum = 0;
  for (x = xmin; x <= xmax; x++) sum += TileArray[x][ymax+1];
  for (y = ymax; y >  ymin; y--) sum += TileArray[xmax][y];
  if (sum == 0) return true;

  sum = 0;
  for (y = ymax-1; y >= ymin; y--) sum += TileArray[xmin][y];
  for (x = xmin+1; x <  xmax; x++) sum += TileArray[x][ymin];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymax-1; y >  ymin; y--) sum += TileArray[xmin][y];
  for (x = xmin+1; x <= xmax; x++) sum += TileArray[x][ymin+1];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymax-1; y >= ymin-1; y--) sum += TileArray[xmin][y];
  for (x = xmin+1; x <=   xmax; x++) sum += TileArray[x][ymin-1];
  if (sum == 0) return true;
  sum = 0;
  for (y = ymax; y >= ymin; y--) sum += TileArray[xmin-1][y];
  for (x = xmin; x <  xmax; x++) sum += TileArray[x][ymin];
  if (sum == 0) return true;
  sum = 0;
  for (y =  ymax; y >= ymin; y--) sum += TileArray[xmin+1][y];
  for (x = xmin+1; x <  xmax; x++) sum += TileArray[x][ymin];
  if (sum == 0) return true;
 }

 return false;
}

function ClickTile(x, y)
{
 var v;
 v = $("#time-div").text();
 if (parseInt(v) > 0) {
  if (TileArray[x][y] > 0) {
   if ((x != SelX) || (y != SelY)) {
    if ((SelX > 0) && (SelY > 0)) {
     if (TileMatch(x, y, SelX, SelY)) {
      SetTileImage(x, y, 0);
      SetTileImage(SelX, SelY, 0);
      TilesToRemove -= 2;
      UnselectTile();
      if (TilesToRemove == 0) LevelUp();
     }
    } else SelectTile(x, y);
   } else UnselectTile();
  }
 } else UnselectTile();
}

function StartGame()
{
 LoadGanadaImages();
 InitTileTable();
}

