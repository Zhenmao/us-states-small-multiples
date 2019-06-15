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

	const svg = d3
		.select(".chart")
		.style("max-width", svgWidth)
		.attr("viewBox", [0, 0, svgWidth, svgHeight]);

	const g = svg
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	////////////////////////////////////////////////////////////
	//// Render ////////////////////////////////////////////////
	////////////////////////////////////////////////////////////
	const grid = g
		.selectAll(".grid")
		.data(data)
		.join("g")
		.attr("class", "grid")
		.attr("transform", d => `translate(${xGrid(d.x)},${yGrid(d.y)})`);

	const gGrid = grid
		.append("g")
		.attr("transform", `translate(${gridMargin.left},${gridMargin.top})`);

	gGrid
		.append("text")
		.attr("class", "grid-title")
		.attr("x", smallWidth / 2)
		.attr("y", -4)
		.attr("text-anchor", "middle")
		.text(d => d.abbr);

	gGrid
		.append("rect")
		.attr("class", "grid-rect")
		.attr("width", smallWidth)
		.attr("height", smallHeight);
});
