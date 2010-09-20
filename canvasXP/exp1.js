//Experience 1 : playing with canvas

function play(){
	var jqCanvas = $("#jeu");
	var canvasCtx = jqCanvas[0].getContext("2d");
	var x = 75, y = 75, t = 0, dt = 5, bgcolor = "#000", elementColor = "#FFF";
	
	var universe = createUniverse(100);
	var spaceShip = createSpaceShip();
	
	var keyRight = false, keyLeft = false, keyUp=false, keyDown = false, pause = false, loading = true;
	
	spaceShip.img = new Image();
	spaceShip.img.src = spaceShip.imgSrc;
	spaceShip.img.onload = function(){
		loading = false;
	};
	
	jqCanvas.click(function(){
		pause = pause?false:true;
	});
	
	document.onkeydown = function(evt){
		if(evt.keyCode == 39)
			keyRight = true;
		if(evt.keyCode == 37)
			keyLeft = true;
		if(evt.keyCode == 38)
			keyUp = true;
		if(evt.keyCode == 40) 
			keyDown = true;
	};
	
	document.onkeyup = function(evt){
		if(evt.keyCode == 39)
			keyRight = false;
		if(evt.keyCode == 37 ) 
			keyLeft = false;
		if(evt.keyCode == 38)
			keyUp = false;
		if(evt.keyCode == 40) 
			keyDown = false;
	};
	
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
	
	setInterval(function(){
		if(pause || loading){
			
		}
		else {
			canvasCtx.fillStyle = bgcolor;
			canvasCtx.fillRect(0,0,300,300);
		
			canvasCtx.fillStyle = elementColor;
			for(i = 0; i<universe.length; i++){
				canvasCtx.beginPath();
				canvasCtx.arc(universe[i].x,universe[i].y,universe[i].lvl ,0,Math.PI * 2,true);
				canvasCtx.closePath();
				canvasCtx.fill();
			}
			
			animateSpaceShip();
			canvasCtx.drawImage(spaceShip.img, spaceShip.x, spaceShip.y);
			animateUniverse(universe);

		}
	},33)
};

function createUniverse(nbElement){
	universe = [];
	for(i = 0; i<nbElement; i++){
		universe[i] = {x : Math.floor(Math.random()*300),y : Math.floor(Math.random()*300), lvl : Math.floor(Math.random()*3)+1};
	}
	return universe;
}

function createSpaceShip(){
	spaceShip = { x : 150 , y : 250, imgSrc: "spaceship.png", inertieX : 0, inertieY : 0,
		moveLeft: function(){
			var finalPos = this.x-1;
			if(finalPos <= 0){
				this.x = 0;
			}
			else {
				this.x = finalPos;
			}
			this.inertieX = Math.max(this.inertieX-1, -5);
		}, 
		moveRight: function(){
			var finalPos = this.x+1;
			if(finalPos >= 280){
				this.x = 280;
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
			if(finalPos >= 280){
				this.y = 280;
			}
			else{
				this.y = finalPos;
			}
			this.inertieY = Math.min(this.inertieY+1, 5);
		},
		moveInertie: function(){
			this.x = Math.max(Math.min(this.x+this.inertieX, 280), 0);
			this.y = Math.max(Math.min(this.y+this.inertieY, 280), 0);
			//this.inertieX--;
			
		}
		};
	return spaceShip;
}

function animateUniverse(universe){
	for(i = 0; i<universe.length; i++){
		universe[i].y += 2 * universe[i].lvl;
		if(universe[i].y > 300){
			universe[i].y = 0;
			universe[i].lvl = Math.floor(Math.random()*3)+1;
		}
	}
}

play();
