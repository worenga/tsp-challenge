#pragma once

#include <string>

#include "tsp_distance_matrix.h"
#include "tsp_run_config.h"

#include <geneial/core/population/chromosome/MultiValueChromosome.h>

namespace tsp_challenge
{


using namespace geneial;
using namespace geneial::population::chromosome;

TSPRunConfig TSPReadStdin();

void TSPOutputProgress(const int total_iterations, const int current_iteration, const std::vector<int>& bestPermutation);

void TSPOutputError(const std::string& error_message);

void TSPOutputFinalResult(const std::vector<int>& bestPermutation);

}
