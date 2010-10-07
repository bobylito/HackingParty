//Experience 1 : playing with canvas
(function(){
//Variables globales
var dataStore = {};
//Clefs du datastore
var CANON_OK = "CANON_OK";
var CANVAS_H = "CANVAS_H";
var CANVAS_W = "CANVAS_W";
var CANVAS_CONTEXT = "CANVAS_CTX";
var SHIP_H="SHIP_H";
var SHIP_W="SHIP_W";
var PLAYER="PLAYER";
var BG_COLOR="BG_COLOR";
var STAR_COLOR="STAR_COLOR";
var PARTICLES="PARTICLES";
var WEAPONS="WEAPONS";
var MONSTER_OUNO_IMG="MONSTER_OUNO_IMG";
var MONSTER_OUNO_H="MONSTER_OUNO_H";
var MONSTER_OUNO_W="MONSTER_OUNO_W";
var MONSTER_ASTEROIDE_IMG="MONSTER_ASTEROIDE_IMG";
var MONSTER_ASTEROIDE_H="MONSTER_ASTEROIDE_H";
var MONSTER_ASTEROIDE_W="MONSTER_ASTEROIDE_W";
var MONSTERS="MONSTERS";
var SCORE="SCORE";
//Initialisation du dataStore
dataStore[CANON_OK]=true;
dataStore[BG_COLOR]="#000";
dataStore[STAR_COLOR]="rgba(255,255,255,0.6)";
dataStore[PARTICLES]=[];
dataStore[WEAPONS]=[];
dataStore[SCORE]=0;

var LEFT_BORDER=0;
var TOP_BORDER=1;
var RIGHT_BORDER=2;
var BOTTOM_BORDER=3;

var NPC="NPC";
var PC="PC";

var loadCount = 0;

function registerImageRequest(uri, callback){
	var domImage = new Image();
    domImage.src = uri;
    loadCount++;
    domImage.onload = function(){
    	callback(domImage);
    	loadCount--;
    }
}

function play(){
    var canvasDom = document.getElementById("jeu");
    
    var canvasCtx = canvasDom.getContext("2d");
    dataStore[CANVAS_H]=canvasDom.height;
    dataStore[CANVAS_W]=canvasDom.width;
    dataStore[CANVAS_CONTEXT]=canvasCtx;
    
    var universe = createUniverse(100);
    var spaceShip = createSpaceShip();
    
    var ctrlKey = false, keyRight = false, keyLeft = false, keyUp=false, keyDown = false, pause = false;
    
    registerImageRequest(spaceShip.imgSrc, function(image){
		spaceShip.img = image;
		dataStore[SHIP_H]=image.height;
		dataStore[SHIP_W]=image.width;
    });
    
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
    dataStore[PLAYER]=spaceShip;
    
    registerImageRequest("ouno.png", function(image){
    	dataStore[MONSTER_OUNO_IMG]=image;
    	dataStore[MONSTER_OUNO_H]=image.height;
    	dataStore[MONSTER_OUNO_W]=image.width;
    });
    
    registerImageRequest("asteroide.png", function(image){
    	dataStore[MONSTER_ASTEROIDE_IMG]=image;
		dataStore[MONSTER_ASTEROIDE_H]=image.height;
		dataStore[MONSTER_ASTEROIDE_W]=image.width;
    });
    
    canvasDom.addEventListener("click", function(){
        pause = pause?false:true;
    }, true);
    
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
    }, true);
    
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
    }, true);
        
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
    
    var weapons=dataStore[WEAPONS];
    
    dataStore[MONSTERS]=[];
    
    var stepVague = 0;
    
    var mainLoop = function(){
    	var t1 = (new Date()).getTime();
    	if(loadCount>0){
    		
    	}
        else if(dataStore[PLAYER].vie<0){
			resetScreen(canvasCtx);
            animateUniverse(universe);
    		canvasCtx.fillStyle = "rgb(255,255,255)";
			
            renderUniverse(universe, canvasCtx);
			
			canvasCtx.font = "10pt Arial";
			canvasCtx.textAlign="center";
			canvasCtx.fillText("Your score is "+dataStore[SCORE], dataStore[CANVAS_W]*0.5, dataStore[CANVAS_H]*0.4);
			canvasCtx.font = "20pt Arial";
			canvasCtx.fillText("Game over", dataStore[CANVAS_W]*0.5, dataStore[CANVAS_H]*0.51);
			canvasCtx.font = "10pt Arial";
			canvasCtx.fillText("Please insert coins (or press F5)", dataStore[CANVAS_W]*0.5, dataStore[CANVAS_H]*0.6);
			
			animateUniverse(universe);
        }
        else if(pause){
            canvasCtx.font = "20pt Arial";
			canvasCtx.textAlign="center";
			canvasCtx.fillText("Pause", dataStore[CANVAS_W]*0.5, dataStore[CANVAS_H]*0.5);
        }
        else {
            if(ctrlKey){
            	var m = createPlayerMissile(spaceShip.x, spaceShip.y);
            	if(m!==undefined){
                	dataStore[WEAPONS].push(m);
                }
            }
            if(dataStore[MONSTERS].length==0){
            	switch(stepVague){
            		case 0:
	            		dataStore[MONSTERS] = createSomeBadGuys([{x:50, y:-40}, {x:100, y:-120}, {x:150, y:-200}, {x:200, y:-280}, {x:250, y:-360}], movePatterns.simpleComeAndGoDownLeft, 2,"ouno");
	            		stepVague++;
	            		break;
	            	case 1:
	            		dataStore[MONSTERS] = createSomeBadGuys([{x:-50, y:30}, {x:-50, y:90}, {x:-50, y:150}], movePatterns.toCenterFromLeftBorder,2,"ouno");
	            		dataStore[MONSTERS] = dataStore[MONSTERS].concat(createSomeBadGuys([{x:500, y:0}, {x:500, y:60}, {x:500, y:120}], movePatterns.toCenterFromRightBorder,2,"ouno"));
	            		stepVague++;
	            		break;
	            	case 2:
	            		dataStore[MONSTERS] = createSomeBadGuys([{x:10, y:-130}, {x:100, y:-190}, {x:160, y:-160}, {x:250, y:-210}, {x:300, y:-180}], movePatterns.simpleDown, 1,"asteroide");
	            		stepVague=0;
	            		break;
            	}
            	
            }
            
            checkCollisions(dataStore[WEAPONS], dataStore[MONSTERS], spaceShip);
            
            resetScreen(canvasCtx);
            
            renderUniverse(universe, canvasCtx);
            renderParticles();
            renderAllBadGuys(dataStore[MONSTERS], canvasCtx);
            spaceShip.render();
            renderMissiles(dataStore[WEAPONS], canvasCtx);
            renderHUD();
            
            dataStore[WEAPONS] = animateMissiles(dataStore[WEAPONS]);
            animateSpaceShip();
            animateUniverse(universe);
            dataStore[MONSTERS] = animateAllBadGuys(dataStore[MONSTERS]);
            animateParticles();
        }
        setTimeout(mainLoop, Math.max(0, 30-((new Date()).getTime()-t1)));
    };
    mainLoop();
    
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
	var restarting = false;
	var iterBlink=0;
    var spaceShip = { 
    	x : Math.floor(dataStore[CANVAS_W]/2),
    	y : 250,
    	imgSrc: "spaceShip.png",
    	inertieX : 0,
    	inertieY : 0,
    	vie:3,
    	speed:1.5,
    	xBorder: function(dx){},
        moveLeft: function(){
            var finalPos = this.x-this.speed;
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
            var finalPos = this.x+this.speed;
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
            var finalPos = this.y-this.speed;
            if(finalPos <= 0){
                this.y = 0;
            }
            else {
                this.y = finalPos;
            }
            this.inertieY = Math.max(this.inertieY-1, -5)
        }, 
        moveDown: function(){
            var finalPos = this.y-this.speed;
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
        render: function(){
      		var canvasCtx=dataStore[CANVAS_CONTEXT];
            canvasCtx.drawImage(spaceShip.img, this.x, this.y);
            var oldFunc = this.render;
            if(restarting && iterBlink++>3){
            	var i = 0;
            	iterBlink = 0;
				this.render = function(){
					if(i++>3){
						this.render=oldFunc;
					}
				}
            }
        } ,
        registerXBorderCallback: function(xCallbackFunc){
        	this.xBorder = xCallbackFunc;
        },
        getRectangleZone: function(){
        	return [
				this.x,
				this.y,
				this.x+dataStore[SHIP_H],
				this.y+dataStore[SHIP_W]
			];
        },
        collide : function(ennemi){
        	if(!restarting){
	   			addParticle(this.x,this.y,25,particleComportement.explosion);
			    this.x = Math.floor(dataStore[CANVAS_W]/2);
			    this.y = 250;
			    this.vie--;
			    restarting=true;
			    setTimeout(function(){ restarting=false; }, 3000);
		    	ennemi.collide(this);
	        }
        }
        };
    return spaceShip;
}

/**
	vecteur : objet de la forme {dx,dy}
*/
function createMissile(xPos, yPos, vecteur, type){
	var m = {
		x:xPos,
		y:yPos,
		destroy:false,
		v:vecteur, 
		collide:function(badGuy){
			this.destroy=true;
		}
	};
	switch (type){
		case 1:
			var step = 1;
			m.render = function(canvasCtx){
				canvasCtx.fillStyle = "#F0F";
				canvasCtx.beginPath();
				canvasCtx.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
				canvasCtx.closePath();
				canvasCtx.fill();
			};
			m.animate = function(){
				if(this.destroy){
					return false;
				}
				this.y+=vecteur.dy;
				this.x+=vecteur.dx+(Math.cos(step)*2);
				step+=0.5;
				addParticle(this.x-10,this.y,20,particleComportement.explosion2);
				return this.y>0 && this.y<dataStore[CANVAS_H];
			};
			m.getRectangleZone = function(){
				return [
					this.x-5,
					this.y-5,
					this.x+5,
					this.y+5
				];
			};
		break;
	}
	return m;
}

function createPlayerMissile(xPos, yPos){	
	var canonOK = dataStore[CANON_OK];
	if(canonOK){
		dataStore[CANON_OK] = false;
		setTimeout(function(){dataStore[CANON_OK] = true}, 300);
		var ball = createMissile(xPos+10, yPos-6,{dx:0,dy:-10},1);
		ball.origin=PC;
		return ball;
	}
	return undefined;
}

function createBadguyMissile(xPos, yPos){	
	var ball = createMissile(xPos, yPos,{dx:0,dy:12},1);
	ball.origin=NPC;
	return ball;
}

function animateMissiles(missileArray){
    var resMissileArray = [];
    var nb = missileArray.length;
    for(var i=0; i < nb; i++){
        var missile = missileArray.pop();
        if(missile.animate()){
            resMissileArray.push(missile);
        }
    }
    return resMissileArray;
}

function renderMissiles(missileArray, canvasCtx){
    for(var i=0; i<missileArray.length; i++){
        missileArray[i].render(canvasCtx);
    }
}

var movePatterns = {
	simpleDown:function(badGuy){
		return {x:badGuy.x, y:badGuy.y+5};
	},
	simpleRight:function(badGuy){
		return {x:badGuy.x+5, y:badGuy.y}
	},
	simpleLeft:function(badGuy){
		return {x:badGuy.x-5, y:badGuy.y}
	},
	simpleRightDown:function(badGuy){
		return {x:badGuy.x+3, y:badGuy.y+5}
	},
	simpleLeftDown:function(badGuy){
		return {x:badGuy.x-3, y:badGuy.y+5}
	},
	simpleComeAndGoDownLeft:function(badGuy){
		if(badGuy.y<dataStore[CANVAS_H]*0.25){
			return movePatterns.simpleDown(badGuy);
		}
		else if(badGuy.y>=dataStore[CANVAS_H]*0.25 && badGuy.x<dataStore[CANVAS_W]*0.75){
			return movePatterns.simpleRight(badGuy);
		}
		else if(badGuy.x>=dataStore[CANVAS_W]*0.75){
			return movePatterns.simpleDown(badGuy);
		}
	},
	toCenterFromLeftBorder:function(badGuy){
		badGuy.state=0;
		badGuy.movePattern=function(badGuy2){
			switch(badGuy2.state){
				case 0:
					if(badGuy.x>=dataStore[CANVAS_W]*0.5){
						badGuy2.state=1;
					}
					return movePatterns.simpleRight(badGuy2);
				case 1:
					if(badGuy.y>=dataStore[CANVAS_H]*0.75){
						badGuy2.state=2;
					}
					return movePatterns.simpleDown(badGuy2);
				case 2:
					return movePatterns.simpleLeft(badGuy2);
			}
		}
		return badGuy.movePattern(badGuy);
	},
	toCenterFromRightBorder:function(badGuy){
		badGuy.state=0;
		badGuy.movePattern=function(badGuy2){
			switch(badGuy2.state){
				case 0:
					if(badGuy.x<=dataStore[CANVAS_W]*0.5){
						badGuy2.state=1;
					}
					return movePatterns.simpleLeft(badGuy2);
				case 1:
					if(badGuy.y>=dataStore[CANVAS_H]*0.75){
						badGuy2.state=2;
					}
					return movePatterns.simpleDown(badGuy2);
				case 2:
					return movePatterns.simpleRight(badGuy2);
			}
		}
		return badGuy.movePattern(badGuy);
	}
};

var badguysCreator={};
badguysCreator.ouno = function(xPos,yPos,movePatternFunc){
	var enteredPlayground = false;
	var moveFunc = movePatternFunc===undefined?movePatterns.simpleDown:movePatternFunc;
	var state = 1;
	var destroy = false;
	var canShoot = true;
	return {
		x:xPos,
		y:yPos,
		height:dataStore[MONSTER_OUNO_H],
		width:dataStore[MONSTER_OUNO_W],
		movePattern:moveFunc,
		render:function(canvasCtx){
			if(enteredPlayground){
	            canvasCtx.drawImage(dataStore[MONSTER_OUNO_IMG], this.x, this.y);
			}
		},
		animate:function(){
			if(destroy){
				return false;
			}
			var finalPos = this.movePattern(this);
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
			this.shoot();
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
		collide : function(other){
			destroy = true;
			addParticle(this.x+this.width/2,this.y+this.height/2,25,particleComportement.explosion);
			dataStore[SCORE]+=100;
			other.collide(this);
		},
		reset : function(){
			this.x = this.origin.x;
			this.y = this.origin.y;
			this.step=undefined;
			this.movePattern=this.initMove;
			enteredPlayground = false;
		},
		shoot:function(){
			var player=dataStore[PLAYER];
			if(canShoot && this.x<player.x+this.width && this.x>player.x){
				dataStore[WEAPONS].push(createBadguyMissile(this.x+10, this.y+25));
				canShoot=false;
				setTimeout(function(){canShoot = true}, 1000);
			}
		}
	};
}
badguysCreator.asteroide = function(xPos,yPos){
	var enteredPlayground = false;
	var moveFunc = movePatterns.simpleDown;
	var destroy = false;
	return {
		x:xPos,
		y:yPos,
		height:dataStore[MONSTER_ASTEROIDE_H],
		width:dataStore[MONSTER_ASTEROIDE_W],
		movePattern:moveFunc,
		render:function(canvasCtx){
			if(enteredPlayground && !this.destroy){
	            canvasCtx.drawImage(dataStore[MONSTER_ASTEROIDE_IMG], this.x, this.y);
			}
		},
		animate:function(){
			if(destroy){
				return false;
			}
			var finalPos = this.movePattern(this);
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
		collide : function(other){
			destroy = true;
			dataStore[SCORE]+=50;
			var xOrig = this.x;
			var yOrig = this.y;
			dataStore[MONSTERS] = dataStore[MONSTERS].concat(createSomeBadGuys([{x:xOrig, y:yOrig}], movePatterns.simpleDown, 1,"smallAsteroide"));
			dataStore[MONSTERS] = dataStore[MONSTERS].concat(createSomeBadGuys([{x:xOrig, y:yOrig}], movePatterns.simpleLeftDown, 1,"smallAsteroide"));
			dataStore[MONSTERS] = dataStore[MONSTERS].concat(createSomeBadGuys([{x:xOrig, y:yOrig}], movePatterns.simpleRightDown, 1,"smallAsteroide"));
			other.collide(this);
		},
		reset:function(){},
		shoot:function(){}
	};
}

badguysCreator.smallAsteroide = function(xPos,yPos,movePatternFunc){
	var enteredPlayground = false;
	var moveFunc = movePatternFunc==undefined?movePatterns.simpleDown:movePatternFunc;
	var destroy = false;
	return {
		x:xPos,
		y:yPos,
		height:dataStore[MONSTER_ASTEROIDE_H]/3,
		width:dataStore[MONSTER_ASTEROIDE_W]/3,
		movePattern:moveFunc,
		render:function(canvasCtx){
			if(enteredPlayground){
	            canvasCtx.drawImage(dataStore[MONSTER_ASTEROIDE_IMG], this.x, this.y, this.width, this.height);
			}
		},
		animate:function(){
			if(destroy){
				return false;
			}
			var finalPos = this.movePattern(this);
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
		collide : function(other){
			destroy = true;
			addParticle(this.x+this.width/2,this.y+this.height/2,25,particleComportement.explosion);
			dataStore[SCORE]+=50;
			other.collide(this);
		},
		reset:function(){},
		shoot:function(){}
	};
}


function createSomeBadGuys(arrayOfInitPos, initDirectionVector, duration, typeOfBadguy){
	var badGuys=[];
	for(var i = 0; i<arrayOfInitPos.length; i++){
		var badGuy = (badguysCreator[typeOfBadguy])(	arrayOfInitPos[i].x , arrayOfInitPos[i].y ,
				initDirectionVector);
		badGuy.duration = duration;
		badGuy.origin = arrayOfInitPos[i];
		badGuy.initMove = initDirectionVector;
		badGuys.push(badGuy);
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
	resBadGuys.toRespawn = arrayOfBG.toRespawn==undefined?[]:arrayOfBG.toRespawn;
	
	for(var i=0; i<lArrayOfBG; i++){
		var currentBG = arrayOfBG.pop();
		if(currentBG.animate()){
			resBadGuys.push(currentBG);
		}
		else if(currentBG.duration-->0){
			currentBG.reset();
			resBadGuys.toRespawn.push(currentBG);
		}
	}
	
	if(resBadGuys.length==0 && resBadGuys.toRespawn.length != 0){
        return resBadGuys.toRespawn;
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
		if(weapons[i].origin!==NPC){
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
		else{
			var zoneSS = spaceShip.getRectangleZone();
			var zoneW = weapons[i].getRectangleZone();
			if( !(zoneSS[TOP_BORDER]>zoneW[BOTTOM_BORDER] || 
					zoneSS[BOTTOM_BORDER]<zoneW[TOP_BORDER] || 
					zoneSS[RIGHT_BORDER]<zoneW[LEFT_BORDER] || 
					zoneSS[LEFT_BORDER]>zoneW[RIGHT_BORDER] )){
				spaceShip.collide(weapons[i]);
			}
		}
	}
	
	for(var j = 0; j<badguys.length; j++){
		var zoneSS = spaceShip.getRectangleZone();
		var zoneBG = badguys[j].getRectangleZone();
		if( !(zoneSS[TOP_BORDER]>zoneBG[BOTTOM_BORDER] || 
				zoneSS[BOTTOM_BORDER]<zoneBG[TOP_BORDER] || 
				zoneSS[RIGHT_BORDER]<zoneBG[LEFT_BORDER] || 
				zoneSS[LEFT_BORDER]>zoneBG[RIGHT_BORDER] )){
			spaceShip.collide(badguys[j]);
		}
	}
}

var particleComportement = {
	explosion: {
		render: function(particle){
			var canvasCtx = dataStore[CANVAS_CONTEXT];
			canvasCtx.fillStyle = "rgba(0,0,0,0)";
			canvasCtx.strokeStyle = "rgba(250,250,250,0.8)";
			canvasCtx.beginPath();
			canvasCtx.arc(particle.x, particle.y, particle.step+1, 0, Math.PI * 2, true);
			canvasCtx.closePath();
			canvasCtx.stroke();
		},
		animate: function(particle){
			particle.step++;
			particle.duration--;
		}
	},
	explosion2: {
		render: function(particle){
			var canvasCtx = dataStore[CANVAS_CONTEXT];
			var fullsize = particle.duration+particle.step;
			var halfsize = fullsize/2;
			var halflife = particle.duration/2;
			
			radgrad = dataStore[CANVAS_CONTEXT].createRadialGradient(particle.x+halfsize,particle.y+halfsize,0,particle.x+halfsize,particle.y+halfsize,halflife);  
			radgrad.addColorStop(0, '#F0F'); 
			radgrad.addColorStop(1, 'rgba(255,0,255,0)');
			canvasCtx.fillStyle = radgrad;
			canvasCtx.fillRect(particle.x,particle.y,particle.step+particle.duration,particle.step+particle.duration);
			canvasCtx.stroke();
		},
		animate: function(particle){
			particle.step+=2;
			particle.duration-=2;
		}
	}
};

function addParticle(x,y,duration,comportement){
	var particle = {x: x, y: y, duration: duration, step:0, comportement: comportement};
	dataStore[PARTICLES].push(particle);
}

function renderParticles(){
	var particles=dataStore[PARTICLES];
	for(var i=0; i<particles.length;i++){
		var part = particles[i];
		part.comportement.render(part);
	}
}

function animateParticles(){
	var particles=dataStore[PARTICLES];
	var nbParticles=particles.length;
	var resParticles=[];
	for(var i=0; i<nbParticles; i++){
		var currentParticle = particles.pop();
		currentParticle.comportement.animate(currentParticle);
		if(currentParticle.duration>0){
			resParticles.push(currentParticle);
		}
	}
	dataStore[PARTICLES]=resParticles;
}

function renderHUD(){
	var canvasCtx = dataStore[CANVAS_CONTEXT];
	var w = dataStore[CANVAS_W];
	var h = dataStore[CANVAS_H];
	var spaceShip = dataStore[PLAYER];
	canvasCtx.fillStyle = "rgba(255,255,255,0.70)";
	canvasCtx.font = "20pt Arial";
	canvasCtx.textAlign="left";
	canvasCtx.fillText(spaceShip.vie, w*1/100, h*99/100);
	
	canvasCtx.textAlign="right";
	canvasCtx.fillText(dataStore[SCORE], w*99/100, h*99/100);
}

play();
})();
