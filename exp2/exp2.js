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
datastore[TICK]=30;
var canvasDom = document.getElementById("scene");
datastore[CANVAS]=canvasDom;
datastore[CANVAS_CTX]=canvasDom.getContext("2d");
datastore[CANVAS_HEIGHT]=canvasDom.height;
datastore[CANVAS_WIDTH]=canvasDom.width;

/*
createTentacule : 
border : one of the border orientation : SOUTH, NORTH, EAST, WEST
pos : % from the left or top depending on the border used
*/
function createBlob( pos){
	var xOrigPos, yOrigPos;
	var context = datastore[CANVAS_CTX];
	var it = 0;
	if(pos===undefined || pos["x"]===undefined || pos["y"]===undefined){
		var pos = {x:50, y:50};
	}
	var res = {
		x:pos.x,
		y:pos.y,
		h:20,
		w:50,
		angle:0,
		render: function(){
			context.save();
			context.beginPath();
			context.lineWidth = 0;
			context.moveTo(this.x, this.y);
			context.fillStyle = "rgba(255,255,255,0.4)";
			//context.translate(this.x+50,this.y+50);
			//context.rotate(this.angle); 
			context.bezierCurveTo(
				this.x,
			    this.h,
				this.x+50,
			    this.h,
			    this.x+50, this.y);
			context.bezierCurveTo(
				this.x+50,
			    this.y+50-this.h,
				this.x,
			    this.y+50-this.h,
			    this.x, this.y);
			context.fill();
			context.restore();
		},
		animate: function(){
			if(it>628){
				it=0;
			}
			this.angle+=0.1;
			this.h=Math.cos(it++/10)*20+5;
			this.x++;
			if(this.x>datastore[CANVAS_WIDTH]){
				return false;
			}
			return true;
		}
	};
	return res;
}


//MAIN LOOP
function createMainLoop(){
	var animations=[];
	var context = datastore[CANVAS_CTX];
	
	var fadeOutScreen = function(){
		context.save();
		context.fillStyle = "rgba(0,0,0,0.2)";
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
loop.registerAnimation(createBlob({x:-50, y:100}));


//Start the loop
loop.start();

})();
