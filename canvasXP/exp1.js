//Experience 1 : playing with canvas
(function(){
//Variables globales
var dataStore = {};
//Clefs du datastore
var CANON_OK = "CANON_OK";
var CANVAS_H = "CANVAS_H";
var CANVAS_W = "CANVAS_W";
var SHIP_H="SHIP_H";
var SHIP_W="SHIP_W";
var BG_COLOR="BG_COLOR";
var STAR_COLOR="STAR_COLOR";
//Initialisation du dataStore
dataStore[CANON_OK]=true;
dataStore[BG_COLOR]="#000";
dataStore[STAR_COLOR]="rgba(255,255,255,0.6)";

var LEFT_BORDER=0;
var TOP_BORDER=1;
var RIGHT_BORDER=2;
var BOTTOM_BORDER=3;

function play(){
    var canvasDom = document.getElementById("jeu");
    
    var canvasCtx = canvasDom.getContext("2d");
    dataStore[CANVAS_H]=canvasDom.height;
    dataStore[CANVAS_W]=canvasDom.width;
    
    var universe = createUniverse(100);
    var spaceShip = createSpaceShip();
    
    var ctrlKey = false, keyRight = false, keyLeft = false, keyUp=false, keyDown = false, pause = false, loading = true;
    
    spaceShip.img = new Image();
    spaceShip.img.src = spaceShip.imgSrc;
    spaceShip.img.onload = function(){
        loading = false;
		dataStore[SHIP_H]=spaceShip.img.height;
		dataStore[SHIP_W]=spaceShip.img.width;
    };
    spaceShip.registerXBorderCallback(
   	function(dx){
		for(var i = 0; i<universe.length; i++){
		    universe[i].x += (dx * universe[i].lvl)*1.2;
		    if(universe[i].x > dataStore[CANVAS_W]){
		        universe[i].x = 0;
		        universe[i].lvl = Math.floor(Math.random()*3)+1;
		    }
			if(universe[i].x < 0){
		        universe[i].x = dataStore[CANVAS_W];
		        universe[i].lvl = Math.floor(Math.random()*3)+1;
		    }
		}
	}
    );
    
    canvasDom.addEventListener("click", function(){
        pause = pause?false:true;
    });
    
    document.addEventListener("keydown", function(evt){
        if(evt.keyCode == 39)
            keyRight = true;
        if(evt.keyCode == 37)
            keyLeft = true;
        if(evt.keyCode == 38)
            keyUp = true;
        if(evt.keyCode == 40) 
            keyDown = true;
        if(evt.keyCode == 32)
            ctrlKey = true;
    });
    
    document.addEventListener("keyup", function(evt){
        if(evt.keyCode == 39)
            keyRight = false;
        if(evt.keyCode == 37 ) 
            keyLeft = false;
        if(evt.keyCode == 38)
            keyUp = false;
        if(evt.keyCode == 40) 
            keyDown = false;
        if(evt.keyCode == 32)
            ctrlKey = false;
    });
        
    function animateSpaceShip(){
        if(keyRight)
            spaceShip.moveRight();
        if(keyLeft)
            spaceShip.moveLeft();
        if(keyDown)
            spaceShip.moveDown();
        if(keyUp)
            spaceShip.moveUp();
        spaceShip.moveInertie();
    }
    
    var weapons=[];
    
    var badguys=[];
    
    setInterval(function(){
        if(pause || loading){
            
        }
        else {
            if(ctrlKey){
            	var m = createMissile(spaceShip.x, spaceShip.y);
            	if(m!==undefined){
                	weapons.push(m);
                }
            }
            
            if(badguys.length==0){
            	badguys = createSomeBadGuys([{x:50, y:-40}, {x:50, y:-100}, {x:50, y:-160}], movePatterns.simpleComeAndGoDownLeft);
            }
            
            checkCollisions(weapons, badguys, spaceShip);
            
            resetScreen(canvasCtx);
            
            renderUniverse(universe, canvasCtx);
            renderAllBadGuys(badguys, canvasCtx);
            
            canvasCtx.drawImage(spaceShip.img, spaceShip.x, spaceShip.y);
            
            renderMissiles(weapons, canvasCtx);
            
            weapons = animateParticles(weapons);
            animateSpaceShip();
            animateUniverse(universe);
            badguys = animateAllBadGuys(badguys);
        }
    },30)
};

function resetScreen(canvasCtx){
	canvasCtx.fillStyle = dataStore[BG_COLOR];
	canvasCtx.fillRect(0,0,dataStore[CANVAS_W],dataStore[CANVAS_H]);
}

function createUniverse(nbElement){
    var universe = [];
    for(var i = 0; i<nbElement; i++){
        universe[i] = {x : Math.floor(Math.random()*dataStore[CANVAS_W]),y : Math.floor(Math.random()*dataStore[CANVAS_H]), 
        	lvl : Math.floor(Math.random()*3)+1};
    }
    return universe;
}

function renderUniverse(universe, canvasCtx){
	canvasCtx.fillStyle = dataStore[STAR_COLOR];
	for(var i = 0; i<universe.length; i++){
		canvasCtx.beginPath();
		canvasCtx.arc(universe[i].x,universe[i].y,universe[i].lvl ,0,Math.PI * 2,true);
		canvasCtx.closePath();
		canvasCtx.fill();
	}
}

function createSpaceShip(){
    spaceShip = { x : 150 , y : 250, imgSrc: "spaceship.png", inertieX : 0, inertieY : 0, xBorder: function(dx){},
        moveLeft: function(){
            var finalPos = this.x-1;
            if(finalPos <= 0){
                this.x = 0;
                this.xBorder(-1);
            }
            else {
                this.x = finalPos;
            }
            this.inertieX = Math.max(this.inertieX-1, -5);
        }, 
        moveRight: function(){
            var finalPos = this.x+1;
            if(finalPos >= dataStore[CANVAS_W] - dataStore[SHIP_W]){
                this.x = dataStore[CANVAS_W] - dataStore[SHIP_W];
                this.xBorder(+1);
            }
            else{
                this.x = finalPos;
            }
            this.inertieX = Math.min(this.inertieX+1, 5);
        },
        moveUp: function(){
            var finalPos = this.y-1;
            if(finalPos <= 0){
                this.y = 0;
            }
            else {
                this.y = finalPos;
            }
            this.inertieY = Math.max(this.inertieY-1, -5)
        }, 
        moveDown: function(){
            var finalPos = this.y-1;
            if(finalPos >= dataStore[CANVAS_H] - dataStore[SHIP_H]){
                this.y = dataStore[CANVAS_H] - dataStore[SHIP_H];
            }
            else{
                this.y = finalPos;
            }
            this.inertieY = Math.min(this.inertieY+1, 5);
        },
        moveInertie: function(){
            this.x = Math.max(Math.min(this.x+this.inertieX, dataStore[CANVAS_W] - dataStore[SHIP_W]), 0);
            this.y = Math.max(Math.min(this.y+this.inertieY, dataStore[CANVAS_H] - dataStore[SHIP_H]), 0);
            this.inertieX/=1.1;
            this.inertieY/=1.1;
            
        },
        registerXBorderCallback: function(xCallbackFunc){
        	this.xBorder = xCallbackFunc;
        }
        };
    return spaceShip;
}



function Missile(xPos, yPos){
    this.x = xPos;
    this.y = yPos;
    this.destroy = false;
}

Missile.prototype.render = function(canvasCtx){
    canvasCtx.fillStyle = "#FF0000";
    canvasCtx.beginPath();
    canvasCtx.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
    canvasCtx.closePath();
    canvasCtx.fill();
};

Missile.prototype.animate = function(){
	if(this.destroy){
		return false;
	}
    this.y = this.y-10;
    return this.y>0;
};

Missile.prototype.getRectangleZone = function(){
	return [
		this.x-5,
		this.y-5,
		this.x+5,
		this.y+5
	];
}

Missile.prototype.collide = function(badGuy){
	this.destroy=true;
}

function createMissile(xPos, yPos){	
	var canonOK = dataStore[CANON_OK];
	if(canonOK){
		dataStore[CANON_OK] = false;
		setTimeout(function(){dataStore[CANON_OK] = true}, 100);
		var ball = new Missile(xPos+10, yPos-6);
		return ball;
	}
	return undefined;
}

function animateParticles(particleArray){
    var resParticleArray = [];
    var nb = particleArray.length;
    for(var i=0; i < nb; i++){
        var particle = particleArray.pop();
        if(particle.animate()){
            resParticleArray.push(particle);
        }
    }
    return resParticleArray;
}

function renderMissiles(particleArray, canvasCtx){
    for(var i=0; i<particleArray.length; i++){
        particleArray[i].render(canvasCtx);
    }
}

var movePatterns = {
	simpleDown:function(currentX,currentY){
		return {x:currentX, y:currentY+5};
	},
	simpleRight:function(currentX,currentY){
		return {x:currentX+5, y:currentY}
	},
	simpleComeAndGoDownLeft:function(currentX,currentY,state){
		if(currentY<dataStore[CANVAS_H]/4){
			return movePatterns.simpleDown(currentX,currentY);
		}
		else if(currentY>=dataStore[CANVAS_H]/4 && currentX<dataStore[CANVAS_W]*3/4){
			return movePatterns.simpleRight(currentX,currentY);
		}
		else if(currentX>=dataStore[CANVAS_W]*3/4){
			return movePatterns.simpleDown(currentX,currentY);
		}
	}
};

function createBadguys(xPos,yPos,movePatternFunc){
	var enteredPlayground = false;
	var moveFunc = movePatternFunc===undefined?movePatterns.simpleDown:movePatternFunc;
	var state = 1;
	var destroy = false;
	return {
		x:xPos,
		y:yPos,
		height:20,
		width:20,
		movePattern:moveFunc,
		render:function(canvasCtx){
			if(enteredPlayground){
				canvasCtx.fillStyle = "rgb(0,255,0)";
	            canvasCtx.fillRect(this.x,this.y,this.width,this.height);
			}
		},
		animate:function(){
			if(destroy){
				return false;
			}
			var finalPos = this.movePattern(this.x, this.y);
			if(enteredPlayground){
				if(finalPos.x > dataStore[CANVAS_W] || finalPos.x < 0-this.width || 
					finalPos.y < 0-this.height || finalPos.y > dataStore[CANVAS_H]){
					return false;
				}
			}
			else{
				if(		finalPos.x < dataStore[CANVAS_W] && 
						finalPos.x > 0-this.width && 
						finalPos.y > 0-this.height && 
						finalPos.y < dataStore[CANVAS_H]){
					enteredPlayground = true;
				}
			}
			this.x = finalPos.x;
			this.y = finalPos.y;
			return true;
		},
		getRectangleZone: function(){
			return [
				this.x,
				this.y,
				this.x+this.width,
				this.y+this.height
			];
		},
		collide : function(weapon){
			destroy = true;
			weapon.collide(this);
		}
	};
}

function createSomeBadGuys(arrayOfInitPos, initDirectionVector){
	var badGuys=[];
	for(var i = 0; i<arrayOfInitPos.length; i++){
		badGuys.push(
			createBadguys(
				arrayOfInitPos[i].x ,
				arrayOfInitPos[i].y ,
				initDirectionVector));
	}
	return badGuys;
}

function renderAllBadGuys(arrayOfBG, canvasCtx){
	for(var i=0; i<arrayOfBG.length; i++){
		arrayOfBG[i].render(canvasCtx);
	}	
}

function animateAllBadGuys(arrayOfBG){
	var lArrayOfBG = arrayOfBG.length;
	var resBadGuys = [];
	for(var i=0; i<lArrayOfBG; i++){
		var currentBG = arrayOfBG.pop();
		if(currentBG.animate()){
			resBadGuys.push(currentBG);
		}
	}
	return resBadGuys;
}

function animateUniverse(universe){
    for(var i = 0; i<universe.length; i++){
        universe[i].y += 2 * universe[i].lvl;
        if(universe[i].y > dataStore[CANVAS_H]){
            universe[i].y = 0;
            universe[i].lvl = Math.floor(Math.random()*3)+1;
        }
    }
}

function checkCollisions(weapons, badguys, spaceShip){
	for(var i = 0; i<weapons.length; i++){
		for(var j = 0; j<badguys.length; j++){
			var zoneW = weapons[i].getRectangleZone();
			var zoneBG = badguys[j].getRectangleZone();
			if( !(zoneW[TOP_BORDER]>zoneBG[BOTTOM_BORDER] || 
					zoneW[BOTTOM_BORDER]<zoneBG[TOP_BORDER] || 
					zoneW[RIGHT_BORDER]<zoneBG[LEFT_BORDER] || 
					zoneW[LEFT_BORDER]>zoneBG[RIGHT_BORDER] )){
				badguys[j].collide(weapons[i]);
			}
		}
	}
}

play();
})();
