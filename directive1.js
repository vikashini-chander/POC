/* D3.js+Angular.JS Demo. Copyright (c) 2014 Uri Shaked, MIT Licence. */

'use strict';

angular.module('D3Demo').directive('circlePaking', function () {
	return {
		restrict : 'AE',
		template : "<svg width='800' height='800'></svg> <div id='description' style='position: fixed; top: 40%; right: 0%; width:300px;'></div>",
		link: function (scope, element, attr) {
				
			document.getElementById('description').innerHTML = '<h3>Summary</h3>BNYM does not currently have any local depositaries established in Denmark.  If you wish to explore the possibility of a BNYM Entity providing these types of depositary services in Denmark, please contact the BNYM legal team for further information and advice on a case-by-case basis.'
			var svg = d3.select("svg"),
				margin = 20,
				diameter = +svg.attr("width"),
				g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

			var color = d3.scaleLinear()
				.domain([1,2,3,4,5])
				.range(["red", "orange", "yellow"])
				.interpolate(d3.interpolateHcl);

			var color2 = d3.scaleLinear()
				.domain([1,2,3,4,5])
				.range(["red", "orange", "yellow"])
				.interpolate(d3.interpolateHcl);
				

			var pack = d3.pack()
				.size([diameter - margin, diameter - margin])
				.padding(2);

			d3.json('./circlePacking.json', function(error, root) {
			  if (error) throw error;

			  // root = d3.hierarchy(root)
				//   .sum(function(d) { return d.size; })
				//   .sort(function(a, b) { return b.value - a.value; });
				root = d3.hierarchy(root)
				  .sum(function(d) { return d.size; });

			  var focus = root,
				  nodes = pack(root).descendants(),
				  view;

				

			  var circle = g.selectAll("circle")
				.data(nodes)
				.enter().append("circle")
				  // .attr("class", function(d) { 
					// 	return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; 
					// })
				  .style("fill", function(d) { 
						return d.children && d.depth === 2 ? color(d.data.finalSize) : d.depth === 3? color2(d.data.finalSize):null ; 
					})
					.on("click", function(d) { if (focus !== d) {
						zoom(d);
						console.log(d);
					//	if(d.depth === 3){
						if(typeof d.data.details !== 'undefined') {
							console.log(' message for ' + d.data.details);


							document.getElementById('description').innerHTML='<h3>' + d.data.name+ '</h3>' + d.data.details.body;
							document.getElementById('description').style.display= 'block';

						} else{
							document.getElementById('description').style.display= 'none';
						}
						d3.event.stopPropagation();

					}});

			  var text = g.selectAll("text")
				.data(nodes)
				.enter().append("text")
					.attr("class", "label")
				  .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
				  .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
				  .text(function(d) { return d.data.name; });

			  var node = g.selectAll("circle,text");

			  svg
				  .style("background", color('300'))
				  .on("click", function() { zoom(root); });
				zoomTo([root.x, root.y, root.r * 2 + margin]);
					

			  function zoom(d) {
				var focus0 = focus; focus = d;

				var transition = d3.transition()
					.duration(d3.event.altKey ? 7500 : 750)
					.tween("zoom", function(d) {
					  var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
					  return function(t) { zoomTo(i(t)); };
					});

				transition.selectAll("text")
				  .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
					.style("fill-opacity", function(d) { return d.parent === focus ? 10 : 0; })
					.on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
					.on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
			  }

			  function zoomTo(v) {
				var k = diameter / v[2]; view = v;
				node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
				circle.attr("r", function(d) { return d.r * k; });
			  }
			});
		}
	};
});