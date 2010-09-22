//Experience 1 : playing with canvas
jQuery(function(){
//Variables globales
var dataStore = {};
//Clefs du datastore
var CANON_OK = "CANON_OK";
var CANVAS_H = "CANVAS_H";
var CANVAS_W = "CANVAS_W";
var SHIP_H="SHIP_H";
var SHIP_W="SHIP_W";
//Initialisation du dataStore
dataStore[CANON_OK] = true;

function play(){
    var jqCanvas = $("#jeu");
    var jqDocument = $(document);
    
    var canvasCtx = jqCanvas[0].getContext("2d");
    dataStore[CANVAS_H]=jqCanvas[0].height;
    dataStore[CANVAS_W]=jqCanvas[0].width;
    
    var bgcolor = "#000", elementColor = "#FFF";
    
    var universe = createUniverse(100);
    var spaceShip = createSpaceShip();
    
    var ctrlKey = false, keyRight = false, keyLeft = false, keyUp=false, keyDown = false, pause = false, loading = true;
    
    spaceShip.img = new Image();
    spaceShip.img.src = spaceShip.imgSrc;
    spaceShip.img.onload = function(){
        loading = false;
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
    dataStore[SHIP_H]=spaceShip.img.height;
    dataStore[SHIP_W]=spaceShip.img.width;
    
    jqCanvas.click(function(){
        pause = pause?false:true;
    });
    
    jqDocument.keydown(function(evt){
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
    
    jqDocument.keyup(function(evt){
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
            canvasCtx.fillStyle = bgcolor;
            canvasCtx.fillRect(0,0,dataStore[CANVAS_W],dataStore[CANVAS_H]);
        
            canvasCtx.fillStyle = elementColor;
            for(var i = 0; i<universe.length; i++){
                canvasCtx.beginPath();
                canvasCtx.arc(universe[i].x,universe[i].y,universe[i].lvl ,0,Math.PI * 2,true);
                canvasCtx.closePath();
                canvasCtx.fill();
            }
            canvasCtx.drawImage(spaceShip.img, spaceShip.x, spaceShip.y);
            
            renderParticles(weapons, canvasCtx);
            
            weapons = animateParticles(weapons);
            animateSpaceShip();
            animateUniverse(universe);
        }
    },30)
};

function createUniverse(nbElement){
    var universe = [];
    for(var i = 0; i<nbElement; i++){
        universe[i] = {x : Math.floor(Math.random()*dataStore[CANVAS_W]),y : Math.floor(Math.random()*dataStore[CANVAS_H]), 
        	lvl : Math.floor(Math.random()*3)+1};
    }
    return universe;
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
}

Missile.prototype.render = function(canvasCtx){
    canvasCtx.fillStyle = "#FF0000";
    canvasCtx.beginPath();
    canvasCtx.arc(this.x, this.y, 5, 0, Math.PI * 2, true);
    canvasCtx.closePath();
    canvasCtx.fill();
};

Missile.prototype.animate = function(){
    this.y = this.y-10;
    return this.y>0;
};

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
    for(var i=0; i<nb; i++){
        var particle = particleArray.pop();
        if(particle.animate()){
            resParticleArray.push(particle);
        }
    }
    return resParticleArray;
}

function renderParticles(particleArray, canvasCtx){
    for(var i=0; i<particleArray.length; i++){
        particleArray[i].render(canvasCtx);
    }
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

play();
});
