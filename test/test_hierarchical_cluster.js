#!/usr/bin/env node 

var environment_mode = process.argv[2] || "dev";

console.warn("running code in environment_mode: ", environment_mode);

// var shared_utils = require("../src/node_utils");
var hierarchical_cluster_obj = require("../src/hierarchical_cluster");

console.log("hierarchical_cluster_obj ", hierarchical_cluster_obj);

// ------------------------------------------------------------------------------------ //

var source_obj = {};


var setup_half = {

    // max_num_curves : 5000,     // number of curves
    max_num_curves : 2,     // number of curves
    // max_samples : 1000,       // number of data points per curve 
    max_samples : 2,       // number of data points per curve 
    min_value : -5, 
    max_value : 5,
    // flavor_random : "integer",
    flavor_random : "float",
    flag_print : true,
    // flag_print : false,
};


var setup_one = {

    // max_num_curves : 5000,     // number of curves
    max_num_curves : 5,     // number of curves
    // max_samples : 1000,       // number of data points per curve 
    max_samples : 10,       // number of data points per curve 
    min_value : -5, 
    max_value : 5,
    // flavor_random : "integer",
    flavor_random : "float",
    flag_print : true,
    // flag_print : false,
};


var setup_one_N_half = {

    // max_num_curves : 5000,     // number of curves
    max_num_curves : 3000,     // number of curves
    // max_num_curves : 17,     // number of curves
    // max_samples : 1000,       // number of data points per curve 
    max_samples : 3000,       // number of data points per curve 
    min_value : -5, 
    max_value : 5,
    // flavor_random : "integer",
    flavor_random : "float",
    flag_print : true,
    // flag_print : false,
};


var setup_two = {

    // max_num_curves : 5000,     // number of curves
    max_num_curves : 500,     // number of curves
    // max_samples : 1000,       // number of data points per curve 
    max_samples : 30000,       // number of data points per curve 
    min_value : -1.0, 
    max_value : 1.0,
    // flavor_random : "integer",
    flavor_random : "float",
    // flag_print : true,
    flag_print : false,
};

var setup_iii = {

    // max_num_curves : 5000,     // number of curves
    max_num_curves : 150,     // number of curves
    // max_samples : 1000,       // number of data points per curve 
    max_samples : 30000,       // number of data points per curve 
    min_value : -1.0, 
    max_value : 1.0,
    // flavor_random : "integer",
    flavor_random : "float",
    // flag_print : true,
    flag_print : false,
};

var random_seed = 17;

var hierarchical_cluster = hierarchical_cluster_obj.do_clustering(environment_mode);

hierarchical_cluster.set_random_seed(random_seed); // optional - comment out if you want new random sequence each run
                                                   // make this call to assure random sequence is same across runs



hierarchical_cluster.gen_curves(setup_half);
// hierarchical_cluster.gen_curves(setup_one);
// hierarchical_cluster.gen_curves(setup_one_N_half);
// hierarchical_cluster.gen_curves(setup_two);
// hierarchical_cluster.gen_curves(setup_iii);


// hierarchical_cluster.show_curves();

// return;

hierarchical_cluster.launch_clustering();

// hierarchical_cluster.show_curves();


console.log("hierarchical_cluster ", hierarchical_cluster.read_file_retrieve_json("hierarchical_cluster.json", 'utf8'));
console.log("all_clusters ", hierarchical_cluster.read_file_retrieve_json("all_clusters.json", 'utf8'));
console.log("all_curves ", hierarchical_cluster.read_file_retrieve_json("all_curves.json", 'utf8'));


console.log("<><><>  <><><>  <><><>   end of processing   <><><>  <><><>  <><><>");
