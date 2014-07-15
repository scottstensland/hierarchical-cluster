#!/usr/bin/env node 

var environment_mode = process.argv[2] || "dev";

console.warn("running code in environment_mode: ", environment_mode);

// var shared_utils = require("../src/node_utils");
var hierarchical_cluster_obj = require("../src/hierarchical_cluster");

console.log("hierarchical_cluster_obj ", hierarchical_cluster_obj);

// ------------------------------------------------------------------------------------ //

var source_obj = {};

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
    max_num_curves : 17,     // number of curves
    // max_samples : 1000,       // number of data points per curve 
    max_samples : 3,       // number of data points per curve 
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
    max_samples : 100000,       // number of data points per curve 
    min_value : -1.0, 
    max_value : 1.0,
    // flavor_random : "integer",
    flavor_random : "float",
    // flag_print : true,
    flag_print : false,
};



// hierarchical_cluster.set_random_seed(17); // optional - comment out if you want new random sequence each run
                                          //             make this call to assure random sequence is same across runs


var random_seed = 17;

// hierarchical_cluster.gen_curves(setup_one);
// shared_utils.gen_curves(setup_one_N_half);
// shared_utils.gen_curves(setup_two);


// shared_utils.show_curves();

var hierarchical_cluster = hierarchical_cluster_obj.do_clustering(environment_mode);

hierarchical_cluster.set_random_seed(random_seed); // optional - comment out if you want new random sequence each run
                                                   // make this call to assure random sequence is same across runs

hierarchical_cluster.gen_curves(setup_one);

hierarchical_cluster.launch_clustering();

console.log("<><><>  <><><>  <><><>   end of processing   <><><>  <><><>  <><><>");
