#pragma once

#include "tsp_distance_matrix.h"
#include "tsp_run_config.h"
#include "tsp_distance_matrix.h"

namespace tsp_challenge {

using iterationcb = std::function<void(const int,const int,const std::vector<int>&)>;

std::vector<int> TSPSolve(const TSPRunConfig & cfg, iterationcb cb);

}
