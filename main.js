Promise.all([
	d3.csv("us-state-region-grid.csv"),
	d3.csv("unemployment-rate-by-state.csv")
]).then(([us, unemployment]) => {
	////////////////////////////////////////////////////////////
	//// Process Data //////////////////////////////////////////
	////////////////////////////////////////////////////////////
	const data = d3.range(us.length).map(i => ({
		name: us[i]["State Name"],
		abbr: us[i]["State Abbreviation"],
		region: us[i]["Region Name"],
		x: +us[i].X,
		y: +us[i].Y,
		values: unemployment.columns.slice(1).reduce((values, year) => {
			values.push([+year, +unemployment[i][year]]);
			return values;
		}, [])
	}));
	console.log(data);

	////////////////////////////////////////////////////////////
	//// Setup /////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	const margin = { top: 8, right: 8, bottom: 32, left: 56 };
	const gridWidth = 80;
	const gridHeight = 80;
	const gridMargin = { top: 20, right: 4, bottom: 4, left: 4 };
	const smallWidth = gridWidth - gridMargin.left - gridMargin.right;
	const smallHeight = gridHeight - gridMargin.top - gridMargin.bottom;
	const totalColumns = d3.max(data, d => d.x) + 1;
	const totalRows = d3.max(data, d => d.y) + 1;
	const width = totalColumns * gridWidth;
	const height = totalRows * gridHeight;
	const svgWidth = width + margin.left + margin.right;
	const svgHeight = height + margin.top + margin.bottom;

	const xGrid = d3
		.scaleBand()
		.domain(d3.range(totalColumns))
		.range([0, width]);

	const yGrid = d3
		.scaleBand()
		.domain(d3.range(totalRows))
		.range([0, height]);

	const x = d3
		.scalePoint()
		.domain(data[0].values.map(d => d[0]))
		.range([0, smallWidth]);

	const y = d3
		.scaleLinear()
		.domain([
			d3.min(data, d => d3.min(d.values, e => e[1])),
			d3.max(data, d => d3.max(d.values, e => e[1]))
		])
		.range([smallHeight, 0])
		.nice();

	const line = d3
		.line()
		.x(d => x(d[0]))
		.y(d => y(d[1]));

	const svg = d3
		.select(".chart")
		.style("max-width", svgWidth)
		.attr("viewBox", [0, 0, svgWidth, svgHeight]);

	const defs = svg.append("defs");

	const g = svg
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	////////////////////////////////////////////////////////////
	//// Render ////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	// Grid
	const grid = g
		.selectAll(".grid")
		.data(data)
		.join("g")
		.attr("class", "grid")
		.attr("transform", d => `translate(${xGrid(d.x)},${yGrid(d.y)})`);

	const gGrid = grid
		.append("g")
		.attr("transform", `translate(${gridMargin.left},${gridMargin.top})`);

	// State abbreviation
	gGrid
		.append("text")
		.attr("class", "grid-title")
		.attr("x", smallWidth / 2)
		.attr("y", -4)
		.attr("text-anchor", "middle")
		.text(d => d.abbr);

	// Frame
	gGrid
		.append("rect")
		.attr("class", "grid-rect")
		.attr("width", smallWidth)
		.attr("height", smallHeight);

	// Line
	gGrid
		.append("path")
		.attr("class", "grid-path")
		.attr("d", d => line(d.values));

	// Axis
	defs
		.append("g")
		.attr("class", "axis")
		.attr("id", "x-axis")
		.attr("transform", "translate(-0.5,0)")
		.call(d3.axisBottom(x))
		.call(g => g.select(".domain").remove())
		.call(g =>
			g
				.selectAll(".tick")
				.filter((d, i, n) => i !== 0 && i !== n.length - 1)
				.remove()
		)
		.call(g =>
			g.selectAll(".tick").attr("text-anchor", (d, i) => (i ? "end" : "start"))
		);

	defs
		.append("g")
		.attr("class", "axis")
		.attr("id", "y-axis")
		.attr("transform", "translate(0,-0.5)")
		.call(d3.axisLeft(y).ticks(4))
		.call(g => g.select(".domain").remove());

	// X axis is drawn for the last state of each column
	g.append("g")
		.selectAll(".x-axis")
		.data(
			d3
				.nest()
				.key(d => d.x)
				.sortValues((a, b) => d3.descending(a.y, b.y))
				.rollup(l => l[0])
				.entries(data)
				.map(d => d.value)
		)
		.join("g")
		.attr("class", "x-axis")
		.append("use")
		.attr("xlink:href", "#x-axis")
		.attr(
			"transform",
			d =>
				`translate(${xGrid(d.x) + gridMargin.left},${yGrid(d.y) +
					gridMargin.top +
					smallHeight})`
		);

	// Y axis is drawn for the first state of each row
	g.append("g")
		.selectAll(".y-axis")
		.data(
			d3
				.nest()
				.key(d => d.y)
				.sortValues((a, b) => d3.ascending(a.x, b.x))
				.rollup(l => l[0])
				.entries(data)
				.map(d => d.value)
		)
		.join("g")
		.attr("class", "y-axis")
		.append("use")
		.attr("xlink:href", "#y-axis")
		.attr(
			"transform",
			d =>
				`translate(${xGrid(d.x) + gridMargin.left},${yGrid(d.y) +
					gridMargin.top})`
		);
});
