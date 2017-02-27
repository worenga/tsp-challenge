
project (geneial_tsp_challenge_solver CXX)

set( PROJECT_FULLNAME "GeneiAL TSP Solver for IT-talents TSP Challenge" )
set( PROJECT_DESCRIPTION "A backend TSP Solver for for the tsp challenge using genetic algorithm" )

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED on)

cmake_minimum_required(VERSION 3.5)


add_executable (geneial_tsp_solver
  src/tsp_solver.cpp
  src/tsp_distance_matrix.cpp
  src/tsp_io.cpp
  src/main.cpp
)

target_link_libraries (geneial_tsp_solver LINK_PUBLIC geneial -lpthread)
