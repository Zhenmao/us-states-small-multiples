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
});
