'use strict';

const canvas = document.getElementById('gameScreen');
const ctx = canvas.getContext('2d');
var bgm = new Audio('/sounds/bgm.ogg');
var deathAudio = new Audio('/sounds/die.wav');
var stompAudio = new Audio('/sounds/stomp.wav');
var spriteHeight = 16;
var spriteWidth = 16;
var marioImg = new Image();
var goombaImg = new Image();
var spriteSheet = [];
var imagesReady = 0;
marioImg.onload = function () {
  for (var i = 0; i < 3; i++) {

    var row = [];
    for (var j = 0; j < 4; j++) {
      //ctx.drawImage(getClippedRegion(testImg, i * width, j * height, width, height), i * (width + 4), j * (height));
      row.push(getClippedRegion(marioImg, j * 16, i * 16, 16, 16));
    }
    spriteSheet[i] = row;
  }
  imagesReady++;
  start();
  spriteSheet[2] = getClippedRegion(marioImg, 0, 2 * 16, 16, 16);
  spriteSheet[3] = getClippedRegion(marioImg, 4 * 16, 0 * 16, 16, 16);
  spriteSheet[4] = getClippedRegion(marioImg, 4 * 16, 1 * 16, 16, 16);
};
marioImg.src = 'img/marioSprites.png';


var goombaSheet = [];
goombaImg.onload = function () {
  for (var i = 1; i < 3; i++) {
	goombaSheet.push(getClippedRegion(goombaImg, i * 16, 0, 16, 16));
  }
  imagesReady++;
  start();
};
goombaImg.src = 'img/goombaSprites.png';


var tileSheetImage = new Image();
tileSheetImage.src = 'img/tiles.png'
var tileSheet = [];
tileSheetImage.onload = function () {
  //ctx.drawImage(tileSheet,0,0,16,16,0,0,64,64);

  for (var i = 0; i < 25; i++) {
    var row = [];
    for (var j = 0; j < 25; j++) {
      //ctx.drawImage(getClippedRegion(tileSheetImage,i*16,j*16,16,16), i*(16+2), j*(16+2));
      row.push(getClippedRegion(tileSheetImage, i * 16, j * 16, 16, 16));
    }
    tileSheet[i] = row;
  }
  imagesReady++;
  start();
};


function getClippedRegion(image, x, y, width, height) {

  var canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;

  //                   source region         dest. region
  ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

  return canvas;
}

function spawnFireball(){
	var fireballImg = getClippedRegion(goombaImg, 16*3,0,16,16);
	var fireball = new Fireball(fireballImg, new Vector(player.getPosition().x+200, player.getPosition().y));
    gameObjects.push(fireball);
}

class World {
	constructor(){
		this.map = [];
	}
	
}

class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  distance(otherVector){
	  return Math.sqrt(Math.pow(otherVector.x-this.x,2)+Math.pow(otherVector.y-this.y,2));
  }
}

class Drawable {

  constructor(img) {
    this.img = img;
  }

  draw(pos) {
    ctx.drawImage(this.img, pos.x-cameraOffset, pos.y);
  };
}

class AnimatedDrawable {

  constructor(imgs) {
    this.imgs = imgs;
    this.index = 0;
    this.delay = 250;
    this.timer = 0;
  }



  draw(pos) {
    if (this.timer + this.delay < (new Date().getTime())) {
      this.index = (this.index + 1) % this.imgs.length;
      this.timer = (new Date().getTime());
    }
    ctx.drawImage(this.imgs[this.index], pos.x-cameraOffset, pos.y);
  }
}

class GameObject {

  constructor(img, position, animated) {
    this.colliders = [];
    this.position = position;
    if (animated)
      this.objImage = new AnimatedDrawable(img);
    else
      this.objImage = new Drawable(img);
  }
  
  setPosition(x,y) {
    this.position = new Vector(x,y);
  }
  getPosition() {
    return this.position;
  }

  draw() {
    this.objImage.draw(this.position)
  }

  update() {

  }

  addCollider(collider) {
    collider.parentObj = this;
    this.colliders.push(collider);
  }

  onCollide(otherObject) {

  }
}

class Collider {
  constructor(x, y, width, height, name) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
	this.name = name;
  }

  getPosition() {
    return new Vector(this.getX(), this.getY());
  }
  

  getX() {
    return this.parentObj.position.x + this.x;
  }

  getY() {
    return this.parentObj.position.y + this.y;
  }

  collidesWith(otherCollider) {
    if (this.getX() < otherCollider.getX() + otherCollider.width &&
      this.getX() + this.width > otherCollider.getX() &&
      this.getY() < otherCollider.getY() + otherCollider.height &&
      this.getY() + this.height > otherCollider.getY()) {
      return true;
    }
    return false;
  }
}

class Tile extends GameObject {
  constructor(img, hasCollider, position, animated) {
    super(img, position, animated);
	if(hasCollider){
		this.addCollider(new Hitbox(0, 0, 16, 16));
	}
  }
}

//used to check type of collider
class Hitbox extends Collider {}
class Ground extends Collider {}
class Region extends Collider {}

class Entity extends GameObject {

  constructor(img, position, animated) {
    super(img, position, animated);
    this.controlForce = new Vector(0, 0);
    this.force = new Vector(0, 0);
  }


  addForce(force) {
    this.force.x += force.x;
    this.force.y += force.y;
  }

  setForce(force) {
    this.force.x = force.x;
    this.force.y = force.y;
  }

  setControlForce(force) {
    this.controlForce.x = force.x;
    this.controlForce.y = force.y;
  }

  addControlForce(force) {
    this.controlForce.x = Math.min(Math.max(this.controlForce.x + force.x, -1), 1);
    this.controlForce.y = Math.min(Math.max(this.controlForce.y + force.y, -3), 1);
  }

  update() {
    //update position from force
    this.position.x += this.force.x;
    this.position.y += this.force.y;

    this.position.x += this.controlForce.x;
    this.position.y += this.controlForce.y;

    //deacceleration on player controls
    if (this.controlForce.x > 0)
      this.controlForce.x -= Math.min(this.controlForce.x, 0.02);

    if (this.controlForce.x < 0)
      this.controlForce.x += Math.min(Math.abs(this.controlForce.x), 0.02);

    if (this.controlForce.y > 0)
      this.controlForce.y -= Math.min(this.controlForce.y, 0.02);

    if (this.controlForce.y < 0)
      this.controlForce.y += Math.min(Math.abs(this.controlForce.y), 0.02);
  }
  
  die() {
	  this.colliders = [];
  }
}

class Fireball extends Entity {
	constructor(img, position){
		super(img, position, false);
		this.originalPosition = position.y;
		this.addCollider(new Hitbox(0, 0, 16, 16, "fireball"));
	}
	update() {
		this.position.x -= 1;
		this.position.y = this.originalPosition + 8*Math.sin(Date.now()/200);
	}
	
	
}

class Goomba extends Entity {
	constructor(img, position){
		super(img, position, true);
		this.addCollider(new Hitbox(0, 6, 16, 10, "goomba_body"));
		this.addCollider(new Hitbox(0, 0, 8, 6, "goomba_headpiece_left"));
		this.addCollider(new Hitbox(8, 0, 8, 6, "goomba_headpiece_right"));
		this.movingLeft = true;
		this.deathTime = -1;
	}
	
	die(){
		this.deathTime = Date.now();
		this.objImage = new Drawable(goombaDead);
	}
	
	update() {
		super.update();
		if(this.deathTime > 0){
			if(Date.now() > this.deathTime + 1000){
				this.objImage = new Drawable(new Image(16,16));
				this.colliders = [];
				this.deathTime = -1;
			}
		}else{
			if(player.getPosition().distance(this.getPosition()) >= 256)
				return;
			if(this.movingLeft){
				this.position.x += 0.5;
			}else{
				this.position.x -= 0.5;
			}
		}
	}
	
	onCollide(otherCollider, myCollider) {
		if(otherCollider.name == "feet" && (myCollider.name == "goomba_headpiece_right" || myCollider.name == "goomba_headpiece_left")){
			stompAudio.play();
			console.log("kill goomba");
			if(this.deathTime == -1)
				this.die();
		}else if(myCollider.name == "goomba_headpiece_right"){
			this.movingLeft = false;
		}else if(myCollider.name == "goomba_headpiece_left"){
			this.movingLeft = true;
		}
		if(myCollider.name == "goomba_body"){
			this.position.y -= this.force.y;
		  this.controlForce.y = 0;
		  this.force.y = 0;
		}
	}
}

class Player extends Entity {

  constructor(img, position) {
    super(img, position, true);
    this.addCollider(new Hitbox(0, 1, 16, 14, "body"));
    this.addCollider(new Hitbox(0, 14, 16, 3, "feet"));
    this.addCollider(new Hitbox(0, 0, 16, 2, "headpiece"));
	this.blockJump = false;
	this.facingLeft = false;
	this.jumping = false;
	this.killed = false;
	this.ignoreControls = false;
  }

  changeAnimation(anim, animated){
	  if(animated){
		  if(this.objImage.imgs != anim)
			this.objImage = new AnimatedDrawable(anim);
		return;
	  }else{
		  this.objImage = new Drawable(anim);
	  }
	  
  }
  
  update() {
    super.update();
	if(this.killed){
		this.force.x = 0;
		this.force.y = -2;
		this.controlForce.x = 0;
		this.controlForce.y = 0;
		this.changeAnimation(spriteSheet[2],false);
		this.colliders = [];
		this.killed = false;
	}
  }

  
  die(){
	  this.killed = true;
	  this.ignoreControls = true;
	  bgm.pause();
	  deathAudio.play();
		setTimeout(function() {
			location.reload();
        }, 2712);
  }
  
  onCollide(otherCollider, myCollider) {
	  //console.log(otherCollider);
	  //console.log(myCollider);
	  if(myCollider.name == "feet" && (otherCollider.name == "goomba_headpiece_right" || otherCollider.name == "goomba_headpiece_left")){
			this.force.y = 0;
			this.position.y-=2;
			player.addControlForce(new Vector(0, -1.5));
		}else if(myCollider.name == "feet"){
		  //this.position.y -= this.controlForce.y;
		  this.position.y -= this.force.y;
		  this.controlForce.y = 0;
		  this.force.y = 0;
		  this.blockJump = false;
		  this.jumping = false;
	  }
	  if(myCollider.name == "headpiece"){
		  this.position.y -= this.controlForce.y;
		  //this.position.y -= this.force.y;
		  this.controlForce.y = 0;
		  this.blockJump = true;
	  }
	  
	  if(myCollider.name == "body" && (otherCollider.name == "goomba_body")){
		  
		  this.die();
	  }
	   
	  if(myCollider.name == "body"){
		  this.position.x -= this.controlForce.x;
		  this.position.x -= this.force.x;
		  this.controlForce.x = 0;
		  this.force.x = 0;
	  }
	  
	  if(otherCollider.name == "fireball") {
		  console.log("die");
		  this.die();
	  }
		
  }
}

var inputs = [];

function handleInput(button, value) {
	inputs[button] = value;
}


var fps = 60;
var now;
var then = Date.now();
var interval = 1000 / fps;
var delta;

var gameObjects = [];

var player;
var world = '';
var tileIndex = [];

var cameraOffset = 0;
var goombaDead;

function start() {
  bgm.play();
  if (imagesReady < 3)
    return;

goombaDead = getClippedRegion(goombaImg, 0,0,16,16);

var cloudTopLeft = tileSheet[0][20];
  var cloudBottomLeft = tileSheet[0][21];
  var cloudTopMid = tileSheet[1][20];
  var cloudBottomMid = tileSheet[1][21];
  var cloudTopRight = tileSheet[2][20];
  var cloudBottomRight = tileSheet[2][21];

  var doorTop = tileSheet[12][1];
  var doorBottom = tileSheet[13][1];

  var hillLeft = tileSheet[8][8];
  var hillEyeLeft = tileSheet[10][9];
  var hillTop = tileSheet[9][8];
  var hillMid = tileSheet[9][9];
  var hillRight = tileSheet[10][8];
  var hillEyeRight = tileSheet[8][9];

  var blockTile = tileSheet[0][1];
  var skyTile = new Image(16, 16);
  var brickTile = tileSheet[0][0];
  var breakableBrick = tileSheet[1][0];
  var itemBox = tileSheet[24][0];

  var leftPipeBottom = tileSheet[0][11];
  var leftPipeTop = tileSheet[0][10];
  var rightPipeBottom = tileSheet[1][11];
  var rightPipeTop = tileSheet[1][10];
  var leftBrush = tileSheet[11][11];
  var middleBrush = tileSheet[12][11];
  var rightBrush = tileSheet[13][11];

  var flagPole = tileSheet[16][11];
  var flagTop = tileSheet[16][10];
  var flag = tileSheet[16][10];
tileIndex["skyTile"] = skyTile;

  tileIndex["cloudTopLeft"] = cloudTopLeft;
  tileIndex["cloudBottomLeft"] = cloudBottomLeft;
  tileIndex["cloudTopMid"] = cloudTopMid;
  tileIndex["cloudBottomMid"] = cloudBottomMid;
  tileIndex["cloudTopRight"] = cloudTopRight;
  tileIndex["cloudBottomRight"] = cloudBottomRight;

  tileIndex["flagPole"] = flagPole;
  tileIndex["flag"] = flag;

  tileIndex["doorBottom"] = doorBottom;
  tileIndex["doorTop"] = doorTop;


  tileIndex["hillLeft"] = hillLeft;
  tileIndex["hillEyeLeft"] = hillEyeLeft;
  tileIndex["hillTop"] = hillTop;
  tileIndex["hillMid"] = hillMid;
  tileIndex["hillRight"] = hillRight;
  tileIndex["hillEyeRight"] = hillEyeRight;

  tileIndex["blockTile"] = blockTile;
  tileIndex["brickTile"] = brickTile;
  tileIndex["breakableBrick"] = breakableBrick;
  tileIndex["itemBox"] = itemBox;

  tileIndex["leftPipeBottom"] = leftPipeBottom;
  tileIndex["leftPipeTop"] = leftPipeTop;
  tileIndex["rightPipeBottom"] = rightPipeBottom;
  tileIndex["rightPipeTop"] = rightPipeTop;

  tileIndex["leftBrush"] = leftBrush;
  tileIndex["middleBrush"] = middleBrush;
  tileIndex["rightBrush"] = rightBrush;
  
  var colliderTiles = ["brickTile", "itemBox", "breakableBrick", "blockTile", "leftPipeBottom", "leftPipeTop", "rightPipeBottom", "rightPipeTop"];
  
  //tileLookup[1] = new Tile(brickTile, "breakableBrick");
  
  var level = [
  
	//screen 1
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "hillMid", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "hillEyeLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],

	//screen 2
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftPipeTop", "leftPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightPipeTop", "rightPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 3

	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftPipeTop", "leftPipeBottom", "leftPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightPipeTop", "rightPipeBottom", "rightPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftPipeTop", "leftPipeBottom", "leftPipeBottom", "leftPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightPipeTop", "rightPipeBottom", "rightPipeBottom", "rightPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],


	//screen 4

	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "hillMid", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "hillEyeLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "leftPipeTop", "leftPipeBottom", "leftPipeBottom", "leftPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "rightPipeTop", "rightPipeBottom", "rightPipeBottom", "rightPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],


	//screen 5

	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],


	//screen 6

	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 7
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "hillMid", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 8
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 9
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "brickTile", "brickTile"],

	//screen 10
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "hillMid", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],

	//screen 11
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftPipeTop", "leftPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightPipeTop", "rightPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "itemBox", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 12
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftPipeTop", "leftPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightPipeTop", "rightPipeBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 13
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "hillMid", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "flag", "flagPole", "flagPole", "flagPole", "flagPole", "flagPole", "flagPole", "flagPole", "flagPole", "blockTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "breakableBrick", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "breakableBrick", "breakableBrick", "breakableBrick", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "breakableBrick", "doorTop", "doorBottom", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "breakableBrick", "breakableBrick", "breakableBrick", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "breakableBrick", "breakableBrick", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],

	//screen 14
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillLeft", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillTop", "hillEyeRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "hillRight", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "leftBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "middleBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "rightBrush", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopLeft", "cloudBottomLeft", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopMid", "cloudBottomMid", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"],
	["skyTile", "skyTile", "skyTile", "cloudTopRight", "cloudBottomRight", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "skyTile", "brickTile", "brickTile"]

];
  

	world = new World();
	  for(var i=0;i<level.length;i++){
		var mapCol = [];
		for(var j=0;j<level[i].length;j++){
			var newTile = new Tile(tileIndex[level[i][j]], colliderTiles.includes(level[i][j]));
			mapCol.push(newTile);
		}
		world.map.push(mapCol);
	  }
  
  for(var i=0;i<world.map.length;i++){
		for(var j=0;j<world.map[i].length;j++){
			world.map[i][j].setPosition(i*16, j*16); //draw each map block
		}
	}
  
  player = new Player(spriteSheet[0], new Vector(0, 0));
  gameObjects.push(player);
  
  
  for (var i=2; i < 21; i++) {
	var goomba = new Goomba(goombaSheet, new Vector(i * 150, 100));
	gameObjects.push(goomba);
  }


  //gameObjects.push(new Tile(brickTile, new Vector(30, 30)));



  document.addEventListener('keydown', function (event) {
    switch (event.key) {
      case "ArrowLeft":
        inputs['left'] = 1;
        break;
      case "ArrowRight":
        inputs['right'] = 1;
        //walkRight();
        break;
      case "ArrowUp":
        inputs['a'] = 1;
        break;
      case "ArrowDown":
        inputs['down'] = 1;
        break;
    }
  });

  document.addEventListener('keyup', function (event) {
    switch (event.key) {
      case "ArrowLeft":
        inputs['left'] = 0;
        break;
      case "ArrowRight":
        inputs['right'] = 0;
        //walkRight();
        break;
      case "ArrowUp":
        inputs['a'] = 0;
        break;
      case "ArrowDown":
        inputs['down'] = 0;
        break;
    }
  });
  
  run();
}

function run() {

  now = Date.now();
  delta = now - then;

  if (delta > interval) {
    update();
    render();
  }

  window.requestAnimationFrame(run);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for(var i=0;i<world.map.length;i++){
		for(var j=0;j<world.map[i].length;j++){
			world.map[i][j].draw(); //draw each map block
		}
	}

  
  for (var i = 0; i < gameObjects.length; i++) {
    gameObjects[i].draw();

    for (var j = 0; j < gameObjects[i].colliders.length; j++) {
      var collider = gameObjects[i].colliders[j];
      //ctx.fillRect(collider.getPosition().x-cameraOffset, collider.getPosition().y, collider.width, collider.height);
    }
  }
}

function update() {
	if(!player.ignoreControls){
		if(inputs['left']){
			player.addControlForce(new Vector(-0.2, 0));
			if(player.jumping)
				player.changeAnimation(spriteSheet[3], false);
			else
				player.changeAnimation(spriteSheet[0], true);
			player.facingLeft = true;
		}
		if(inputs['right']){
			player.addControlForce(new Vector(0.2, 0));
			
			if(player.jumping)
				player.changeAnimation(spriteSheet[4], false);
			else
				player.changeAnimation(spriteSheet[1], true);
			
			player.facingLeft = false;
		}
		if(inputs['a'] && !player.blockJump){
			player.jumping = true;
			player.addControlForce(new Vector(0, -1.5));
		}
		if(inputs['down']){
			//player.addControlForce(new Vector(0, 0.2));
		}
		if(!inputs['left'] && !inputs['right']){
			if(player.jumping){
				if(player.facingLeft)
					player.changeAnimation(spriteSheet[3], false);
				else
					player.changeAnimation(spriteSheet[4], false);

			}else{
				if(player.facingLeft)
					player.changeAnimation(spriteSheet[0][0], false);
				else
					player.changeAnimation(spriteSheet[1][0], false);
			}
		}
	}
	
	
	if(player.getPosition().x - cameraOffset > 60){
		cameraOffset = player.getPosition().x - 60;
	}
	//cameraOffset = player.getPosition().x;
	
  //loop through every gameobject

  for (var i = 0; i < gameObjects.length; i++) {


    //loop through every collider on this gameobject
    for (var k = 0; k < gameObjects[i].colliders.length; k++) {

      //loop through all other gameobjects that haven't had collider checks
      for (var j = i + 1; j < gameObjects.length; j++) {

        //loop through all of the other gameobjects colliders
        for (var l = 0; l < gameObjects[j].colliders.length; l++) {

          if (gameObjects[i].colliders[k].collidesWith(gameObjects[j].colliders[l])) {
            gameObjects[i].onCollide(gameObjects[j].colliders[l], gameObjects[i].colliders[k]);
            gameObjects[j].onCollide(gameObjects[i].colliders[k], gameObjects[j].colliders[l]);
          }

        }
      }
	  
	  for (var m = 0; m < world.map.length; m++) {
		for (var n = 0; n < world.map[m].length; n++) {
			for (var b = 0; b < world.map[m][n].colliders.length; b++) {
				if (gameObjects[i].colliders[k].collidesWith(world.map[m][n].colliders[b])) {
					gameObjects[i].onCollide(world.map[m][n].colliders[b], gameObjects[i].colliders[k]);
					world.map[m][n].onCollide(gameObjects[i].colliders[k], world.map[m][n].colliders[b]);
				}
			}
		}
	  }

    }
gameObjects[i].update();
	gameObjects[i].addForce(new Vector(0, 0.05));
    
	
	
  }
 
}
