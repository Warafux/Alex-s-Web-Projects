var canvasSize = {x: 800, y: 800};
var speedSlider;
var speed;
var randomButton;
var percentAliveRandom;
var clearButton;
var checkboxRun;
var showCellNumber;
var showGrid;
var showAuxGrid;
var showGridStrokeWeight;
var percentAliveRandomHTML;
var hashLog;
function setup() {
	canvas = createCanvas(canvasSize.x, canvasSize.y);
	world = new World(50, 30);
	world.worldGrid[2][1] = true;
	world.worldGrid[2][2] = true;
	world.worldGrid[2][3] = true;
	world.lifes = 3;
	
	//hash table definition
	hashLog = [];
	
	//speed slider
	speed = 5;
	speedSlider = createSlider(1,20,5);
	speedSlider.size(200,10);
	speedSlider.position(80, canvasSize.y);
	canvas.mouseReleased(function(){frameRate(speed)});
	
	
	//percentAliveRandom
	percentAliveRandom = createSlider(1,100,5);
	percentAliveRandom.size(200,10);
	percentAliveRandom.position(5, canvasSize.y + 100);
	var labelPercetAliveRandom = createP("Percentatge gent viva:");
	labelPercetAliveRandom.position(5, canvasSize.y + 60)
	percentAliveRandomHTML = createP("");
	percentAliveRandomHTML.position(150, canvasSize.y + 60)
	
	
	//start checkbox
	checkboxRun = createCheckbox("RUN", false);
	checkboxRun.position(5, canvasSize.y);
	
	//random butotn
	randomButton = createButton("Generate random pattern");
	randomButton.mousePressed(function(){world.randomValues(percentAliveRandom.value());});
	randomButton.position(5, canvasSize.y + 50);
	
	//clear butotn
	clearButton = createButton("Clear all");
	clearButton.mousePressed(function(){world.clearValues(); hashLog = []});
	clearButton.position(250, canvasSize.y + 50);
	
	//show cell number
	showCellNumber = createCheckbox("Show cell number", false);
	showCellNumber.position(canvasSize.x, 10);
	
	//show grid
	showGrid = createCheckbox("Show grid", true);
	showGrid.position(canvasSize.x, 30);
	
	//show grid
	showAuxGrid = createCheckbox("Show auxiliar grid", false);
	showAuxGrid.position(canvasSize.x + 90, 30);
	
	//grid stroke weight slider
	showGridStrokeWeight = createSlider(1,5,1);
	showGridStrokeWeight.size(200,10);
	showGridStrokeWeight.position(canvasSize.x, 60);
}
function getCellClicked(){
	var x_ = floor(map(mouseX, 0, canvasSize.x, 0, world.w));
	var y_ = floor(map(mouseY, 0, canvasSize.y, 0, world.h));
	//Evito que se pueda modificar otras celdas (las de alrededor invisibles)
	if(x_ > 0 && x_ < world.w - 1 && y_ > 0 && y_ < world.h - 1){
		//Comprueba el CD
		if(!world.worldGridCD[y_][x_]){
			//sin CD
			return {x: x_, y: y_};
		}else{
			//con CD
			return false;
		}
	}else{
		return false;
	}
}
function mouseDragged(){
	
	if(!checkboxRun.checked()){
		frameRate(60);
		var cellClicked = getCellClicked();
		if(cellClicked){
			world.switchState(cellClicked.x, cellClicked.y);
		}
	}
}
function getHash(table){
	var s = JSON.stringify(table);
	return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);    
}
function draw() {
	background(255);
	var config = {
		showCellNumber: showCellNumber.checked(),
		showGrid: showGrid.checked(),
		gridStrokeWeigth: showGridStrokeWeight.value(),
		showAuxGrid: showAuxGrid.checked()
	}
	world.draw(config);
	
	textSize(20);
	fill(0, 102, 153);
	text("Vides: " + world.lifes + ".", 5, 18);
	text("Generació: " + world.generation + ".", 120, 18);
	text("GensPerSecond: " + speed, 300, canvasSize.y);
	
	text("Estat:", 280, 18);
	var worldStatus;
	if(!checkboxRun.checked()){
		worldStatus = "STOPPED";
		fill(255,30,30);
	}else{
		fill(30,255,30);
		worldStatus = "RUNNING";
	}

	text(worldStatus, 330, 18);
	
	if(checkboxRun.checked()){

	
		if(world.lifes > 0){
			//Keep generating
			var nextGen = world.nextGeneration();	
			world.setNewWorldGrid(nextGen);
			
			//Hash logging, para evitar bucles infinitos
			hashLog.push(getHash(world.worldGrid));
			if(hashLog.length == 3){
				if(hashLog[0] == hashLog[2]){
					world.lifes = -1;
				}
				hashLog.splice(0, 3);
				
			}
		}else{
			//Game over por vidas 0 o bucle
				//fondo
				fill(50,50,50);
				rect(0, 0, canvasSize.x, canvasSize.y);
				
				textSize(90);
				fill(200, 50, 50);
				if(world.lifes == 0){
					//texto game over	
					text("GAME OVER", 10, 250);
				}else{
					text("Bucle infinito :l", 10, 250);
				}
				//Statistics
				textSize(30);
				fill(0,0,0);
				text("Generacions: " + world.generation, 50, 280);
				text("Total vides: " + world.stats.totalLifes, 50, 320);
				text("Total morts: " + world.stats.totalDeaths, 50, 360);
				text("Mort per solitud: " + world.stats.deathsLoneliness, 50, 400);
				text("Mort per sobreconcentració: " + world.stats.deathsOverpopulation, 50, 460);
		}
	}
	for(var i = 0; i < hashLog.length; i++){
		text(hashLog[i], 200, 100 + 50*i);
		
	}
	if(speedSlider.value() >= 1 && speedSlider.value() <= 20){
		speed = speedSlider.value();
	}else{
		speed = 1;
	}
	percentAliveRandomHTML.html(percentAliveRandom.value());
	frameRate(speed);
}
