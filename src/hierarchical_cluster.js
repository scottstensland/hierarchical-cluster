
// (function(exports) {

module.exports.do_clustering = function(environment_mode) { // functional inheritance Crockford 2008 pg 52

/*

	hierarchical clustering - bottom up approach (agglomerative)

*/

	var path = require('path');

	function resolvePath(str) {
	  if (str.substr(0, 2) === '~/') {
	    str = (process.env.HOME || process.env.HOMEPATH || process.env.HOMEDIR || process.cwd()) + str.substr(1);
	  }
	  return path.resolve(str);
	}

	// -------------------------------------------------------- //

	console.log("do_clustering  ....  environment_mode ", environment_mode);

	var that = {};
	var shared_utils;

	switch (environment_mode) {

	    case "nubia": // repository owner tinkering mode - ignore it 
	        shared_utils  = require(resolvePath("~/Dropbox/Documents/code/github/shared-utils/src/node_utils"));
	        break;

	    case "dev":
	        shared_utils  = require("shared-utils");	// get these modules from global install
	        break;

	    default :
	        shared_utils  = require("shared-utils");
	        break;
	};

	var get_random = shared_utils.get_random_in_range_inclusive_float;	// default
	var flavor_random = "float";			// default
	// var flavor_random = "integer";			// default
	var flavor_typed_array = Float32Array;	// default
	var print_output = {};

	var max_num_curves = 10;		// default values
	var max_samples = 5;	// default
	var min_value = 0.0;			// default
	var max_value = 10.0;			// default
	var flag_print = true;			// default

	var flag_are_curves_populated = false;
	var all_curves = {};	// main datastructure holding all curves and all their samples per curve
	// var all_curves = [];	// main datastructure holding all curves and all their samples per curve

	var curve_pairs_already_calculated = {}; // during distance calc record pairings of curve A and curve B
											 // to avoid redundant calc of same pair when visiting B once A has happened

	var hierarchical_cluster = {}; // bottom up tree start from each curve number, branching up through cluster layers
	var curr_cluster_depth = 0;
	// var centroid = "centroid";
	var key_num_curves_this_centroid = "num_curves_this_centroid";

	var all_clusters = [];
	var curr_num_cluster = 0;

	// ---

	var set_flavor_random_curves = function(desired_data_type) {

		switch (desired_data_type) {

			case "integer" :
				get_random = shared_utils.get_random_in_range_inclusive_int;
				flavor_typed_array = Int32Array;
				break;

			case "float" :
				get_random = shared_utils.get_random_in_range_inclusive_float;
				flavor_typed_array = Float32Array;
				break;

			default :
				var err_msg = "ERROR - invalid parm desired_data_type - legal values are 'integer' or 'float'";
				console.error(err_msg);
				process.exit(8);
		};

		flavor_random = desired_data_type;

	};		//		do NOT export - this is ONLY visible locally

	var no_op = function() {

		// place holder for a  no operation function
	}

	// ---

	function isNumber(n) {

		return !isNaN(parseFloat(n)) && isFinite(n);
	};


	var show_curves = function() {

		if (! flag_are_curves_populated) {

			console.error("ERROR - you have NOT populated curves yet ... try calling : gen_curves or ...");
			process.exit(8);
		}

		console.log("all_curves ", all_curves);

		var all_depths = Object.keys(all_curves);

		console.log("all_depths ", all_depths);

		return;

		var all_keys_this_depth = Object.keys(all_curves[curr_cluster_depth]);

		console.log("all_keys_this_depth ", all_keys_this_depth);

		return;

		var max_num_curves_this_depth = Object.keys(all_curves[given_cluster_depth]).length;


		console.log("\n_____________ show_curves  with ", 
					max_num_curves_this_depth, " curves, ", max_samples, " samples per curve\n");

		for (var curr_curve = 0; curr_curve < max_num_curves_this_depth; curr_curve++) {

			var curr_curve_samples = all_curves[given_cluster_depth][curr_curve];

			for (var curr_sample = 0; curr_sample < max_samples; curr_sample++) {

				var curr_value = curr_curve_samples[curr_sample];

				console.log(given_cluster_depth, curr_curve, curr_sample, curr_value);
			};
		};
	};
	that.show_curves = show_curves;

	// ---

	var gen_curves = function(given_spec) {	// assumption is this gets called once prior to calling launch_clustering

		var spec = {};

		if (typeof given_spec !== "undefined") {

			spec = given_spec;
		};

		max_num_curves = typeof spec.max_num_curves !== "undefined" ? spec.max_num_curves : max_num_curves;
		max_samples	   = typeof spec.max_samples    !== "undefined" ? spec.max_samples    : max_samples;
		min_value	   = typeof spec.min_value      !== "undefined" ? spec.min_value      : min_value;
		max_value	   = typeof spec.max_value      !== "undefined" ? spec.max_value      : max_value;
		flavor_random  = typeof spec.flavor_random  !== "undefined" ? spec.flavor_random  : flavor_random;
		flag_print	   = typeof spec.flag_print     !== "undefined" ? spec.flag_print     : flag_print;

		console.log(" max_num_curves ", max_num_curves, 
					" max_samples ", max_samples,
					" min_value ", min_value,
					" max_value ", max_value,
					" flavor_random ", flavor_random,
					" flag_print ", flag_print
					);

		print_output = flag_print ? console.log : no_op;

		if (0 !== curr_cluster_depth) {

			console.error("ERROR - you must call this method : gen_curves prior to calling launch_clustering");
			process.exit(8);
		}

		set_flavor_random_curves(flavor_random);	// set relevant methods based on chosen data type

		all_curves[curr_cluster_depth] = {}; // record placeholder object for current cluster depth counter

		for (var curr_curve = 0; curr_curve < max_num_curves; curr_curve++) {

			var curr_curve_samples = new flavor_typed_array(max_samples);

			for (var curr_sample = 0; curr_sample < max_samples; curr_sample++) {

				curr_curve_samples[curr_sample] = get_random(min_value, max_value);
			};

			all_curves[curr_cluster_depth][curr_curve] = curr_curve_samples;
		};
		flag_are_curves_populated = true;
	};
	that.gen_curves = gen_curves;

	// ---

	var calc_distance = function(left_curve_samples, right_curve_samples) {

		var total_distance = 0;
		var tmp_value;

		for (var curr_sample = 0; curr_sample < max_samples; curr_sample++) {

			var curr_value_left  =  left_curve_samples[curr_sample];
			var curr_value_right = right_curve_samples[curr_sample];

			tmp_value = (left_curve_samples[curr_sample] - right_curve_samples[curr_sample]);
			total_distance +=  Math.sqrt(tmp_value * tmp_value);
		};

		return total_distance;	
	};

	var set_random_seed = function(given_seed) {

		shared_utils.set_random_seed(given_seed);   // seed random algorithm so it repeats same random sequence acros runs
	};
	that.set_random_seed = set_random_seed;

	// ---

	var gen_pair_str = function(left_number, right_number) {

		return (left_number < right_number) ? (left_number  + ":" + right_number) :
											  (right_number + ":" + left_number);
	};

	// ---

	var read_file_retrieve_json = function(input_filename, given_options) {

		return shared_utils.read_file_retrieve_json(input_filename, given_options);
	};
	that.read_file_retrieve_json = read_file_retrieve_json;

	// ---

	var add_curve_to_cluster = function(source_curve, target_cluster, given_max_samples) {

		for (var index = 0; index < given_max_samples; index++) {

			target_cluster[index] += source_curve[index];
		};
	};
	that.add_curve_to_cluster = add_curve_to_cluster;

	// ---

	var divide_values_by_half_using_shift = function(given_typed_array, max_index) {

		for (var index = 0; index < max_index; index++) {

			// var value_pre = given_typed_array[index];

			// given_typed_array[index] = given_typed_array[index] >> 1;
			given_typed_array[index] /= 2.0;

			// console.log(value_pre, " and post ", given_typed_array[index]);
		}
	};

	// ---

	var launch_clustering = function() {		//		hierarchical agglomerative clustering

		console.log("_________ launch_clustering _____________");

		do {

			console.log("------------- TOP of level ", curr_cluster_depth, " -------------");

			shared_utils.release_all_prop_from_object(curve_pairs_already_calculated);

			hierarchical_cluster[curr_cluster_depth] = {};

			var next_cluster_depth = curr_cluster_depth + 1;

			all_curves[next_cluster_depth] = {}; // seed with empty object property as place holder

			var max_num_curves_this_depth = Object.keys(all_curves[curr_cluster_depth]).length;

			var all_keys_this_depth = Object.keys(all_curves[curr_cluster_depth]);

			for (var index_outer = 0; index_outer < max_num_curves_this_depth; index_outer++) {

				curr_curve = all_keys_this_depth[index_outer];

				var curr_curve_samples = all_curves[curr_cluster_depth][curr_curve];

				var min_distance = 99999.99;
				var closest_other_inner_curve;
				var curr_distance;

				// for (var curr_inner_curve = 0; curr_inner_curve < max_num_curves_this_depth; curr_inner_curve++) {
				for (var index_inner = 0; index_inner < max_num_curves_this_depth; index_inner++) {

					curr_inner_curve = all_keys_this_depth[index_inner];

					if (curr_inner_curve === curr_curve) continue; // skip over self

					var combo_key = gen_pair_str(curr_curve, curr_inner_curve);

					if (curve_pairs_already_calculated.hasOwnProperty(combo_key)) {

						//   already did calc on this pair of curves ... no need to redo same calculation

						curr_distance = curve_pairs_already_calculated[combo_key];

					} else {

						curr_distance = calc_distance(curr_curve_samples, all_curves[curr_cluster_depth][curr_inner_curve]);

						curve_pairs_already_calculated[combo_key] = curr_distance;
					}

					if (curr_distance < min_distance) {

						min_distance = curr_distance;
						closest_other_inner_curve = curr_inner_curve;
					}
				};

				// --- burrow down to find or create cluster to put current pair of curves --- //

				var curr_active_num_cluster;
				var curr_active_cluster;

				// we know current curve is NOT yet in a cluster ... BUT we do NOT know if other curve is or not

				if (hierarchical_cluster[curr_cluster_depth].hasOwnProperty(closest_other_inner_curve)) {

					//	OOOKKKKKK found closest_other_inner_curve in hierarchical_cluster

					curr_active_num_cluster = hierarchical_cluster[curr_cluster_depth][closest_other_inner_curve];

					curr_active_cluster = all_clusters[curr_active_num_cluster];

					// -----

					if (hierarchical_cluster[curr_cluster_depth].hasOwnProperty(curr_curve)) {

						// console.log("OK skip over as its already added from ", curr_cluster_depth, curr_curve,
						// 			" into cluster ", next_cluster_depth, curr_active_num_cluster);
					} else {

						curr_active_cluster[curr_curve] = curr_curve; // add current curve to existing cluster

						hierarchical_cluster[curr_cluster_depth][curr_curve]   = curr_active_num_cluster;

						add_curve_to_cluster(all_curves[curr_cluster_depth][curr_curve],
											 all_curves[next_cluster_depth][curr_active_num_cluster],
											 max_samples);

						divide_values_by_half_using_shift(all_curves[next_cluster_depth][curr_active_num_cluster],
															max_samples);
					}

				} else {	// add both curves of current pair into cluster as it has not seen this pair yet

					curr_active_cluster = {};
					curr_active_cluster["depth"]       = curr_cluster_depth; // display ONLY not functional
					curr_active_cluster["num_cluster"] = curr_num_cluster;   // display ONLY not functional

					curr_active_cluster[curr_curve] = curr_curve;
					curr_active_cluster[closest_other_inner_curve] = closest_other_inner_curve;

					all_clusters[curr_num_cluster] = curr_active_cluster;

					hierarchical_cluster[curr_cluster_depth][curr_curve]				= curr_num_cluster;
					hierarchical_cluster[curr_cluster_depth][closest_other_inner_curve]	= curr_num_cluster;

					// --- now build up curves for next clustering depth layer just as we did for initial clustering

					// allocate new curve to store this new cluster centroid

					var new_curr_cluster_curve = new flavor_typed_array(max_samples);
					/*
					// console.log("are freshly minted typed arrays seeded with values 0 or what");

					for (var index = 0; index < max_samples; index++) {

						if (0 === new_curr_cluster_curve[index]) {

							// OK

						} else {

							console.log("ERROR - seeing NON 0 value in freshly minted typed array ... seeing ",
								new_curr_cluster_curve[index]);
						}
					}
					*/

					// add into this new curve both curves of current pair of curves

					add_curve_to_cluster(all_curves[curr_cluster_depth][curr_curve],
										 new_curr_cluster_curve,
										 max_samples);

					add_curve_to_cluster(all_curves[curr_cluster_depth][closest_other_inner_curve],
										 new_curr_cluster_curve,
										 max_samples);

					divide_values_by_half_using_shift(new_curr_cluster_curve, max_samples);

					all_curves[next_cluster_depth][curr_num_cluster] = new_curr_cluster_curve;

					// ---

					curr_num_cluster++;
				};

				// console.log("BBBOT --------- hierarchical_cluster ", hierarchical_cluster);
				// console.log("BBBOT --------- all_clusters ", all_clusters);
			};
		
			curr_cluster_depth++;
			curr_num_cluster = 0;	// reset back to zero upon advance to next clustering depth


			// ---

			// console.log("\n\n--------- all_curves ", all_curves);

			// ---

			// console.log("BBBOT --------- all_curves ", all_curves);


			// var keys_all_curves = Object.keys(all_curves);
			
			// console.log("\n\nBOOOOTTTOMMM --------- keys_all_curves ", keys_all_curves);

			// var next_cluster_depth_values = all_curves[next_cluster_depth];
			var count_next_cluster_depth_values = Object.keys(all_curves[next_cluster_depth]).length;

			console.log("count_next_cluster_depth_values ---->", count_next_cluster_depth_values, "<----");

			// var Object.keys(all_curves).length > 1) {

		} while (count_next_cluster_depth_values > 1);

		// console.log("BBBOT --------- hierarchical_cluster ", hierarchical_cluster);
		// console.log("BBBOT --------- all_clusters ", all_clusters);
		// console.log("BBBOT --------- all_curves ", all_curves);

		// all_curves

		shared_utils.write_json_to_file("hierarchical_cluster.json", hierarchical_cluster, 'utf8');
		shared_utils.write_json_to_file("all_clusters.json", all_clusters, 'utf8');
		shared_utils.write_json_to_file("all_curves.json", all_curves, 'utf8');

		// ---
	};
	that.launch_clustering = launch_clustering;

	return that;
};

// })(typeof exports === "undefined" ? this["hierarchical_cluster"]={}: exports);

