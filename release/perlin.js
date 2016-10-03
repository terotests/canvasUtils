// http://clockworkchilli.com/blog/6_procedural_textures_in_javascript

// ease curve
var fade = function(t)
{
	return t * t * t * (t * (t * 6 - 15) + 10);
};

// linear interpolation
var mix = function(a, b, t)
{
	return (1 - t) * a + t * b;
};
var grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];

// a special dot product function used in perlin noise calculations
var perlinDot = function(g, x, y, z)
{
	return g[0] * x + g[1] * y + g[2] * z;
};	

var NoiseGenerator = function(numOctaves, attenuation, roughness, startingOctave)
{
	var p = [];
	for (var i = 0; i < 256; i++)
	{
		p[i] = Math.floor(Math.random() * 256);
	}

	// To remove the need for index wrapping, double the permutation table length
	var perm = [];
	for (i = 0; i < 512; i++)
	{
		perm[i] = p[i & 255];
	}


    var n = function(x, y, z)
	{
		// Find unit grid cell containing point
		var X = Math.floor(x);
		var Y = Math.floor(y);
		var Z = Math.floor(z);
		
		// Get relative xyz coordinates of point within that cell
		x = x - X;
		y = y - Y;
		z = z - Z;
		
		// Wrap the integer cells at 255
		X &= 255;
		Y &= 255;
		Z &= 255;
		
		// Calculate a set of eight hashed gradient indices
		var gi000 = perm[X + perm[Y + perm[Z]]] % 12;
		var gi001 = perm[X + perm[Y + perm[Z + 1]]] % 12;
		var gi010 = perm[X + perm[Y + 1 + perm[Z]]] % 12;
		var gi011 = perm[X + perm[Y + 1 + perm[Z + 1]]] % 12;
		var gi100 = perm[X + 1 + perm[Y + perm[Z]]] % 12;
		var gi101 = perm[X + 1 + perm[Y + perm[Z + 1]]] % 12;
		var gi110 = perm[X + 1 + perm[Y + 1 + perm[Z]]] % 12;
		var gi111 = perm[X + 1 + perm[Y + 1 + perm[Z + 1]]] % 12;
		
		// Calculate noise contributions from each of the eight corners
		var n000 = perlinDot(grad3[gi000], x, y, z);
		var n100 = perlinDot(grad3[gi100], x - 1, y, z);
		var n010 = perlinDot(grad3[gi010], x, y - 1, z);
		var n110 = perlinDot(grad3[gi110], x - 1, y - 1, z);
		var n001 = perlinDot(grad3[gi001], x, y, z - 1);
		var n101 = perlinDot(grad3[gi101], x - 1, y, z - 1);
		var n011 = perlinDot(grad3[gi011], x, y - 1, z - 1);
		var n111 = perlinDot(grad3[gi111], x - 1, y - 1, z - 1);
		
		// Compute the ease curve value for each of x, y, z
		var u = fade(x);
		var v = fade(y);
		var w = fade(z);
		
		// Interpolate (along x) the contributions from each of the corners
		var nx00 = mix(n000, n100, u);
		var nx01 = mix(n001, n101, u);
		var nx10 = mix(n010, n110, u);
		var nx11 = mix(n011, n111, u);
		
		// Interpolate the four results along y
		var nxy0 = mix(nx00, nx10, v);
		var nxy1 = mix(nx01, nx11, v);
		
		// Interpolate the last two results along z
		return mix(nxy0, nxy1, w);
	};

	this.noise = function (x, y, z)
	{
		var a = Math.pow(attenuation, -startingOctave);
		var f = Math.pow(roughness, startingOctave);
		var m = 0;
		for (var i = startingOctave; i < numOctaves + startingOctave; i++)
		{
			m += n(x * f, y * f, z * f) * a;
			a /= attenuation;
			f *= roughness;
		}
		return m / numOctaves;
	};		
};

var generateTexture = function (size, data)
{
	var canvas = document.createElement('canvas');
	canvas.width = canvas.height = size;
	var context = canvas.getContext('2d');
	var imageDataObject = context.createImageData(size, size);
	var imageData = imageDataObject.data;
	for (var i = 0; i < size * size * 4; i += 4)
	{
		imageData[i] = data.baseColor[0];
		imageData[i + 1] = data.baseColor[1];
		imageData[i + 2] = data.baseColor[2];
		imageData[i + 3] = data.baseColor[3];
	}
	for (i = 0; i < data.noise.length; i++)
	{
		var k = data.noise[i];
		var n = new NoiseGenerator(k.numOctaves, k.attenuation, k.roughness, k.startingOctave);
		var p = 0;
		for (var y = 0; y < size; y++)
		{
			for (var x = 0; x < size; x++)
			{
				// generate noise at current x and y coordinates (z is set to 0)
				var v = Math.abs(n.noise(x / size, y / size, 0));
				for (var c = 0; c < 3; c++, p++)
				{
					imageData[p] = Math.floor(imageData[p] + v * k.color[c] *  k.color[3] / 255);
				}
				p++;
			}
		}
	}
	context.putImageData(imageDataObject, 0, 0);
	return canvas;
};	
