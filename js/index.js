w=a.width=innerWidth
h=a.height=innerHeight
g=a.getContext('webgl')||a.getContext('experimental-webgl')
g.enable(g.DEPTH_TEST)
g.depthFunc(g.LEQUAL)

// Create a shader program
$prog(g, [vertexShader, fragmentShader])

// Create a position buffer for the vertex shader
posBuf = $buf([1,1,0,-1,1,0,1,-1,0,-1,-1,0])

// Create an attribute for the position buffer
pos = $attr("pos")

// This is the animation loop:
~function scene(time) {
	// slow things down a bit
	time/=1e3 

	// clear screen
	g.clearColor(1/5, 1/5, 1/5, 1)
	g.clear(g.COLOR_BUFFER_BIT | g.DEPTH_BUFFER_BIT)

	// bind attributes to buffers
	$bind(pos, posBuf, 3)
	
	// set uniforms
	$uni("time", time)
	$uniV("resolution", [w,h])

	// draw
	g.drawArrays(g.TRIANGLE_STRIP,0,4)
	
	// next frame :-)
	requestAnimationFrame(scene)
}(0)