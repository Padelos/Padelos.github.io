var gl; 
var canvas; 
var shadersProgram; 
var vertexPositionAttributePointer;

var verticesTransformUniformPointer;

var modelUniformPointer; 
var perspectiveViewUniformPointer;

var textureCoordinatesAttributePointer;
var uSamplerPointer;

/* Texture Buffers */
var textureBuffer;
var faceTextureBuffer;
var skyTextureBuffer;

/* Cube Verticies in triangle cords XYZ */
var triangleVertices;
/* Cube Reverse (ClockWise) Verticies in triangle cords XYZ to keep face culling and be able to draw the sky*/
var reverseTriangleVertices;

/* Cube buffers */
var vertexBuffer;
var reverseVertexBuffer;

var angleView = 90; // degrees
var viewDistance = 7;

/* Animation */
var requestID = 0;
/* To stop int when toucing canvas */
var beforeRequestID = 0;

/* When playing the animation add +1 */
var rotateAngle = 0.0;
/* cameraCords function change this based on the identifier
   to 0+45 or 90+45 or 180+45 or 270+45 in order to get an 
   right angle using cos and sin
*/
var offsetAngle = 45.0;
/* To add height when animation is playing */
var totalZ = 0.0;

/* loaded textures */
var faceTexture;
var skinTexture;
var skyTexture;
var floorTexture;

/* to find mouse cords on canvas */
var boundingRect;
/* when mouse click is triggered */
var mouseDown = false;
/* after/current cords*/
var aMouseX;
var aMouseY;
/* before/previous cords */
var bMouseX;
var bMouseY;
/* distance from aMouse to bMouse from two last frames */
var dX = 0;
var dY = 0;
/* the total summation of dX and dY */
var totalDX = 0;
var totalDY = 0;

/* if using the scroll wheel */
var scrollActive = false;
/* if screen is touched */
var touchDown = false;


/* each objects and their types to help create the animations
   
   WARNING!!! some of the atributes of other objects may be in
   use for other object. It's not a mistake.
*/
var headObj = {totalAngle:0, stepAngle:2, times:0, rotAxis:[0, 0, 1]};
var earObj  = {totalAngle:0, stepAngle:2, times:0, rotAxis:[0, 0, 1]};
var neckObj = {totalAngle:0, stepAngle:2, times:0, rotAxis:[0, 0, 1]};
var bodyObj = {totalAngle:0, stepAngle:2, times:0, rotAxis:[1, 0, 0], totalScale:1, scaleStep:0.01, scaleAxis:[0,1,0],totalMove:0, moveStep:0.2};
var tailObj = {totalAngle:0, stepAngle:2, times:0, rotAxis:[1, 0, 0]};
var legObj  = {totalAngle:0, stepAngle:2, times:0, rotAxis:[1, 0, 0], totalMove:0, moveStep:(0.05)};
var feetObj = {totalAngle:0, stepAngle:-2,times:0, rotAxis:[1, 0, 0], totalMove:0, moveStep:(-0.09), totalScale:1, scaleStep:0.05, scaleAxis:[1,1,0]};


function createRenderingContext(inCanvas) {
	var outContext = null;
	outContext = inCanvas.getContext("webgl");  
	if (!outContext)
		outContext = inCanvas.getContext("experimental-webgl"); 
	if (!outContext) 
			alert("WebGL rendering context creation error.");
	return outContext;
}
     
function createCompileShader(shaderType, shaderSource) {
	var outShader = gl.createShader(shaderType);  
	gl.shaderSource(outShader, shaderSource); 
	gl.compileShader(outShader); 
	if (!gl.getShaderParameter(outShader, gl.COMPILE_STATUS)) { 
		alert( "Shader compilation error. " + gl.getShaderInfoLog(outShader) );
		gl.deleteShader(outShader);
		outShader = null;
	}
	return outShader;
}  

function initShaders() {
	var vertexShaderSource = document.getElementById("vShader").textContent; 
	
	var fragmentShaderSource = document.getElementById("fShader").textContent; 
	
	var vertexShader = createCompileShader(gl.VERTEX_SHADER, vertexShaderSource); 
	
	var fragmentShader = createCompileShader(gl.FRAGMENT_SHADER, fragmentShaderSource); 
	
	shadersProgram = gl.createProgram(); 
	
	gl.attachShader(shadersProgram, vertexShader); 		
	gl.attachShader(shadersProgram, fragmentShader); 	
	gl.linkProgram(shadersProgram); 					
	if (!gl.getProgramParameter(shadersProgram, gl.LINK_STATUS)) {
		alert("Shaders linking error.");
	}
	gl.useProgram(shadersProgram); 
	vertexPositionAttributePointer = gl.getAttribLocation(shadersProgram, "aVertexPosition"); 
	gl.enableVertexAttribArray(vertexPositionAttributePointer);
	verticesTransformUniformPointer = gl.getUniformLocation(shadersProgram, "uRotationMatrixX");
	
	modelUniformPointer = gl.getUniformLocation(shadersProgram, "uModelTransform"); 
	perspectiveViewUniformPointer = gl.getUniformLocation(shadersProgram, "uPerspectiveViewTransform"); 
	
	textureCoordinatesAttributePointer = gl.getAttribLocation(shadersProgram, "aTextureCoordinates");
	gl.enableVertexAttribArray(textureCoordinatesAttributePointer);
	
	uSamplerPointer = gl.getUniformLocation(shadersProgram, "uSampler");
	
}

function initBuffers() {
	
	triangleVertices = new Float32Array([
							// Top
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0, -1.0,  1.0, 1.0,	// v2
							
							 1.0,  1.0,  1.0, 1.0,	// v0
 							-1.0, -1.0,  1.0, 1.0,	// v2
  							 1.0, -1.0,  1.0, 1.0,	// v3
							 
							// Right
							 1.0,  1.0,  1.0, 1.0,	// v0
  							 1.0, -1.0,  1.0, 1.0,	// v3
							 1.0, -1.0, -1.0, 1.0,	// v4
							
							 1.0,  1.0,  1.0, 1.0,	// v0
							 1.0, -1.0, -1.0, 1.0,	// v4
							 1.0,  1.0, -1.0, 1.0,	// v5
							
							// Left
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0, -1.0, -1.0, 1.0,	// v7
							-1.0, -1.0,  1.0, 1.0,	// v2
							
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0,  1.0, -1.0, 1.0,	// v6
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							// Bottom
							 1.0,  1.0, -1.0, 1.0,	// v5
							 1.0, -1.0, -1.0, 1.0,	// v4
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							
							-1.0,  1.0, -1.0, 1.0,	// v6
							 1.0,  1.0, -1.0, 1.0,	// v5
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							// Front
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0,  1.0, -1.0, 1.0,	// v6
							-1.0,  1.0,  1.0, 1.0,	// v1
							
							 1.0,  1.0,  1.0, 1.0,	// v0
							 1.0,  1.0, -1.0, 1.0,	// v5
							-1.0,  1.0, -1.0, 1.0,	// v6
							
							// Back
							 1.0, -1.0, -1.0, 1.0,	// v4
  							 1.0, -1.0,  1.0, 1.0,	// v3
 							-1.0, -1.0,  1.0, 1.0,	// v2
							 
							 1.0, -1.0, -1.0, 1.0,	// v4
 							-1.0, -1.0,  1.0, 1.0,	// v2
							-1.0, -1.0, -1.0, 1.0	// v7
						]);
	vertexBuffer = gl.createBuffer();
	vertexBuffer.itemSize = 4;  
	vertexBuffer.itemCount = 36;
	
	// in order to use face culling (we could use indexes from the previous array)
	reverseTriangleVertices = new Float32Array([
							// Top
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0, -1.0,  1.0, 1.0,	// v2
							-1.0,  1.0,  1.0, 1.0,	// v1
							
							 1.0,  1.0,  1.0, 1.0,	// v0
  							 1.0, -1.0,  1.0, 1.0,	// v3
 							-1.0, -1.0,  1.0, 1.0,	// v2
							 
							// Right
							 1.0,  1.0,  1.0, 1.0,	// v0
							 1.0, -1.0, -1.0, 1.0,	// v4
  							 1.0, -1.0,  1.0, 1.0,	// v3
							
							 1.0,  1.0,  1.0, 1.0,	// v0
							 1.0,  1.0, -1.0, 1.0,	// v5
							 1.0, -1.0, -1.0, 1.0,	// v4
							
							// Left
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0, -1.0,  1.0, 1.0,	// v2
							-1.0, -1.0, -1.0, 1.0,	// v7
							
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0, -1.0, -1.0, 1.0,	// v7
							-1.0,  1.0, -1.0, 1.0,	// v6
							
							// Bottom
							 1.0,  1.0, -1.0, 1.0,	// v5
							-1.0, -1.0, -1.0, 1.0,	// v7
							 1.0, -1.0, -1.0, 1.0,	// v4
							
							
							 -1.0,  1.0, -1.0, 1.0,	// v6
							-1.0, -1.0, -1.0, 1.0,	// v7
							 1.0,  1.0, -1.0, 1.0,	// v5
							
							// Front
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0,  1.0,  1.0, 1.0,	// v1
							-1.0,  1.0, -1.0, 1.0,	// v6
							
							 1.0,  1.0,  1.0, 1.0,	// v0
							-1.0,  1.0, -1.0, 1.0,	// v6
							 1.0,  1.0, -1.0, 1.0,	// v5
							
							// Back
							 1.0, -1.0, -1.0, 1.0,	// v4
 							-1.0, -1.0,  1.0, 1.0,	// v2
  							 1.0, -1.0,  1.0, 1.0,	// v3
							 
							 1.0, -1.0, -1.0, 1.0,	// v4
							-1.0, -1.0, -1.0, 1.0,	// v7
 							-1.0, -1.0,  1.0, 1.0	// v2
						]);
	
	reverseVertexBuffer = gl.createBuffer();
	reverseVertexBuffer.itemSize = 4;  
	reverseVertexBuffer.itemCount = 36;

	textureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	
	// skin
	var textureCoordinates=[
							// Top
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,
							
							// Right
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,
							
							// Left
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,
							
							// Bottom
							1.0,1.0,
							0.0,1.0,
							0.0,0.0,
							
							1.0,0.0,
							1.0,1.0,
							0.0,0.0,
							
							// Front
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,
							
							// Back
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),gl.STATIC_DRAW);  
	textureBuffer.itemSize = 2;
	
	faceTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, faceTextureBuffer);
	
	// face
	var faceTextureCoordinates=[
							// Top
							0.0,0.5,
							0.5,0.5,
							0.5,1.0,
							
							0.0,0.5,
							0.5,1.0,
							0.0,1.0,
							
							// Left
							0.0,0.0,
							0.5,0.0,
							0.5,0.5,
							
							0.0,0.0,
							0.5,0.5,
							0.0,0.5,
							
							// Right
							0.5,0.5,
							1.0,1.0,
							1.0,0.5,
							
							0.5,0.5,
							0.5,1.0,
							1.0,1.0,
							
							// Bottom
							1.0,1.0,
							0.5,1.0,
							0.5,0.5,
							
							1.0,0.5,
							1.0,1.0,
							0.5,0.5,
							
							// Front
							0.5,0.0,
							1.0,0.5,
							1.0,0.0,
							
							0.5,0.0,
							0.5,0.5,
							1.0,0.5,
							
							// Back
							0.0,0.0,
							0.5,0.0,
							0.5,0.5,
							
							0.0,0.0,
							0.5,0.5,
							0.0,0.5,];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(faceTextureCoordinates),gl.STATIC_DRAW);  
	faceTextureBuffer.itemSize = 2;
	
	
	skyTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, skyTextureBuffer);
	
	// skin
	var skyTextureCoordinates=[
							// Top
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,
							
							// Left
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,
							
							// Right
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,
							
							// Bottom
							1.0,1.0,
							0.0,0.0,
							0.0,1.0,
							
							1.0,0.0,
							0.0,0.0,
							1.0,1.0,
							
							// Front
							0.0,0.0,
							1.0,0.0,
							1.0,1.0,
							
							0.0,0.0,
							1.0,1.0,
							0.0,1.0,
							
							// Back
							0.0,0.0,
							1.0,1.0,
							1.0,0.0,
							
							0.0,0.0,
							0.0,1.0,
							1.0,1.0,];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(skyTextureCoordinates),gl.STATIC_DRAW);  
	skyTextureBuffer.itemSize = 2;
	faceTexture = gl.createTexture();
	var faceImageURL = "myFace.jpg";
	preprocessTextureImage(faceImageURL, faceTexture);
	
	skinTexture = gl.createTexture();
	var skinImageURL = "mySkin.jpg";
	preprocessTextureImage(skinImageURL, skinTexture);
	
	skyTexture = gl.createTexture();
	var skyImageURL = "mySky.jpg";
	preprocessTextureImage(skyImageURL, skyTexture);
	
	floorTexture = gl.createTexture();
	var floorImageURL = "myFloor.jpg";
	preprocessTextureImage(floorImageURL, floorTexture);
}


function preprocessTextureImage(imageURL, textureObject) {
	var imageObject = new Image();
	imageObject.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, textureObject);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageObject);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
		gl.generateMipmap(gl.TEXTURE_2D);
	};
	imageObject.src = imageURL;
}
  
function drawScene() { 
	
	var pvMatrix = new Float32Array(16);
	glMatrix.mat4.identity(pvMatrix);
	
	var vMatrix = new Float32Array(16);
	
	var cameraView = [1,1,1];
	viewDistance = readFromTextBox("viewDistance");
	
	// Get identifier
	var radioChoise = document.getElementById("cameraViewForm").elements["step3"];
	
	// return for the identifier that is checked the unit circle units in XYZ
	// or in other words returns + or - to get the right angle
	for (var i = 0; i < radioChoise.length; i++) {
		if (radioChoise[i].checked) {
			cameraView = cameraCords(radioChoise[i].value);
			//console.log(cameraView);
			//console.log(radioChoise[i].value);
			break;
		}
	}
	
	// Multiply it to Z axis with distance view
	cameraView[2] *= viewDistance;
	
	// get the right distance based on:
	// (a) the angle of animation
	// (b) the offseetAngle of the identifier
	// (c) the totalD if using the mouse
	cameraView[0] = viewDistance*Math.cos((rotateAngle+offsetAngle+totalDX)*Math.PI/180.0);
	// for Y is the same as before with and addition of bodyObj.totalMove for the total translation
	// so we can be able to follow it when is walking regular
	cameraView[1] = viewDistance*Math.sin((rotateAngle+offsetAngle+totalDX)*Math.PI/180.0) + bodyObj.totalMove; // το προσθεσα για να ακολουθει τον σκυλο οταν περπαταει
	// we reduce τηε Y(of the mouse) by 5 because it's rotating too quick
	cameraView[2] += totalZ + totalDY/5;
	
	
	
	//console.log("rotateAngle:",rotateAngle);
	//console.log("offsetAngle:",offsetAngle);
	//console.log("X:",cameraView[0]);
	//console.log("Y:",cameraView[1]);
	
	// if the dog is not regullarly walking it is looking at 0,0,0 but if the dog is walks
	// it looks at the center of it
	glMatrix.mat4.lookAt(vMatrix,cameraView,[0,0+bodyObj.totalMove,0],[0,0,1]);

	var pMatrix = new Float32Array(16);
	angleView = readFromTextBox("viewAngle");
	glMatrix.mat4.perspective(pMatrix, angleView*Math.PI/180.0, 1, 0.001, 20000);
	
	glMatrix.mat4.multiply(pvMatrix,pMatrix,vMatrix);

	
	gl.uniformMatrix4fv(perspectiveViewUniformPointer, false, pvMatrix);
	
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	drawDog();
}
    
function main() {
	var minDimension = Math.min(window.innerHeight, window.innerWidth);
	canvas = document.getElementById("sceneCanvas");
	//canvas.width = 0.95*minDimension;
	//canvas.height = 0.95*minDimension;
	gl = createRenderingContext(canvas);
	initShaders();
	initBuffers();
	gl.clearColor(0.5, 0.5, 0.5, 1.0);
	
	gl.frontFace(gl.CCW);
	gl.enable(gl.CULL_FACE);
	gl.cullFace(gl.BACK);
	
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	gl.enable(gl.DEPTH_TEST);
	
	boundingRect = canvas.getBoundingClientRect();
	
	drawScene(); 
}

// returns float value from element
function readFromTextBox(id){
	txt = document.getElementById(id).value; 
	return parseFloat(txt);
}

// retunrs XYZ cords in unit circle based on identifier
// and also changes the value of offsetAngle
function cameraCords(token){
	
	switch (token) {
		case "LFT":
			offsetAngle = 45.0;
			return [1, 1, 1];
		case "LFB":
			offsetAngle = 45.0;
			return [1, 1, -1];
		case "LBT":
			offsetAngle = 270.0 + 45.0;
			return [1, -1, 1];
		case "LBB":
			offsetAngle = 270.0 + 45.0;
			return [1, -1, -1];
		case "RFT":
			offsetAngle = 90.0 + 45.0;
			return [-1, 1, 1];
		case "RFB":
			offsetAngle = 90.0 + 45.0;
			return [-1, 1, -1];
		case "RBT":
			offsetAngle = 180.0 + 45.0;
			return [-1, -1, 1];
		case "RBB":
			offsetAngle = 180.0 + 45.0;
			return [-1, -1, -1];
		default:
			offsetAngle = 45.0;
			return [1,1,1];
	}
}

function drawDog(){
	
	var radioChoise = document.getElementById("trick").elements["step10"];
	
	var translationMatrix = new Float32Array(16);
	var scaleMatrix = new Float32Array(16);
	var finalM = new Float32Array(16);
	
	// triangles
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexPositionAttributePointer, vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	// ======================= body =======================
	
	// skin texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, skinTexture);
	gl.uniform1i(uSamplerPointer, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	var x = 0;
	var y = 1;
	var z = 7.5;
	
	glMatrix.mat4.fromScaling(scaleMatrix,[6/2, 14/2, 5/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	else if(radioChoise[8].checked){
		let prevStep = bodyObj.scaleStep;
		finalM = rescalePart(finalM,[0, 1, 7.5],bodyObj,1,[1.5,1])
		if( (prevStep + bodyObj.scaleStep) == 0){
			//console.log("prevStep, bodyObj.scaleStep", prevStep, bodyObj.scaleStep);
			legObj.moveStep *= -1;
			feetObj.moveStep *= -1
		}
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	// ======================= feet =======================

	glMatrix.mat4.fromScaling(scaleMatrix,[3/2, 5/2, 2/2]);
	
	x = 4.5;
	y = 5.5;
	z = 1;
	
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[9].checked){
		finalM = rescalePart(finalM,[-4.5,-8,1],feetObj,4,[1.5,1]);
	}
	else if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[-4.5,-6.5,8],feetObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,feetObj,5)
	}
	
	/* this animation is on different if-else statment, because we use the static
       walk to animate the dog but we want also to make it move regularly and in
	   this statment we only translate it's values*/
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[3].checked){
		//finalM = moveLeg(finalM,[0,4.5,8]);
		finalM = rotatePart(finalM,[0,4.5,8],legObj,2,[90,0]);
	}
	else if(radioChoise[9].checked){
		finalM = rescalePart(finalM,[4.5,3,1],feetObj,4,[1.5,1]);
	}
	else if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[4.5,4.5,8],feetObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[9].checked){
		finalM = rescalePart(finalM,[4.5,-8,1],feetObj,4,[1.5,1]);
	}
	else if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[4.5,-6.5,8],legObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,feetObj,5)
	}
	
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[4].checked){
		//finalM = moveLeg(finalM,[-4.5,4.5,8]);
		finalM = rotatePart(finalM,[-4.5,4.5,8],legObj,2,[90,0]);
	}
	else if(radioChoise[9].checked){
		finalM = rescalePart(finalM,[-4.5,3,1],feetObj,4,[1.5,1]);
	}
	else if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[-4.5,4.5,8],legObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// ======================= legs =======================
	
	x = 4.5;
	y = 4.5;
	z = 5;
	
	glMatrix.mat4.fromScaling(scaleMatrix,[3/2, 3/2, 6/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[3].checked){
		//finalM = moveLeg(finalM,[0,4.5,8]);
		finalM = rotatePart(finalM,[0,4.5,8],legObj,2,[90,0]);
	}
	else if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[4.5,4.5,8],feetObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	

	/* based on animation */
	if(radioChoise[4].checked){
		//finalM = moveLeg(finalM,[-4.5,4.5,8]);
		finalM = rotatePart(finalM,[-4.5,4.5,8],legObj,2,[90,0]);
	}
	else if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[-4.5,4.5,8],legObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	x = 4.5;
	y = 6.5;
	z = 5;
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[4.5,-6.5,8],legObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,feetObj,5)
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,-y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[6].checked || radioChoise[7].checked){
		finalM = rotatePart(finalM,[-4.5,-6.5,8],feetObj,4,[90,-90]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,feetObj,5)
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// ======================= tail =======================

	
	
	x = 0;
	y = -7;
	z = 12.5;
	
	glMatrix.mat4.fromScaling(scaleMatrix,[2/2, 2/2, 5/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[1].checked || radioChoise[9].checked){
		//finalM = moveTail(finalM);
		finalM = rotatePart(finalM,[0,-8,10],tailObj,1,[180,0]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,feetObj,5)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM);
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	// ======================= neck =======================
	
	x = 0;
	y = 4;
	z = 11.5;
	
	glMatrix.mat4.fromScaling(scaleMatrix,[4/2, 4/2, 3/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[2].checked){
		//finalM = moveHead(finalM,[0,4,11.5]);
		finalM = rotatePart(finalM,[0,4,11.5],headObj,4,[90,-90]);
	}
	else if(radioChoise[9].checked){
		//finalM = moveHeadFullRotate(finalM,[0,4,11.5]);
		finalM = rotatePart(finalM,[0,4,11.5],headObj,4,[headObj.totalAngle+1,0]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	
	// ======================= head =======================
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, faceTexture);
	gl.uniform1i(uSamplerPointer, 1);
	gl.bindBuffer(gl.ARRAY_BUFFER, faceTextureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, faceTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	x = 0;
	y = 6;
	z = 15;
	
	
	glMatrix.mat4.fromScaling(scaleMatrix,[6/2, 8/2, 4/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[2].checked){
		//finalM = moveHead(finalM,[0,4,15]);
		finalM = rotatePart(finalM,[0,4,15],headObj,4,[90,-90]);
	}
	else if(radioChoise[9].checked){
		//finalM = moveHeadFullRotate(finalM,[0,4,15]);
		finalM = rotatePart(finalM,[0,4,15],headObj,4,[headObj.totalAngle+1,0]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	
	// ======================= ear =======================

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, skinTexture);
	gl.uniform1i(uSamplerPointer, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	x = 4;
	y = 3;
	z = 14.5;
	
	glMatrix.mat4.fromScaling(scaleMatrix,[2/2, 2/2, 5/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[2].checked){
		//finalM = moveHead(finalM,[0,4,14.5]);
		finalM = rotatePart(finalM,[0,4,14.5],headObj,4,[90,-90]);
	}
	else if(radioChoise[9].checked){
		//finalM = moveHeadFullRotate(finalM,[0,4,14.5]);
		finalM = rotatePart(finalM,[0,4,14.5],headObj,4,[headObj.totalAngle+1,0]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[-x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	/* based on animation */
	if(radioChoise[2].checked){
		//finalM = moveHead(finalM,[0,4,14.5]);
		finalM = rotatePart(finalM,[0,4,14.5],headObj,4,[90,-90]);
	}
	else if(radioChoise[9].checked){
		//finalM = moveHeadFullRotate(finalM,[0,4,14.5]);
		finalM = rotatePart(finalM,[0,4,14.5],headObj,4,[headObj.totalAngle+headObj.stepAngle,0]);
	}
	else if(radioChoise[8].checked){
		finalM = dachshund(finalM,legObj,8)
	}
	else if(radioChoise[5].checked){
		finalM = rotatePart(finalM,[0,-8,7.5],feetObj,10,[90,0]);
	}
	
	if(radioChoise[7].checked){
		finalM = movePart(finalM,[0, 1, 0],bodyObj,14);
	}
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);
	
	
	// ======================= platform =======================
	
	
	x = 0;
	y = 0;
	z = -0.1;
	
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, floorTexture);
	gl.uniform1i(uSamplerPointer, 1);
	gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, textureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[30/2, 30/2, 0.1]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, reverseVertexBuffer.itemCount);
	
	
	// ======================= sky box =======================
	
	gl.bindBuffer(gl.ARRAY_BUFFER, reverseVertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, reverseTriangleVertices, gl.STATIC_DRAW);
	gl.vertexAttribPointer(vertexPositionAttributePointer, reverseVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	x = 0.0;
	y = 0.0;
	z = 0.0;
	
	gl.activeTexture(gl.TEXTURE2);
	gl.bindTexture(gl.TEXTURE_2D, skyTexture);
	gl.uniform1i(uSamplerPointer, 2);
	gl.bindBuffer(gl.ARRAY_BUFFER, skyTextureBuffer);
	gl.vertexAttribPointer(textureCoordinatesAttributePointer, skyTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
	glMatrix.mat4.fromScaling(scaleMatrix,[1000/2, 1000/2, 1000/2]);
	
	glMatrix.mat4.fromTranslation(translationMatrix,[x,y,z]);
	glMatrix.mat4.multiply(finalM,translationMatrix,scaleMatrix);
	
	gl.uniformMatrix4fv(modelUniformPointer, false, finalM); 
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.itemCount);

	scrollActive = false;
}

/* if total+step is out of the top or bot limit
   then the step is been multiplied by -1 to change direction
   Then adds to total the step and returns both of them
*/
function addTo(total, step, topLim, botLim){
	if(topLim < total+step || botLim > total+step){
		step *= -1;
		//console.log("topLim < total || botLim > total");
		//console.log(topLim," < ",total," || ",botLim," > ",total);
	}
	
	total += step;
	
	return [total,step];
}

/* rotates a part of a body
   originalPart: is the matrix of the body after scaled and translate
   center: is the center we want it to be [X,Y,Z] in order to move
   obj: is the part to find more attributes to use
   mod: how many other times this transformation is going to perform in roder
        to not change the values of totalAngle and step until every part is been rotated
   limit: the top and bot limit to rotate it
*/
function rotatePart(originalPart,center,obj,mod,limit){ // rotate
	// obj -> totalAngle,step,times
	var x = center[0];
	var y = center[1];
	var z = center[2];
	var tmp1 = obj.totalAngle;
	var tmp2 = obj.stepAngle;
	var rotAxis = obj.rotAxis;
	var topLim = limit[0];
	var botLim = limit[1];
	
	// rotate it and change it's values only if scroll or animation is in use
	if(requestID != 0 || scrollActive){
		//console.log("before totalAngle:",tmp1);
		//console.log("before step:",tmp2);
		[tmp1,tmp2] = addTo(tmp1,tmp2,topLim,botLim);
		//console.log("after totalAngle:",tmp1);
		//console.log("after step:",tmp2);
	}
	
	var rotation = glMatrix.mat4.create();
	var translation = glMatrix.mat4.create();

	glMatrix.mat4.fromTranslation(translation, [-x, -y, -z]);
	glMatrix.mat4.multiply(originalPart, translation, originalPart);
	glMatrix.mat4.fromRotation(rotation, tmp1 * Math.PI/180.0, rotAxis);
	glMatrix.mat4.multiply(originalPart, rotation, originalPart);
	glMatrix.mat4.fromTranslation(translation, [x, y, z]);
	glMatrix.mat4.multiply(originalPart, translation, originalPart);
	
	obj.times += 1;
	
	// if all parts been rotated then change the values
	if(obj.times%mod == 0){
		obj.totalAngle = tmp1;
		obj.stepAngle = tmp2;
	}
	
	return originalPart;
}

/* rescales a part of a body
   originalPart: is the matrix of the body after scaled and translate
   center: is the center we want it to be [X,Y,Z] in order to move
   obj: is the part to find more attributes to use
   mod: how many other times this transformation is going to perform in roder
        to not change the values until every part is been rescaled
   limit: the top and bot limit to rotate it
*/
function rescalePart(originalPart,center,obj,mod,limits){
	var x = center[0];
	var y = center[1];
	var z = center[2];
	var tmp1 = obj.totalScale;
	var tmp2 = obj.scaleStep;
	var max = limits[0];
	var min = limits[1];
	
	if(requestID != 0 || scrollActive){
		[tmp1,tmp2] = addTo(tmp1,tmp2,max,min);
	}
	
	var scaleAxis = [0,0,0];
	
	for(let i = 0; i < 3; i++)
		scaleAxis[i] = obj.scaleAxis[i] ? tmp1 : 1;
	//console.log("scaleAxis",scaleAxis);
	//console.log("tmp1",tmp1);
	//console.log("tmp2",tmp2);
	
	//var sX = obj.scaleAxis[0] ? tmp1 : 1;
	//var sY = obj.scaleAxis[1] ? tmp1 : 1;
	//var sZ = obj.scaleAxis[2] ? tmp1 : 1;
	
	
	
	var scale = glMatrix.mat4.create();
	var translation = glMatrix.mat4.create();

	glMatrix.mat4.fromTranslation(translation, [-x, -y, -z]);
	glMatrix.mat4.multiply(originalPart, translation, originalPart);
	//glMatrix.mat4.fromScaling(scale,[sX,sY,sZ]);
	glMatrix.mat4.fromScaling(scale,scaleAxis);
	glMatrix.mat4.multiply(originalPart, scale, originalPart);
	glMatrix.mat4.fromTranslation(translation, [x, y, z]);
	glMatrix.mat4.multiply(originalPart, translation, originalPart);
	
	obj.times += 1;
	if(obj.times%mod == 0){
		obj.totalScale = tmp1;
		obj.scaleStep = tmp2;
	}
	
	return originalPart;
}

/* moves a part of a body
   originalPart: is the matrix of the body after scaled and translate
   obj: is the part to find more attributes to use
   mod: how many other times this transformation is going to perform in roder
        to not change the values until every part is been rescaled
*/
function movePart(originalPart,direction,obj,mod){
	//var x = direction[0];
	//var y = direction[1];
	//var z = direction[2];
	var tmp1 = obj.totalMove;
	
	if(requestID != 0 || scrollActive){
		tmp1 += obj.moveStep;
	}
	
	
	var translation = glMatrix.mat4.create();

	glMatrix.mat4.fromTranslation(translation, [0, tmp1, 0]);
	glMatrix.mat4.multiply(originalPart, translation, originalPart);
	
	obj.times += 1;
	if(obj.times%mod == 0){
		obj.totalMove = tmp1;
	}
	
	
	return originalPart;
}

/* this function is only made for the dachshund animation because
   there was some issues using the general functions*/
function dachshund(originalPart,obj,mod){
	
	var tmp1 = obj.totalMove;
	
	if(requestID != 0 || scrollActive){
		tmp1 += obj.moveStep;
		//console.log("???",obj.moveStep);
	}
	
	var translation = glMatrix.mat4.create();

	glMatrix.mat4.fromTranslation(translation, [0, tmp1, 0]);
	glMatrix.mat4.multiply(originalPart, translation, originalPart);
	
	obj.times += 1;
	if(obj.times%mod == 0){
		obj.totalMove = tmp1;
	}
	
	return originalPart;
}



function startRotate(){
	
	if(requestID == 0)
		requestID = window.requestAnimationFrame(animationStep);
}

function stopRotate(){
	//totalZ = 0.0;
	//rotateAngle = 0.0;
	window.cancelAnimationFrame(requestID);
	requestID = 0;
}

function animationStep() {
	rotateAngle += 1; // degrees
	totalZ += 0.1;   // add to z axis
	drawScene();
	requestID = window.requestAnimationFrame(animationStep);
}




/* event listeners use this function to change "real-time" the canvas to change
   the angle view while reseting the neccesary values*/
function onPositionChange(event){
	totalZ = 0.0;
	totalDY = 0;
	totalDX = 0;
	rotateAngle = 0.0;
	if(requestID == 0)
		drawScene();
}

/* event listeners use this function to change "real-time" the canvas
   while reseting the neccesary values of the objects*/
function onTrickChange(event){
	// head
	headObj.totalAngle = 0;
	headObj.times = 0;
	
	// tail
	tailObj.totalAngle = 0;
	tailObj.times = 0;
	
	// leg
	legObj.totalAngle = 0;
	legObj.times = 0;
	legObj.stepAngle = 2;
	legObj.totalMove = 0;
	legObj.moveStep = 0.05;
	
	// feet
	feetObj.totalAngle = 0;
	feetObj.totalScale = 1.0;
	feetObj.times = 0;
	feetObj.stepAngle = -2;
	feetObj.totalMove = 0;
	feetObj.moveStep = -0.09;
	
	// body
	bodyObj.totalMove = 0;
	bodyObj.times = 0;
	bodyObj.totalScale = 1.0;
	bodyObj.scaleStep = 0.01;
	
	//console.log("===");
	if(requestID == 0)
		drawScene();
}

/* event listeners use this function to change "real-time" the canvas */
function changeDistance(event) {
	
	document.getElementById("viewDistance").value = parseFloat(event.target.value);
	drawScene();
}

/* event listeners use this function to change "real-time" the canvas */
function changeViewAngle(event) {
	
	document.getElementById("viewAngle").value = parseFloat(event.target.value);
	drawScene();
}


/* first time you click inside canvas */
function canvasMouseDown(event){
	mouseDown = true;
	bMouseX = event.clientX - boundingRect.left;
	bMouseY = boundingRect.bottom - event.clientY;
	dX = 0;
	dY = 0;
	//console.log("mouse down:",mouseDown);
	if (requestID != 0){
		beforeRequestID = requestID;
		stopRotate();
	}
}

/* when you use your mouse inside canvas while you hold on any click of the mouse*/
function cursorMove(event){
	if(mouseDown){
		aMouseX = event.clientX - boundingRect.left;
		aMouseY = boundingRect.bottom - event.clientY;
	
	
		dX = aMouseX - bMouseX;
		dY = aMouseY - bMouseY;
		//console.log("dx:",dX);
		//console.log("dy:",dY);
		
		totalDX += dX;
		totalDY += dY;
	
	
		//if(!requestID)
		//	drawScene();

		//console.log("aMouseX:",aMouseX);
		//console.log("aMouseY:",aMouseY);
		//console.log("bMouseX:",bMouseX);
		//console.log("bMouseY:",bMouseY);
	
		bMouseX = aMouseX;
		bMouseY = aMouseY;
		
		if(requestID == 0)
			drawScene();
	}
}

/* when you no longer click inside canvas*/
function canvasMouseUp(event){
	mouseDown = false;
	dX = 0;
	dY = 0;
	//totalDX = 0;
	//totalDY = 0;
	//console.log("mouse down:",mouseDown);
	if (beforeRequestID != 0){
		beforeRequestID = 0;
		startRotate();
	}
}

/* when using scroll wheel*/
function wheelActive(event){
	//addAngleTo(rotateTailAngle,addAngle,180,0);
	scrollActive = true;
	//if(requestID == 0)
	//	drawScene();
	//console.log("weel");
	
	var radioChoise = document.getElementById("trick").elements["step10"];
	
	
	if(requestID == 0)
		drawScene();
	else{ // not really worth it
		if(radioChoise[1].checked)
			[rotateTailAngle,addAngle] = addAngleTo(rotateTailAngle,addAngle,180,0);
		else if(radioChoise[2].checked)
			[rotateHeadAngle,addAngle] = addAngleTo(rotateHeadAngle,addAngle,90,-90);
	}
}


/* first time you touch canvas*/
function canvasTouchDown(event){
	touchDown = true;
	if (event.touches.length === 3) {
		touchDown = false;
	}
	else{
		bMouseX = event.touches[0].clientX;
		bMouseY = event.touches[0].clientY;
	}
	dX = 0;
	dY = 0;
	//console.log("touch down:",touchDown);
	//console.log("bMouseX:",bMouseX);
	//console.log("bMouseY:",bMouseY);
	if (requestID != 0){
		beforeRequestID = requestID;
		stopRotate();
	}
}

/* when you touch the canvas and move */
function touchMove(event){
	if (event.touches.length === 3) {
		scrollActive = true;
		
		if(requestID == 0)
			drawScene();
		
		//console.log('dx:', dX, 'dy:', dY);
	}
	else if(touchDown){
		aMouseX = event.touches[0].clientX;
		aMouseY = event.touches[0].clientY;
	
		
		dX = aMouseX - bMouseX;
		dY = aMouseY - bMouseY;
		//console.log("dx:",dX);
		//console.log("dy:",dY);
		
		totalDX += dX;
		totalDY += dY;
	
	
		//if(!requestID)
		//	drawScene();

		//console.log("aMouseX:",aMouseX);
		//console.log("aMouseY:",aMouseY);
		//console.log("bMouseX:",bMouseX);
		//console.log("bMouseY:",bMouseY);
	
		bMouseX = aMouseX;
		bMouseY = aMouseY;
		
		if(requestID == 0)
			drawScene();
	}
}

/* when a finger is removed from canvas */
function canvasTouchUp(event){
	touchDown = false;
	dX = 0;
	dY = 0;
	//totalDX = 0;
	//totalDY = 0;
	//console.log("touch down:",touchDown);
	if (beforeRequestID != 0){
		beforeRequestID = 0;
		startRotate();
	}
}

/* there's a help button that opens this alert */
function help(){
	alert("'P' or space: pause/play\n"+"'ENTER': submit\n"+"'Scroll': moves animation\n"+"'TAB': next animation\n"+"'SHIFT' + 'TAB': prev animation\n"+"Using 3 fingers inside canvas uses animation like scrolling\n"+"Παντελής Πρώιος 18390023");
}

document.addEventListener('DOMContentLoaded', function() {
    const rangeAngleView = document.getElementById('rangeAngleView');

	rangeAngleView.addEventListener('input', changeViewAngle);
	
	const rangeDistanceView = document.getElementById('rangeDistanceView');

	rangeDistanceView.addEventListener('input', changeDistance);
	
	const cameraViewForm = document.getElementById('cameraViewForm');
	
	cameraViewForm.addEventListener('change', onPositionChange);
	
	canvas = document.getElementById("sceneCanvas");
	
	canvas.addEventListener('mousedown',canvasMouseDown);
	window.addEventListener('mouseup',canvasMouseUp);
	canvas.addEventListener('mousemove',cursorMove);
	
	
	canvas.addEventListener('wheel',wheelActive);
	
	const trickForm = document.getElementById('trick');
	
	trickForm.addEventListener('change', onTrickChange);
	
	const inputElement = document.getElementById('myInput');

	window.addEventListener('keydown', function(event) {
		// Enter
		if (event.keyCode === 13) {
			onPositionChange(event);
		}
		else if(event.keyCode === 72)
			help();
		
		// P
		if (event.keyCode === 80 || event.keyCode === 32) {
			if (requestID)
				stopRotate();
			else
				startRotate();
		}
		
		if (event.key === 'Tab' && event.shiftKey) {
			let rc = trickForm.elements["step10"];
			let tmp;
			event.preventDefault();
			for (let i = 0; i < rc.length; i++) {
				if (rc[i].checked) {
					tmp = (i-1 < 0) ? rc.length-1 : (i-1);
					rc[tmp].checked = true;
					break;
				}
			}
			onTrickChange(event);
		}
		else if (event.key === 'Tab') { // 9 number
			let rc = trickForm.elements["step10"];
			event.preventDefault();
			for (let i = 0; i < rc.length; i++) {
				if (rc[i].checked) {
					rc[(i+1)%rc.length].checked = true;
					break;
				}
			}
			onTrickChange(event);
		}
		
	});
	
	canvas.onwheel = function(event){
		event.preventDefault();
	};

	canvas.onmousewheel = function(event){
		event.preventDefault();
	};
	
	canvas.ontouchstart = function(event){
		event.preventDefault();
		//console.log("okay!");
	};
	
	
	/*
    const body = document.body;

    canvas.addEventListener('mouseenter', function (event) {
		body.style.overflow = 'hidden' !important;
    });
    canvas.addEventListener('mouseleave', function (event) {
		body.style.overflow = 'auto';
    });
	*/
	
	canvas.addEventListener('touchstart',canvasTouchDown);
	window.addEventListener('touchcancel',canvasTouchUp);
	window.addEventListener('touchend',canvasTouchUp);
	canvas.addEventListener('touchmove',touchMove);
	

  });