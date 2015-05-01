svgPathParser= require("svg-path-parser");

var movingText;

jQuery("#vmap g").ready(function () {

	var vmapg= document.querySelector("#vmap g");

	var statePathes= vmapg.querySelectorAll("path");
	for( var i=0, statePathes_length= statePathes.length; i< statePathes_length; i++ ){
	    
	    var stateCode= statePathes[i].id.split("_").pop().toUpperCase();
	    vmapg.appendChild( createTextNode(statePathes[i],stateCode) );
	}

	document.querySelector("#vmap").addEventListener("mousemove",function(evt){

		if( movingText && movingText != null ){
			movingText.setAttribute("x", +movingText.dataset.startposX + ( evt.clientX - +movingText.dataset.dragposX ));
			movingText.setAttribute("y", +movingText.dataset.startposY + ( evt.clientY - +movingText.dataset.dragposY ));	
		}
	});

	document.querySelector("#vmap").addEventListener("mousedown",function(evt){
		if( movingText && evt.target != movingText){
			movingText= null;
		}
	});
});

function createTextNode( path, text ){

	var textNode = document.createElementNS("http://www.w3.org/2000/svg", "text");

	var centroid= centroidOfPath( path.getAttribute("d") );
	textNode.setAttribute("x", centroid.x  );
	textNode.setAttribute("y", centroid.y );
	textNode.setAttribute("style", "fill:#fff;stroke:#fff;border:solid 1px #fff;padding:2px 5px" );
	textNode.dataset.drag= "false";

	textNode.setAttribute("draggable","true");

	textNode.textContent= text;
	textNode.addEventListener("dragstart",function(evt){
		console.log(evt.clientX + " - " + evt.target.getAttribute("x"));
		console.log(evt);
	});
	textNode.addEventListener("mousedown",function(evt){

		if( this.dataset.drag == "false" ){
			this.dataset.dragposX= evt.clientX;
			this.dataset.dragposY= evt.clientY;
		
			this.dataset.startposX= this.getAttribute("x");
			this.dataset.startposY= this.getAttribute("y");
			this.dataset.drag= "true";
			movingText= this;
			console.log("movingText");
			console.log(movingText);

		}else{
			this.dataset.drag= "false";
			movingText= "vide";
		}
	});

	return textNode;
}

function centroidOfPath( path ){

	var parsedPath= svgPathParser(path);

	var origin= { x: parsedPath[0].x, y: parsedPath[0].y };
	var pathPartCentroids= [];
	var totalLength= 0;
	for( var i=1; i< parsedPath.length - 1; i++){

		var pathPart= parsedPath[i];

		if(pathPart.code !="c")
			break;

		var pathPartCentroid= centroidOfPathPart([ [0,0], [ pathPart.x1, pathPart.y1 ], [ pathPart.x2, pathPart.y2 ], [ pathPart.x, pathPart.y ] ]); 

		pathPartCentroid.x += origin.x;
		pathPartCentroid.y += origin.y;

		//placePoint(pathPartCentroid);

		pathPartCentroid={ centroid: pathPartCentroid, distance: norm( pathPartCentroid, origin) } 
		pathPartCentroids.push(pathPartCentroid);

		console.log(pathPartCentroid);

		totalLength+= pathPartCentroid.distance;

		origin.x+= pathPart.x;
		origin.y+= pathPart.y;
	}

	var centroid= {x:0,y:0};
	pathPartCentroids.forEach(function( pathPart ){
		centroid.x += pathPart.centroid.x * pathPart.distance / totalLength;
		centroid.y += pathPart.centroid.y * pathPart.distance / totalLength;
	});
	return centroid;
}

function centroidOfPathPart( points ){

	var centroid= {x:0,y:0};
	points.map(function(point){
		centroid.x+= point[0];
		centroid.y+= point[1];
	});
	centroid.x/= points.length;
	centroid.y/= points.length;

	return centroid;
}

function placePoint( point ){

	var container= document.querySelector('#test');

	var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	circle.setAttribute("style", "stroke:#006600; fill:#00cc00" );
	circle.setAttribute("r", 5 );
	circle.setAttribute("cx", point.x  );
	circle.setAttribute("cy", point.y );

	container.appendChild(circle);
}

function norm( point1, point2 )
{
  var xs = 0;
  var ys = 0;

  xs = point2.x - point1.x;
  xs = xs * xs;

  ys = point2.y - point1.y;
  ys = ys * ys;

  return Math.sqrt( xs + ys );
}