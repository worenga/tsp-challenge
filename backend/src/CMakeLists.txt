add_executable (geneial_tsp_solver tsp_solver.cpp tsp_node_distance_table.cpp tsp_io.cpp main.cpp)

target_link_libraries (geneial_tsp_solver LINK_PUBLIC geneial -lpthread)
