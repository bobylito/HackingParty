//Exp2 : come get some bezier

(function(){
//Constants 
var SOUTH=1, NORTH=2, EAST=3, WEST=4;

//global storage of some interesting infos
var datastore=[];
//keys to the global array
var CANVAS="CANVAS";
var CANVAS_CTX="CANVAS_CTX"; //Contexte canvas
var CANVAS_HEIGHT="CANVAS_HEIGHT";
var CANVAS_WIDTH="CANVAS_WIDTH";
var TICK="TICK"; //Prefered max time elapsed between two frames
//Init some values
datastore[TICK]=25;
var canvasDom = document.getElementById("scene");
datastore[CANVAS]=canvasDom;
datastore[CANVAS_CTX]=canvasDom.getContext("2d");
datastore[CANVAS_HEIGHT]=canvasDom.height;
datastore[CANVAS_WIDTH]=canvasDom.width;



function createBlob(pos, amplitude, width, height){
	var xOrigPos, yOrigPos;
	var context = datastore[CANVAS_CTX];
	var it = 0;
	if(pos===undefined || pos["x"]===undefined || pos["y"]===undefined){
		var pos = {x:50, y:50};
	}
	if(amplitude===undefined){
		var amplitude = 20;
	}
	if(height===undefined){
		var height = 30;
	}
	if(width===undefined){
		var width = 50;
	}
	var res = {
		x:pos.x,
		y:pos.y,
		h:height,
		dh:0,
		w:width,
		angle:0,
		render: function(){
			context.save();
			context.beginPath();
			context.lineWidth = 0;
			context.moveTo(this.x, this.y);
			var lineargradient = context.createLinearGradient(this.x,this.y,this.x,this.y+this.w);  
			lineargradient.addColorStop(0,'rgba(255,255,255,0.6)');  
			lineargradient.addColorStop(1,'rgba(200,200,255,0.2)');  
			context.fillStyle = lineargradient;
			var d = (this.h-this.dh);
	    
			context.bezierCurveTo(
				this.x-d,
			    this.y,
				this.x-d,
			    this.y+this.w,
			    this.x-(this.w/2), this.y+this.w);
			context.quadraticCurveTo(
				this.x,
				this.y+this.w-d/6,
				this.x+(this.w/2), this.y+this.w
			);
			
			context.bezierCurveTo(
				this.x+d,
			    this.y+this.w,
			    this.x+d,
			    this.y,
				this.x, this.y);

			context.fill();
			context.restore();
		},
		animate: function(){
			if(it>628){
				it=0;
			}
			this.dh=Math.cos(it++/10)*amplitude+2;
			this.y--;
			return !(this.y<-this.w);
		}
	};
	return res;
}

/*
//WIP : Not yet interesting

function createSeaWeed(pos){
	var context = datastore[CANVAS_CTX];
	
	var res = {
		x:pos.x,
		y:pos.y,
		dx:0,
		dy:0,
		render: function(){
			context.save();
			context.beginPath();
			context.lineWidth = 0;
			context.moveTo(datastore[CANVAS_WIDTH], datastore[CANVAS_HEIGHT]);
			
			context.fillStyle = "#FFF";
			
			context.lineTo(datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]-10);
			
			context.bezierCurveTo(
				this.x+this.dx,
			    this.y+this.dy,
				datastore[CANVAS_WIDTH],
			    datastore[CANVAS_HEIGHT]-10,
			    this.x, this.y);
			context.bezierCurveTo(
				datastore[CANVAS_WIDTH]-10,
			    datastore[CANVAS_HEIGHT],
			    this.x+this.dx,
			    this.y+this.dy,
				datastore[CANVAS_WIDTH]-10, datastore[CANVAS_HEIGHT]);
			
			context.lineTo(datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);

			context.fill();
			context.restore();
		},
		animate: function(){
			//this.dx=Math.cos(this.dx + 1)*10;
			//this.dy=Math.sin(this.dy + 1)*10;
			return true;
		}
	};
	return res;
}
*/

//MAIN LOOP
function createMainLoop(){
	var animations=[];
	var context = datastore[CANVAS_CTX];
	
	var fadeOutScreen = function(){
		context.save();
		var lineargradient = context.createLinearGradient(0,0,0,datastore[CANVAS_HEIGHT]);  
		lineargradient.addColorStop(0,'rgba(0,0,30,0.2)');  
		lineargradient.addColorStop(1,'rgba(0,0,70,0.2)');  
		context.fillStyle = lineargradient;
		context.fillRect(0,0,datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);
		context.restore();
	};
	
	var loop = function(){
		var t1 = (new Date()).getTime();
		fadeOutScreen();
		for(var i = animations.length-1; i>=0; i--){
			animations[i].render();
		}
		for(var i = animations.length-1; i>=0; i--){
			if(!animations[i].animate()){
				animations.splice(i,1);
			}
		}
		var t2 = (new Date()).getTime();
		var delta = t2-t1;
		setTimeout(loop, Math.max(0, datastore[TICK]-delta));
	};
	
	return {
		start: function(){
			context.save();
			context.fillStyle = "#000";
			context.fillRect(0,0,datastore[CANVAS_WIDTH],datastore[CANVAS_HEIGHT]);
			context.restore();
			loop();
		},
		registerAnimation: function(animation){
			animations.push(animation);
		}
	};
}


var loop = createMainLoop()

//instanciate animations
loop.registerAnimation(createBlob({y:-50, x:100}, 10, 20, 20));

//loop.registerAnimation(createSeaWeed({x:datastore[CANVAS_WIDTH]-50, y:datastore[CANVAS_HEIGHT]-50}));

setInterval(function(){
	var randX = Math.random()*datastore[CANVAS_WIDTH];
	var randSizeFactor = Math.random()+1;
	loop.registerAnimation(createBlob({y: datastore[CANVAS_HEIGHT]+20, x: randX}, 5*randSizeFactor, 20*randSizeFactor, 20*randSizeFactor));
}, 400);

//Start the loop
loop.start();

})();
